import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SubjectBadge } from '@/components/SubjectBadge';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

export default function QuestionBank() {
  const { data, deleteQuestion } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [chapterFilter, setChapterFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredChapters = useMemo(() => {
    if (subjectFilter === 'all') return data.chapters;
    return data.chapters.filter(c => c.subjectId === subjectFilter);
  }, [data.chapters, subjectFilter]);

  const filteredQuestions = useMemo(() => {
    return data.questions.filter(q => {
      const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = subjectFilter === 'all' || q.subjectId === subjectFilter;
      const matchesChapter = chapterFilter === 'all' || q.chapterId === chapterFilter;
      const matchesType = typeFilter === 'all' || q.typeId === typeFilter;
      return matchesSearch && matchesSubject && matchesChapter && matchesType;
    });
  }, [data.questions, searchQuery, subjectFilter, chapterFilter, typeFilter]);

  const getSubject = (id: string) => data.subjects.find(s => s.id === id);
  const getChapter = (id: string) => data.chapters.find(c => c.id === id);
  const getType = (id: string) => data.questionTypes.find(t => t.id === id);

  const handleDelete = (id: string) => {
    deleteQuestion(id);
    toast.success('Question deleted');
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground">
            {filteredQuestions.length} of {data.questions.length} questions
          </p>
        </div>
        <Button asChild>
          <Link to="/add-question">
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-card p-4 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Filters</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={subjectFilter} onValueChange={(v) => {
            setSubjectFilter(v);
            setChapterFilter('all');
          }}>
            <SelectTrigger>
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {data.subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={chapterFilter} onValueChange={setChapterFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Chapters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chapters</SelectItem>
              {filteredChapters.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {data.questionTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => {
            const subject = getSubject(question.subjectId);
            const chapter = getChapter(question.chapterId);
            const type = getType(question.typeId);
            const isExpanded = expandedId === question.id;
            const accuracy = question.timesAnswered > 0 
              ? Math.round((question.timesCorrect / question.timesAnswered) * 100) 
              : null;

            return (
              <div
                key={question.id}
                className="rounded-xl border bg-card shadow-card overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : question.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {subject && (
                          <SubjectBadge name={subject.name} color={subject.color} size="sm" />
                        )}
                        {chapter && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {chapter.name}
                          </span>
                        )}
                        {type && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {type.name}
                          </span>
                        )}
                        {accuracy !== null && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            accuracy >= 80 ? 'bg-success/10 text-success' :
                            accuracy >= 60 ? 'bg-warning/10 text-warning' :
                            'bg-destructive/10 text-destructive'
                          }`}>
                            {accuracy}% accuracy
                          </span>
                        )}
                      </div>
                      <p className="text-sm line-clamp-2">{question.text}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t bg-muted/20 animate-fade-in">
                    <div className="pt-4 space-y-4">
                      <div className="grid gap-2">
                        {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                          <div
                            key={opt}
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              question.correctAnswer === opt
                                ? 'bg-success/10 border border-success/30'
                                : 'bg-muted/50'
                            }`}
                          >
                            <span className={`flex h-6 w-6 items-center justify-center rounded text-sm font-medium ${
                              question.correctAnswer === opt
                                ? 'bg-success text-success-foreground'
                                : 'bg-muted-foreground/20 text-muted-foreground'
                            }`}>
                              {opt}
                            </span>
                            <span className="text-sm">{question.options[opt]}</span>
                          </div>
                        ))}
                      </div>

                      {question.explanation && (
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <p className="text-xs font-medium text-primary mb-1">Explanation</p>
                          <p className="text-sm text-muted-foreground">{question.explanation}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(question.createdAt).toLocaleDateString()}
                          {question.timesAnswered > 0 && ` · Answered ${question.timesAnswered} times`}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/add-question?edit=${question.id}`}>
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Question</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this question? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(question.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border-2 border-dashed bg-muted/30 p-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No questions found</h3>
            <p className="text-muted-foreground mb-4">
              {data.questions.length === 0
                ? "Start building your question bank by adding your first question."
                : "Try adjusting your filters or search query."}
            </p>
            {data.questions.length === 0 && (
              <Button asChild>
                <Link to="/add-question">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
