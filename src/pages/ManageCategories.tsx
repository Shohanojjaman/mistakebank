import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubjectBadge } from '@/components/SubjectBadge';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

const PRESET_COLORS = [
  'hsl(199, 89%, 48%)', // Blue
  'hsl(172, 66%, 50%)', // Teal
  'hsl(38, 92%, 50%)',  // Orange
  'hsl(142, 71%, 45%)', // Green
  'hsl(262, 83%, 58%)', // Purple
  'hsl(346, 87%, 57%)', // Pink
  'hsl(24, 95%, 53%)',  // Red-Orange
  'hsl(210, 78%, 55%)', // Sky Blue
];

export default function ManageCategories() {
  const { 
    data, 
    addSubject, updateSubject, deleteSubject,
    addChapter, updateChapter, deleteChapter,
    addQuestionType, updateQuestionType, deleteQuestionType,
  } = useApp();

  // Subject state
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState(PRESET_COLORS[0]);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState('');

  // Chapter state
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterSubjectId, setNewChapterSubjectId] = useState('');
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingChapterName, setEditingChapterName] = useState('');

  // Type state
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeChapterId, setNewTypeChapterId] = useState('');
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editingTypeName, setEditingTypeName] = useState('');

  // Subject handlers
  const handleAddSubject = () => {
    if (!newSubjectName.trim()) {
      toast.error('Please enter a subject name');
      return;
    }
    addSubject({ name: newSubjectName.trim(), color: newSubjectColor });
    setNewSubjectName('');
    setNewSubjectColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    toast.success('Subject added');
  };

  const handleUpdateSubject = (id: string) => {
    if (!editingSubjectName.trim()) {
      toast.error('Please enter a subject name');
      return;
    }
    updateSubject(id, { name: editingSubjectName.trim() });
    setEditingSubjectId(null);
    toast.success('Subject updated');
  };

  const handleDeleteSubject = (id: string) => {
    const questionCount = data.questions.filter(q => q.subjectId === id).length;
    deleteSubject(id);
    toast.success(`Subject deleted${questionCount > 0 ? ` (${questionCount} questions removed)` : ''}`);
  };

  // Chapter handlers
  const handleAddChapter = () => {
    if (!newChapterName.trim() || !newChapterSubjectId) {
      toast.error('Please enter a chapter name and select a subject');
      return;
    }
    addChapter({ name: newChapterName.trim(), subjectId: newChapterSubjectId });
    setNewChapterName('');
    toast.success('Chapter added');
  };

  const handleUpdateChapter = (id: string) => {
    if (!editingChapterName.trim()) {
      toast.error('Please enter a chapter name');
      return;
    }
    updateChapter(id, { name: editingChapterName.trim() });
    setEditingChapterId(null);
    toast.success('Chapter updated');
  };

  const handleDeleteChapter = (id: string) => {
    const questionCount = data.questions.filter(q => q.chapterId === id).length;
    deleteChapter(id);
    toast.success(`Chapter deleted${questionCount > 0 ? ` (${questionCount} questions removed)` : ''}`);
  };

  // Type handlers
  const handleAddType = () => {
    if (!newTypeName.trim() || !newTypeChapterId) {
      toast.error('Please enter a type name and select a chapter');
      return;
    }
    addQuestionType({ name: newTypeName.trim(), chapterId: newTypeChapterId });
    setNewTypeName('');
    toast.success('Question type added');
  };

  const handleUpdateType = (id: string) => {
    if (!editingTypeName.trim()) {
      toast.error('Please enter a type name');
      return;
    }
    updateQuestionType(id, { name: editingTypeName.trim() });
    setEditingTypeId(null);
    toast.success('Type updated');
  };

  const handleDeleteType = (id: string) => {
    deleteQuestionType(id);
    toast.success('Type deleted');
  };

  // Get subject for a chapter
  const getSubjectForChapter = (chapterId: string) => {
    const chapter = data.chapters.find(c => c.id === chapterId);
    return chapter ? data.subjects.find(s => s.id === chapter.subjectId) : null;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <p className="text-muted-foreground">
          Organize your questions with subjects, chapters, and types
        </p>
      </div>

      <Tabs defaultValue="subjects" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
        </TabsList>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          {/* Add Subject Form */}
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <Label className="mb-3 block">Add New Subject</Label>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Subject name (e.g., Mathematics)"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                />
              </div>
              <div className="flex gap-1">
                {PRESET_COLORS.slice(0, 4).map((color) => (
                  <button
                    key={color}
                    className={`h-10 w-10 rounded-lg transition-all ${
                      newSubjectColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewSubjectColor(color)}
                  />
                ))}
              </div>
              <Button onClick={handleAddSubject}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Subjects List */}
          <div className="space-y-2">
            {data.subjects.map((subject) => {
              const questionCount = data.questions.filter(q => q.subjectId === subject.id).length;
              const chapterCount = data.chapters.filter(c => c.subjectId === subject.id).length;
              const isEditing = editingSubjectId === subject.id;

              return (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editingSubjectName}
                        onChange={(e) => setEditingSubjectName(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleUpdateSubject(subject.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingSubjectId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <SubjectBadge name={subject.name} color={subject.color} />
                        <span className="text-sm text-muted-foreground">
                          {chapterCount} chapters · {questionCount} questions
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingSubjectId(subject.id);
                            setEditingSubjectName(subject.name);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete "{subject.name}" and all its chapters, types, and {questionCount} questions. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSubject(subject.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            {data.subjects.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                No subjects yet. Add your first subject above.
              </p>
            )}
          </div>
        </TabsContent>

        {/* Chapters Tab */}
        <TabsContent value="chapters" className="space-y-4">
          {/* Add Chapter Form */}
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <Label className="mb-3 block">Add New Chapter</Label>
            <div className="flex gap-3">
              <Select value={newChapterSubjectId} onValueChange={setNewChapterSubjectId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {data.subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Chapter name (e.g., Algebra)"
                value={newChapterName}
                onChange={(e) => setNewChapterName(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
              />
              <Button onClick={handleAddChapter}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chapters List (grouped by subject) */}
          <div className="space-y-4">
            {data.subjects.map((subject) => {
              const chapters = data.chapters.filter(c => c.subjectId === subject.id);
              if (chapters.length === 0) return null;

              return (
                <div key={subject.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <SubjectBadge name={subject.name} color={subject.color} size="sm" />
                    <span className="text-sm text-muted-foreground">
                      {chapters.length} chapters
                    </span>
                  </div>
                  <div className="space-y-2">
                    {chapters.map((chapter) => {
                      const questionCount = data.questions.filter(q => q.chapterId === chapter.id).length;
                      const typeCount = data.questionTypes.filter(t => t.chapterId === chapter.id).length;
                      const isEditing = editingChapterId === chapter.id;

                      return (
                        <div
                          key={chapter.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card ml-4"
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editingChapterName}
                                onChange={(e) => setEditingChapterName(e.target.value)}
                                className="flex-1"
                                autoFocus
                              />
                              <Button size="sm" onClick={() => handleUpdateChapter(chapter.id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingChapterId(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div>
                                <span className="font-medium">{chapter.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">
                                  {typeCount} types · {questionCount} questions
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingChapterId(chapter.id);
                                    setEditingChapterName(chapter.name);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will delete "{chapter.name}", its types, and {questionCount} questions. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteChapter(chapter.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {data.chapters.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                No chapters yet. Add a subject first, then create chapters.
              </p>
            )}
          </div>
        </TabsContent>

        {/* Types Tab */}
        <TabsContent value="types" className="space-y-4">
          {/* Add Type Form */}
          <div className="rounded-xl border bg-card p-4 shadow-card">
            <Label className="mb-3 block">Add New Question Type</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Types are specific to each chapter. Select a chapter first.
            </p>
            <div className="flex gap-3">
              <Select value={newTypeChapterId} onValueChange={setNewTypeChapterId}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  {data.subjects.map((subject) => {
                    const chapters = data.chapters.filter(c => c.subjectId === subject.id);
                    if (chapters.length === 0) return null;
                    return (
                      <div key={subject.id}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {subject.name}
                        </div>
                        {chapters.map((chapter) => (
                          <SelectItem key={chapter.id} value={chapter.id}>
                            {chapter.name}
                          </SelectItem>
                        ))}
                      </div>
                    );
                  })}
                </SelectContent>
              </Select>
              <Input
                placeholder="Type name (e.g., Conceptual)"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddType()}
              />
              <Button onClick={handleAddType}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Types List (grouped by subject → chapter) */}
          <div className="space-y-4">
            {data.subjects.map((subject) => {
              const chapters = data.chapters.filter(c => c.subjectId === subject.id);
              const hasTypes = chapters.some(ch => 
                data.questionTypes.some(t => t.chapterId === ch.id)
              );
              if (!hasTypes) return null;

              return (
                <div key={subject.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <SubjectBadge name={subject.name} color={subject.color} size="sm" />
                  </div>
                  <div className="space-y-3 ml-4">
                    {chapters.map((chapter) => {
                      const types = data.questionTypes.filter(t => t.chapterId === chapter.id);
                      if (types.length === 0) return null;

                      return (
                        <div key={chapter.id}>
                          <div className="text-sm font-medium text-muted-foreground mb-1">
                            {chapter.name}
                          </div>
                          <div className="space-y-1 ml-4">
                            {types.map((type) => {
                              const isEditing = editingTypeId === type.id;

                              return (
                                <div
                                  key={type.id}
                                  className="flex items-center justify-between p-2 rounded-lg border bg-card"
                                >
                                  {isEditing ? (
                                    <div className="flex items-center gap-2 flex-1">
                                      <Input
                                        value={editingTypeName}
                                        onChange={(e) => setEditingTypeName(e.target.value)}
                                        className="flex-1 h-8"
                                        autoFocus
                                      />
                                      <Button size="sm" onClick={() => handleUpdateType(type.id)}>
                                        <Check className="h-3 w-3" />
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => setEditingTypeId(null)}>
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <span className="text-sm">{type.name}</span>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0"
                                          onClick={() => {
                                            setEditingTypeId(type.id);
                                            setEditingTypeName(type.name);
                                          }}
                                        >
                                          <Edit2 className="h-3 w-3" />
                                        </Button>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Delete Type</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Delete "{type.name}"? This action cannot be undone.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => handleDeleteType(type.id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                              >
                                                Delete
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {data.questionTypes.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">
                No types yet. Add a chapter first, then create types for it.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
