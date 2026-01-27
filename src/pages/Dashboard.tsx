import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Clock, 
  Plus, 
  Play,
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/StatCard';
import { SubjectBadge } from '@/components/SubjectBadge';
import { useApp } from '@/contexts/AppContext';

export default function Dashboard() {
  const { data } = useApp();
  
  const totalQuestions = data.questions.length;
  const totalTests = data.testResults.length;
  
  const averageScore = totalTests > 0
    ? Math.round(data.testResults.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0) / totalTests)
    : 0;
  
  const recentTests = data.testResults.slice(-5).reverse();
  
  // Get weak areas (subjects with lowest accuracy)
  const subjectStats = data.subjects.map(subject => {
    const subjectQuestions = data.questions.filter(q => q.subjectId === subject.id);
    const totalAnswered = subjectQuestions.reduce((acc, q) => acc + q.timesAnswered, 0);
    const totalCorrect = subjectQuestions.reduce((acc, q) => acc + q.timesCorrect, 0);
    const accuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;
    return { ...subject, accuracy, questionCount: subjectQuestions.length };
  }).filter(s => s.questionCount > 0).sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and review your mistakes
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link to="/add-question">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Link>
          </Button>
          <Button asChild>
            <Link to="/take-test">
              <Play className="mr-2 h-4 w-4" />
              Start Test
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Questions"
          value={totalQuestions}
          subtitle="In your bank"
          icon={<BookOpen className="h-6 w-6" />}
        />
        <StatCard
          title="Tests Taken"
          value={totalTests}
          subtitle="Mock tests completed"
          icon={<Target className="h-6 w-6" />}
        />
        <StatCard
          title="Average Score"
          value={`${averageScore}%`}
          subtitle="Across all tests"
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <StatCard
          title="Subjects"
          value={data.subjects.length}
          subtitle={`${data.chapters.length} chapters`}
          icon={<Clock className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tests */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Tests</h2>
            <Link 
              to="/statistics" 
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentTests.length > 0 ? (
            <div className="space-y-3">
              {recentTests.map((test) => {
                const percentage = Math.round((test.score / test.totalQuestions) * 100);
                return (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">
                        {test.score}/{test.totalQuestions} correct
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(test.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`text-lg font-bold ${
                      percentage >= 80 ? 'text-success' : 
                      percentage >= 60 ? 'text-warning' : 
                      'text-destructive'
                    }`}>
                      {percentage}%
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No tests taken yet</p>
              <Button asChild variant="link" className="mt-2">
                <Link to="/take-test">Take your first test</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Subject Overview */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Subject Overview</h2>
            <Link 
              to="/manage-categories" 
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {data.subjects.length > 0 ? (
            <div className="space-y-3">
              {data.subjects.map((subject) => {
                const questionCount = data.questions.filter(q => q.subjectId === subject.id).length;
                const chapterCount = data.chapters.filter(c => c.subjectId === subject.id).length;
                return (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <SubjectBadge name={subject.name} color={subject.color} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {questionCount} questions · {chapterCount} chapters
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No subjects created yet</p>
              <Button asChild variant="link" className="mt-2">
                <Link to="/manage-categories">Add subjects</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Weak Areas */}
      {subjectStats.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold mb-4">Areas to Focus</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjectStats.slice(0, 3).map((subject) => (
              <div
                key={subject.id}
                className="p-4 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <SubjectBadge name={subject.name} color={subject.color} size="sm" />
                  <span className={`text-sm font-medium ${
                    subject.accuracy >= 80 ? 'text-success' : 
                    subject.accuracy >= 60 ? 'text-warning' : 
                    'text-destructive'
                  }`}>
                    {Math.round(subject.accuracy)}% accuracy
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${subject.accuracy}%`,
                      backgroundColor: subject.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalQuestions === 0 && (
        <div className="rounded-xl border-2 border-dashed bg-muted/30 p-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold mb-2">Start Building Your Question Bank</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Add questions from your mistakes to create personalized mock tests and track your improvement.
          </p>
          <Button asChild size="lg">
            <Link to="/add-question">
              <Plus className="mr-2 h-5 w-5" />
              Add Your First Question
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
