import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Target, Clock, Award, Calendar, ArrowRight, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/StatCard';
import { SubjectBadge } from '@/components/SubjectBadge';
import { useApp } from '@/contexts/AppContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

export default function Statistics() {
  const { data } = useApp();

  const stats = useMemo(() => {
    const totalTests = data.testResults.length;
    const totalQuestions = data.questions.length;
    
    // Average score
    const averageScore = totalTests > 0
      ? Math.round(data.testResults.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0) / totalTests)
      : 0;

    // Best score
    const bestScore = totalTests > 0
      ? Math.round(Math.max(...data.testResults.map(r => (r.score / r.totalQuestions) * 100)))
      : 0;

    // Total time spent
    const totalTime = data.testResults.reduce((acc, r) => acc + r.timeTaken, 0);
    const totalTimeFormatted = totalTime > 3600 
      ? `${Math.floor(totalTime / 3600)}h ${Math.floor((totalTime % 3600) / 60)}m`
      : `${Math.floor(totalTime / 60)}m`;

    // Questions answered
    const questionsAnswered = data.testResults.reduce((acc, r) => acc + r.totalQuestions, 0);

    return { totalTests, totalQuestions, averageScore, bestScore, totalTimeFormatted, questionsAnswered };
  }, [data]);

  // Score trend data (last 10 tests)
  const scoreTrend = useMemo(() => {
    return data.testResults.slice(-10).map((result, idx) => ({
      test: `Test ${idx + 1}`,
      score: Math.round((result.score / result.totalQuestions) * 100),
      date: new Date(result.date).toLocaleDateString(),
    }));
  }, [data.testResults]);

  // Subject performance
  const subjectPerformance = useMemo(() => {
    return data.subjects.map(subject => {
      const subjectQuestions = data.questions.filter(q => q.subjectId === subject.id);
      const totalAnswered = subjectQuestions.reduce((acc, q) => acc + q.timesAnswered, 0);
      const totalCorrect = subjectQuestions.reduce((acc, q) => acc + q.timesCorrect, 0);
      const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
      
      return {
        name: subject.name,
        color: subject.color,
        accuracy,
        questions: subjectQuestions.length,
        answered: totalAnswered,
      };
    }).filter(s => s.answered > 0).sort((a, b) => b.accuracy - a.accuracy);
  }, [data]);

  // Weak chapters
  const weakChapters = useMemo(() => {
    return data.chapters.map(chapter => {
      const chapterQuestions = data.questions.filter(q => q.chapterId === chapter.id);
      const totalAnswered = chapterQuestions.reduce((acc, q) => acc + q.timesAnswered, 0);
      const totalCorrect = chapterQuestions.reduce((acc, q) => acc + q.timesCorrect, 0);
      const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
      const subject = data.subjects.find(s => s.id === chapter.subjectId);
      
      return {
        name: chapter.name,
        subjectName: subject?.name || '',
        subjectColor: subject?.color || '',
        accuracy,
        answered: totalAnswered,
      };
    }).filter(c => c.answered > 0).sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
  }, [data]);

  if (data.testResults.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
        <h1 className="text-2xl font-bold mb-2">No Statistics Yet</h1>
        <p className="text-muted-foreground mb-6">
          Take some tests to start tracking your progress and see detailed statistics.
        </p>
        <Button asChild>
          <Link to="/take-test">
            Take Your First Test
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">Statistics</h1>
        <p className="text-muted-foreground">Track your progress and identify areas to improve</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tests Taken"
          value={stats.totalTests}
          icon={<Target className="h-6 w-6" />}
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <StatCard
          title="Best Score"
          value={`${stats.bestScore}%`}
          icon={<Award className="h-6 w-6" />}
        />
        <StatCard
          title="Time Studied"
          value={stats.totalTimeFormatted}
          icon={<Clock className="h-6 w-6" />}
        />
      </div>

      {/* Score Trend Chart */}
      {scoreTrend.length > 1 && (
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold mb-4">Score Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreTrend}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="test" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`${value}%`, 'Score']}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Subject Performance */}
        {subjectPerformance.length > 0 && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-4">Subject Performance</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Accuracy']}
                  />
                  <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                    {subjectPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Weak Chapters */}
        {weakChapters.length > 0 && (
          <div className="rounded-xl border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-4">Areas to Improve</h2>
            <div className="space-y-3">
              {weakChapters.map((chapter, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-muted/30 border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{chapter.name}</p>
                      <SubjectBadge 
                        name={chapter.subjectName} 
                        color={chapter.subjectColor} 
                        size="sm" 
                      />
                    </div>
                    <span className={`text-lg font-bold ${
                      chapter.accuracy >= 70 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {chapter.accuracy}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        chapter.accuracy >= 70 ? 'bg-warning' : 'bg-destructive'
                      }`}
                      style={{ width: `${chapter.accuracy}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {chapter.answered} questions answered
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Test History */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="text-lg font-semibold mb-4">Recent Tests</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Questions</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Score</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {data.testResults.slice(-10).reverse().map((result) => {
                const percentage = Math.round((result.score / result.totalQuestions) * 100);
                const time = result.timeTaken;
                const timeStr = time > 60 
                  ? `${Math.floor(time / 60)}m ${time % 60}s`
                  : `${time}s`;
                
                return (
                  <tr key={result.id} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(result.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">{result.totalQuestions}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${
                        percentage >= 80 ? 'text-success' :
                        percentage >= 60 ? 'text-warning' :
                        'text-destructive'
                      }`}>
                        {result.score}/{result.totalQuestions} ({percentage}%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{timeStr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
