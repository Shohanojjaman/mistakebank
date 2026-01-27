import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

export default function AddQuestion() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const { data, addQuestion, updateQuestion } = useApp();
  
  const existingQuestion = editId 
    ? data.questions.find(q => q.id === editId) 
    : null;

  const [formData, setFormData] = useState({
    text: existingQuestion?.text || '',
    optionA: existingQuestion?.options.A || '',
    optionB: existingQuestion?.options.B || '',
    optionC: existingQuestion?.options.C || '',
    optionD: existingQuestion?.options.D || '',
    correctAnswer: existingQuestion?.correctAnswer || '' as 'A' | 'B' | 'C' | 'D' | '',
    explanation: existingQuestion?.explanation || '',
    subjectId: existingQuestion?.subjectId || '',
    chapterId: existingQuestion?.chapterId || '',
    typeId: existingQuestion?.typeId || '',
  });

  const filteredChapters = data.chapters.filter(c => c.subjectId === formData.subjectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.text || !formData.optionA || !formData.optionB || 
        !formData.optionC || !formData.optionD || !formData.correctAnswer ||
        !formData.subjectId || !formData.chapterId || !formData.typeId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const questionData = {
      text: formData.text.trim(),
      options: {
        A: formData.optionA.trim(),
        B: formData.optionB.trim(),
        C: formData.optionC.trim(),
        D: formData.optionD.trim(),
      },
      correctAnswer: formData.correctAnswer as 'A' | 'B' | 'C' | 'D',
      explanation: formData.explanation.trim(),
      subjectId: formData.subjectId,
      chapterId: formData.chapterId,
      typeId: formData.typeId,
    };

    if (editId && existingQuestion) {
      updateQuestion(editId, questionData);
      toast.success('Question updated successfully!');
    } else {
      addQuestion(questionData);
      toast.success('Question added successfully!');
    }

    navigate('/question-bank');
  };

  const handleAddAnother = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.text || !formData.optionA || !formData.optionB || 
        !formData.optionC || !formData.optionD || !formData.correctAnswer ||
        !formData.subjectId || !formData.chapterId || !formData.typeId) {
      toast.error('Please fill in all required fields');
      return;
    }

    addQuestion({
      text: formData.text.trim(),
      options: {
        A: formData.optionA.trim(),
        B: formData.optionB.trim(),
        C: formData.optionC.trim(),
        D: formData.optionD.trim(),
      },
      correctAnswer: formData.correctAnswer as 'A' | 'B' | 'C' | 'D',
      explanation: formData.explanation.trim(),
      subjectId: formData.subjectId,
      chapterId: formData.chapterId,
      typeId: formData.typeId,
    });

    toast.success('Question added! Add another one.');
    
    // Reset form but keep category selections
    setFormData(prev => ({
      ...prev,
      text: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      explanation: '',
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {editId ? 'Edit Question' : 'Add Question'}
          </h1>
          <p className="text-muted-foreground">
            {editId ? 'Update the question details' : 'Add a new question to your bank'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Select
              value={formData.subjectId}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                subjectId: value,
                chapterId: '' 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {data.subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chapter">Chapter *</Label>
            <Select
              value={formData.chapterId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, chapterId: value }))}
              disabled={!formData.subjectId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select chapter" />
              </SelectTrigger>
              <SelectContent>
                {filteredChapters.map((chapter) => (
                  <SelectItem key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.typeId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, typeId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {data.questionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <Label htmlFor="question">Question *</Label>
          <Textarea
            id="question"
            placeholder="Enter your question here..."
            value={formData.text}
            onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
            className="min-h-[100px]"
          />
        </div>

        {/* Options */}
        <div className="space-y-4">
          <Label>Options *</Label>
          <div className="grid gap-3">
            {(['A', 'B', 'C', 'D'] as const).map((option) => (
              <div key={option} className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg font-medium ${
                  formData.correctAnswer === option 
                    ? 'bg-success text-success-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {option}
                </div>
                <Input
                  placeholder={`Option ${option}`}
                  value={formData[`option${option}` as keyof typeof formData] as string}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    [`option${option}`]: e.target.value 
                  }))}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Correct Answer */}
        <div className="space-y-2">
          <Label>Correct Answer *</Label>
          <div className="flex gap-2">
            {(['A', 'B', 'C', 'D'] as const).map((option) => (
              <Button
                key={option}
                type="button"
                variant={formData.correctAnswer === option ? 'default' : 'outline'}
                className={formData.correctAnswer === option ? 'bg-success hover:bg-success/90' : ''}
                onClick={() => setFormData(prev => ({ ...prev, correctAnswer: option }))}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div className="space-y-2">
          <Label htmlFor="explanation">Explanation (Optional)</Label>
          <Textarea
            id="explanation"
            placeholder="Add an explanation for the correct answer..."
            value={formData.explanation}
            onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            {editId ? 'Update Question' : 'Save Question'}
          </Button>
          {!editId && (
            <Button type="button" variant="outline" onClick={handleAddAnother}>
              <Plus className="mr-2 h-4 w-4" />
              Save & Add Another
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
