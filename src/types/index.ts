export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface Chapter {
  id: string;
  name: string;
  subjectId: string;
}

export interface QuestionType {
  id: string;
  name: string;
  chapterId: string; // Types are now under chapters
}

export interface Question {
  id: string;
  text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  explanationImageUrl?: string; // New: image URL for explanation
  references?: string[]; // New: reference tags
  subjectId: string;
  chapterId: string;
  typeId: string;
  createdAt: string;
  timesAnswered: number;
  timesCorrect: number;
}

export interface TestConfig {
  questionCount: number;
  subjectIds: string[];
  chapterIds: string[];
  typeIds: string[];
  timeLimit?: number; // in minutes
}

export interface TestAnswer {
  questionId: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null;
  isCorrect: boolean;
  timeTaken: number; // in seconds
}

export interface TestResult {
  id: string;
  date: string;
  config: TestConfig;
  answers: TestAnswer[];
  score: number;
  totalQuestions: number;
  timeTaken: number; // in seconds
}

export interface AppData {
  subjects: Subject[];
  chapters: Chapter[];
  questionTypes: QuestionType[];
  questions: Question[];
  testResults: TestResult[];
}
