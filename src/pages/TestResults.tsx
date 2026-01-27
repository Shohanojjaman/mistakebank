import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Trophy, Target, Clock, CheckCircle, XCircle, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubjectBadge } from '@/components/SubjectBadge';
import { useApp } from '@/contexts/AppContext';
import type { Question, TestAnswer } from '@/types';
import { cn } from '@/lib/utils';

interface LocationState {
  testAnswers: TestAnswer[];
  testQuestions: Question[];
  score: number;
  totalTime: number;
}

export default function TestResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useApp();
  
  const state = location.state as LocationState | null;

  if (!state) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No test results found</p>
        <Button asChild>
          <Link to="/take-test">Take a Test</Link>
        </Button>
      </div>
    );
  }

  const { testAnswers, testQuestions, score, totalTime } = state;
  const percentage = Math.round((score / testQuestions.length) * 100);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getSubject = (id: string) => data.subjects.find(s => s.id === id);
  const getChapter = (id: string) => data.chapters.find(c => c.id === id);

  const getGrade = () => {
    if (percentage >= 90) return { label: 'Excellent!', color: 'text-success' };
    if (percentage >= 80) return { label: 'Great Job!', color: 'text-success' };
    if (percentage >= 70) return { label: 'Good Work!', color: 'text-primary' };
    if (percentage >= 60) return { label: 'Keep Practicing', color: 'text-warning' };
    return { label: 'Need Improvement', color: 'text-destructive' };
  };

  const grade = getGrade();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      {/* Score Card */}
      <div className="rounded-xl border bg-card p-8 shadow-card text-center">
        <div className="mb-4">
          <Trophy className={cn("h-16 w-16 mx-auto mb-4", grade.color)} />
          <h1 className={cn("text-3xl font-bold mb-2", grade.color)}>{grade.label}</h1>
        </div>

        <div className="flex items-center justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-5xl font-bold">{percentage}%</div>
            <p className="text-muted-foreground">Score</p>
          </div>
          <div className="h-16 w-px bg-border" />
          <div className="text-center">
            <div className="text-3xl font-bold">{score}/{testQuestions.length}</div>
            <p className="text-muted-foreground">Correct</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {formatTime(totalTime)}
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            {testQuestions.length} questions
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => navigate('/take-test')}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Take Another Test
        </Button>
        <Button asChild className="flex-1">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>

      {/* Detailed Review */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Question Review</h2>
        
        {testQuestions.map((question, idx) => {
          const answer = testAnswers[idx];
          const subject = getSubject(question.subjectId);
          const chapter = getChapter(question.chapterId);
          const isCorrect = answer.isCorrect;
          const wasAnswered = answer.selectedAnswer !== null;

          return (
            <div
              key={question.id}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                isCorrect 
                  ? "bg-success/5 border-success/20" 
                  : "bg-destructive/5 border-destructive/20"
              )}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                  isCorrect ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
                )}>
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Q{idx + 1}
                    </span>
                    {subject && (
                      <SubjectBadge name={subject.name} color={subject.color} size="sm" />
                    )}
                    {chapter && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                        {chapter.name}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{question.text}</p>
                </div>
              </div>

              <div className="grid gap-2 ml-11">
                {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                  const isSelected = answer.selectedAnswer === opt;
                  const isCorrectAnswer = question.correctAnswer === opt;
                  
                  return (
                    <div
                      key={opt}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg text-sm",
                        isCorrectAnswer && "bg-success/20 border border-success/30",
                        isSelected && !isCorrectAnswer && "bg-destructive/20 border border-destructive/30",
                        !isSelected && !isCorrectAnswer && "bg-muted/50"
                      )}
                    >
                      <span className={cn(
                        "flex h-5 w-5 items-center justify-center rounded text-xs font-medium",
                        isCorrectAnswer 
                          ? "bg-success text-success-foreground" 
                          : isSelected 
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-muted-foreground/20"
                      )}>
                        {opt}
                      </span>
                      <span>{question.options[opt]}</span>
                      {isCorrectAnswer && (
                        <CheckCircle className="h-4 w-4 text-success ml-auto" />
                      )}
                      {isSelected && !isCorrectAnswer && (
                        <XCircle className="h-4 w-4 text-destructive ml-auto" />
                      )}
                    </div>
                  );
                })}
              </div>

              {!wasAnswered && (
                <p className="text-sm text-muted-foreground mt-2 ml-11">
                  Not answered
                </p>
              )}

              {question.explanation && (
                <div className="mt-3 ml-11 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs font-medium text-primary mb-1">Explanation</p>
                  <p className="text-sm text-muted-foreground">{question.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
