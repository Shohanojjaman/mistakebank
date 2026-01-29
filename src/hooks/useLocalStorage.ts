import { useState, useEffect, useCallback } from 'react';
import type { AppData, Subject, Chapter, QuestionType, Question, TestResult } from '@/types';

const STORAGE_KEY = 'mistake-review-app-data';

const defaultData: AppData = {
  subjects: [
    { id: '1', name: 'Mathematics', color: 'hsl(199, 89%, 48%)' },
    { id: '2', name: 'Physics', color: 'hsl(172, 66%, 50%)' },
    { id: '3', name: 'Chemistry', color: 'hsl(38, 92%, 50%)' },
  ],
  chapters: [
    { id: '1', name: 'Algebra', subjectId: '1' },
    { id: '2', name: 'Calculus', subjectId: '1' },
    { id: '3', name: 'Mechanics', subjectId: '2' },
    { id: '4', name: 'Thermodynamics', subjectId: '2' },
    { id: '5', name: 'Organic Chemistry', subjectId: '3' },
  ],
  questionTypes: [
    { id: '1', name: 'Conceptual', chapterId: '1' },
    { id: '2', name: 'Numerical', chapterId: '1' },
    { id: '3', name: 'Application', chapterId: '2' },
  ],
  questions: [],
  testResults: [],
};

export function useLocalStorage() {
  const [data, setData] = useState<AppData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        // Migrate old data: add chapterId to types if missing
        if (parsedData.questionTypes) {
          parsedData.questionTypes = parsedData.questionTypes.map((type: QuestionType) => ({
            ...type,
            chapterId: type.chapterId || parsedData.chapters?.[0]?.id || ''
          }));
        }
        setData(parsedData);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  const saveData = useCallback((newData: AppData) => {
    setData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, []);

  // Subject operations
  const addSubject = useCallback((subject: Omit<Subject, 'id'>) => {
    const newSubject = { ...subject, id: crypto.randomUUID() };
    saveData({ ...data, subjects: [...data.subjects, newSubject] });
    return newSubject;
  }, [data, saveData]);

  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    saveData({
      ...data,
      subjects: data.subjects.map(s => s.id === id ? { ...s, ...updates } : s),
    });
  }, [data, saveData]);

  const deleteSubject = useCallback((id: string) => {
    const chapterIds = data.chapters.filter(c => c.subjectId === id).map(c => c.id);
    saveData({
      ...data,
      subjects: data.subjects.filter(s => s.id !== id),
      chapters: data.chapters.filter(c => c.subjectId !== id),
      questionTypes: data.questionTypes.filter(t => !chapterIds.includes(t.chapterId)),
      questions: data.questions.filter(q => q.subjectId !== id),
    });
  }, [data, saveData]);

  // Chapter operations
  const addChapter = useCallback((chapter: Omit<Chapter, 'id'>) => {
    const newChapter = { ...chapter, id: crypto.randomUUID() };
    saveData({ ...data, chapters: [...data.chapters, newChapter] });
    return newChapter;
  }, [data, saveData]);

  const updateChapter = useCallback((id: string, updates: Partial<Chapter>) => {
    saveData({
      ...data,
      chapters: data.chapters.map(c => c.id === id ? { ...c, ...updates } : c),
    });
  }, [data, saveData]);

  const deleteChapter = useCallback((id: string) => {
    saveData({
      ...data,
      chapters: data.chapters.filter(c => c.id !== id),
      questionTypes: data.questionTypes.filter(t => t.chapterId !== id),
      questions: data.questions.filter(q => q.chapterId !== id),
    });
  }, [data, saveData]);

  // Question Type operations - now with chapterId
  const addQuestionType = useCallback((type: Omit<QuestionType, 'id'>) => {
    const newType = { ...type, id: crypto.randomUUID() };
    saveData({ ...data, questionTypes: [...data.questionTypes, newType] });
    return newType;
  }, [data, saveData]);

  const updateQuestionType = useCallback((id: string, updates: Partial<QuestionType>) => {
    saveData({
      ...data,
      questionTypes: data.questionTypes.map(t => t.id === id ? { ...t, ...updates } : t),
    });
  }, [data, saveData]);

  const deleteQuestionType = useCallback((id: string) => {
    saveData({
      ...data,
      questionTypes: data.questionTypes.filter(t => t.id !== id),
    });
  }, [data, saveData]);

  // Question operations
  const addQuestion = useCallback((question: Omit<Question, 'id' | 'createdAt' | 'timesAnswered' | 'timesCorrect'>) => {
    const newQuestion: Question = {
      ...question,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      timesAnswered: 0,
      timesCorrect: 0,
    };
    saveData({ ...data, questions: [...data.questions, newQuestion] });
    return newQuestion;
  }, [data, saveData]);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    saveData({
      ...data,
      questions: data.questions.map(q => q.id === id ? { ...q, ...updates } : q),
    });
  }, [data, saveData]);

  const deleteQuestion = useCallback((id: string) => {
    saveData({
      ...data,
      questions: data.questions.filter(q => q.id !== id),
    });
  }, [data, saveData]);

  const updateQuestionStats = useCallback((questionId: string, isCorrect: boolean) => {
    saveData({
      ...data,
      questions: data.questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              timesAnswered: q.timesAnswered + 1,
              timesCorrect: q.timesCorrect + (isCorrect ? 1 : 0),
            }
          : q
      ),
    });
  }, [data, saveData]);

  // Test Result operations
  const addTestResult = useCallback((result: Omit<TestResult, 'id'>) => {
    const newResult = { ...result, id: crypto.randomUUID() };
    saveData({ ...data, testResults: [...data.testResults, newResult] });
    return newResult;
  }, [data, saveData]);

  return {
    data,
    isLoaded,
    // Subjects
    addSubject,
    updateSubject,
    deleteSubject,
    // Chapters
    addChapter,
    updateChapter,
    deleteChapter,
    // Question Types
    addQuestionType,
    updateQuestionType,
    deleteQuestionType,
    // Questions
    addQuestion,
    updateQuestion,
    deleteQuestion,
    updateQuestionStats,
    // Test Results
    addTestResult,
  };
}
