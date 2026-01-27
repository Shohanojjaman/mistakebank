import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, BookOpen, Settings2, ArrowLeft, ArrowRight, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import type { Question, TestAnswer } from '@/types';
import { cn } from '@/lib/utils';

type TestPhase = 'config' | 'test' | 'review';

export default function TakeTest() {
  const navigate = useNavigate();
  const { data, addTestResult, updateQuestionStats } = useApp();

  // Config state
  const [phase, setPhase] = useState<TestPhase>('config');
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [enableTimer, setEnableTimer] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30); // minutes

  // Test state
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, 'A' | 'B' | 'C' | 'D' | null>>(new Map());
  const [startTime, setStartTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [questionTimes, setQuestionTimes] = useState<Map<string, number>>(new Map());

  // Filter available questions
  const availableQuestions = useMemo(() => {
    if (selectedSubjects.length === 0) return data.questions;
    return data.questions.filter(q => selectedSubjects.includes(q.subjectId));
  }, [data.questions, selectedSubjects]);

  const maxQuestions = Math.min(50, availableQuestions.length);

  // Timer effect
  useEffect(() => {
    if (phase !== 'test' || !enableTimer) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, enableTimer]);

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const startTest = () => {
    if (availableQuestions.length === 0) return;

    // Shuffle and select questions
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    
    setTestQuestions(selected);
    setCurrentIndex(0);
    setAnswers(new Map());
    setQuestionTimes(new Map());
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    if (enableTimer) {
      setTimeRemaining(timeLimit * 60);
    }
    setPhase('test');
  };

  const selectAnswer = (answer: 'A' | 'B' | 'C' | 'D') => {
    const currentQuestion = testQuestions[currentIndex];
    setAnswers(prev => new Map(prev).set(currentQuestion.id, answer));
  };

  const recordQuestionTime = useCallback(() => {
    const currentQuestion = testQuestions[currentIndex];
    if (currentQuestion) {
      const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
      setQuestionTimes(prev => {
        const newTimes = new Map(prev);
        const existing = newTimes.get(currentQuestion.id) || 0;
        newTimes.set(currentQuestion.id, existing + timeTaken);
        return newTimes;
      });
    }
    setQuestionStartTime(Date.now());
  }, [currentIndex, questionStartTime, testQuestions]);

  const goToQuestion = (index: number) => {
    recordQuestionTime();
    setCurrentIndex(index);
  };

  const handleSubmitTest = useCallback(() => {
    recordQuestionTime();
    
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    
    const testAnswers: TestAnswer[] = testQuestions.map(q => ({
      questionId: q.id,
      selectedAnswer: answers.get(q.id) || null,
      isCorrect: answers.get(q.id) === q.correctAnswer,
      timeTaken: questionTimes.get(q.id) || 0,
    }));

    const score = testAnswers.filter(a => a.isCorrect).length;

    // Update question stats
    testAnswers.forEach(answer => {
      if (answer.selectedAnswer !== null) {
        updateQuestionStats(answer.questionId, answer.isCorrect);
      }
    });

    // Save test result
    addTestResult({
      date: new Date().toISOString(),
      config: {
        questionCount: testQuestions.length,
        subjectIds: selectedSubjects,
        chapterIds: [],
        typeIds: [],
        timeLimit: enableTimer ? timeLimit : undefined,
      },
      answers: testAnswers,
      score,
      totalQuestions: testQuestions.length,
      timeTaken: totalTime,
    });

    // Navigate to results
    navigate('/test-results', { 
      state: { 
        testAnswers, 
        testQuestions, 
        score, 
        totalTime 
      } 
    });
  }, [answers, questionTimes, testQuestions, startTime, enableTimer, timeLimit, selectedSubjects, addTestResult, updateQuestionStats, navigate, recordQuestionTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Config Phase
  if (phase === 'config') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold">Configure Test</h1>
          <p className="text-muted-foreground">Set up your mock test preferences</p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-card space-y-6">
          {/* Question Count */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Number of Questions</Label>
              <span className="text-2xl font-bold text-primary">{questionCount}</span>
            </div>
            <Slider
              value={[questionCount]}
              onValueChange={([value]) => setQuestionCount(value)}
              min={5}
              max={maxQuestions}
              step={5}
              className="py-4"
            />
            <p className="text-sm text-muted-foreground">
              {availableQuestions.length} questions available
            </p>
          </div>

          {/* Subject Filter */}
          <div className="space-y-3">
            <Label className="text-base">Subjects</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {data.subjects.map((subject) => {
                const count = data.questions.filter(q => q.subjectId === subject.id).length;
                return (
                  <label
                    key={subject.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedSubjects.includes(subject.id)
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <Checkbox
                      checked={selectedSubjects.includes(subject.id)}
                      onCheckedChange={() => toggleSubject(subject.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        <span className="font-medium">{subject.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{count} questions</p>
                    </div>
                  </label>
                );
              })}
            </div>
            {selectedSubjects.length === 0 && (
              <p className="text-sm text-muted-foreground">
                All subjects will be included
              </p>
            )}
          </div>

          {/* Timer */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Time Limit</Label>
                <p className="text-sm text-muted-foreground">Set a countdown timer</p>
              </div>
              <Switch
                checked={enableTimer}
                onCheckedChange={setEnableTimer}
              />
            </div>
            {enableTimer && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-medium">{timeLimit} minutes</span>
                </div>
                <Slider
                  value={[timeLimit]}
                  onValueChange={([value]) => setTimeLimit(value)}
                  min={5}
                  max={120}
                  step={5}
                />
              </div>
            )}
          </div>
        </div>

        {/* Start Button */}
        <Button
          size="lg"
          className="w-full"
          disabled={availableQuestions.length === 0}
          onClick={startTest}
        >
          <Play className="mr-2 h-5 w-5" />
          Start Test ({Math.min(questionCount, availableQuestions.length)} questions)
        </Button>

        {availableQuestions.length === 0 && (
          <p className="text-center text-muted-foreground">
            Add some questions to your bank first
          </p>
        )}
      </div>
    );
  }

  // Test Phase
  const currentQuestion = testQuestions[currentIndex];
  const selectedAnswer = answers.get(currentQuestion?.id);
  const answeredCount = answers.size;
  const progress = ((currentIndex + 1) / testQuestions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold">
            Question {currentIndex + 1} of {testQuestions.length}
          </span>
          {enableTimer && (
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full font-mono",
              timeRemaining < 60 ? "bg-destructive/10 text-destructive" : "bg-muted"
            )}>
              <Clock className="h-4 w-4" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {answeredCount}/{testQuestions.length} answered
          </span>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Question Card */}
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="mb-6">
          <p className="text-lg leading-relaxed">{currentQuestion.text}</p>
        </div>

        <div className="space-y-3">
          {(['A', 'B', 'C', 'D'] as const).map((option) => (
            <button
              key={option}
              onClick={() => selectAnswer(option)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all",
                selectedAnswer === option
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "hover:bg-muted/50 hover:border-muted-foreground/30"
              )}
            >
              <span className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg font-medium shrink-0",
                selectedAnswer === option
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}>
                {option}
              </span>
              <span>{currentQuestion.options[option]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Question Navigator */}
      <div className="rounded-xl border bg-card p-4 shadow-card">
        <div className="flex flex-wrap gap-2">
          {testQuestions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => goToQuestion(idx)}
              className={cn(
                "h-9 w-9 rounded-lg font-medium text-sm transition-colors",
                idx === currentIndex
                  ? "bg-primary text-primary-foreground"
                  : answers.has(q.id)
                  ? "bg-success/20 text-success border border-success/30"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => goToQuestion(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {currentIndex === testQuestions.length - 1 ? (
          <Button onClick={handleSubmitTest}>
            <Flag className="mr-2 h-4 w-4" />
            Submit Test
          </Button>
        ) : (
          <Button
            onClick={() => goToQuestion(Math.min(testQuestions.length - 1, currentIndex + 1))}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
