import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FileDown, Key, ArrowLeft, Clock, Gauge, Pencil, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { api, getErrorMessage } from '../lib/api';

const QuizView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const data = await api.getQuiz(id);
      setQuiz(data);
    } catch (error) {
      console.error('Failed to fetch quiz', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleExportHandout = async () => {
    setExporting('handout');
    try {
      const result = await api.exportHandoutPdf(id);
      if (result.saved) {
        toast.success('Handout PDF saved');
      }
    } catch (error) {
      console.error('Failed to export handout', error);
      toast.error('Failed to export handout PDF');
    } finally {
      setExporting(null);
    }
  };

  const handleExportAnswerKey = async () => {
    setExporting('answers');
    try {
      const result = await api.exportAnswerKeyPdf(id);
      if (result.saved) {
        toast.success('Answer key PDF saved');
      }
    } catch (error) {
      console.error('Failed to export answer key', error);
      toast.error('Failed to export answer key PDF');
    } finally {
      setExporting(null);
    }
  };

  const replaceQuestion = (updated) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === updated.id ? updated : q)),
    }));
  };

  const startEdit = (question) => {
    setEditingId(question.id);
    setEditDraft({
      text: question.text,
      options: [...question.options],
      answerIndex: Math.max(0, question.options.indexOf(question.answer)),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = async () => {
    if (!editDraft.text.trim() || editDraft.options.some((opt) => !opt.trim())) {
      toast.error('Question text and all options must be filled in.');
      return;
    }
    setSavingEdit(true);
    try {
      const updated = await api.updateQuestion(editingId, {
        text: editDraft.text,
        options: editDraft.options,
        answer: editDraft.options[editDraft.answerIndex],
      });
      replaceQuestion(updated);
      toast.success('Question updated');
      cancelEdit();
    } catch (error) {
      console.error('Failed to update question', error);
      toast.error(getErrorMessage(error) || 'Failed to update question');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRegenerate = async (questionId) => {
    setRegeneratingId(questionId);
    try {
      const updated = await api.regenerateQuestion(questionId);
      replaceQuestion(updated);
      toast.success('Question regenerated');
    } catch (error) {
      console.error('Failed to regenerate question', error);
      toast.error(getErrorMessage(error) || 'Failed to regenerate question');
    } finally {
      setRegeneratingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Quiz not found</h2>
        <Button onClick={() => navigate('/')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const actionsLocked = editingId !== null || regeneratingId !== null;

  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden mb-8"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
          <h1 className="text-3xl font-bold mb-3">{quiz.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Badge variant="glass">{quiz.difficulty}</Badge>
            <span className="flex items-center gap-1">
              <Gauge className="w-4 h-4" /> {quiz.questions.length} questions
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {quiz.timeLimit} minutes
            </span>
          </div>
        </div>

        <div className="p-8 flex flex-col sm:flex-row gap-4">
          <Button onClick={handleExportHandout} disabled={exporting !== null} className="flex-1" size="lg">
            <FileDown className="w-5 h-5 mr-2" />
            {exporting === 'handout' ? 'Exporting...' : 'Export Handout PDF'}
          </Button>
          <Button onClick={handleExportAnswerKey} disabled={exporting !== null} variant="outline" className="flex-1" size="lg">
            <Key className="w-5 h-5 mr-2" />
            {exporting === 'answers' ? 'Exporting...' : 'Export Answer Key PDF'}
          </Button>
        </div>
      </motion.div>

      <div className="space-y-4">
        {quiz.questions.map((question, index) => {
          const isEditing = editingId === question.id;
          const isRegenerating = regeneratingId === question.id;

          return (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl border-2 border-gray-100 p-6 ${isRegenerating ? 'opacity-60' : ''}`}
            >
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg font-semibold text-gray-800 pt-2">{index + 1}.</span>
                    <textarea
                      value={editDraft.text}
                      onChange={(e) => setEditDraft({ ...editDraft, text: e.target.value })}
                      rows={2}
                      disabled={savingEdit}
                      className="flex-1 rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-base focus-visible:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-y"
                    />
                  </div>
                  <div className="space-y-2">
                    {editDraft.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={editDraft.answerIndex === optIndex}
                          onChange={() => setEditDraft({ ...editDraft, answerIndex: optIndex })}
                          disabled={savingEdit}
                          className="w-4 h-4 accent-indigo-600"
                          title="Mark as correct answer"
                        />
                        <span className="font-bold w-6 text-gray-800">{letters[optIndex]}</span>
                        <Input
                          value={option}
                          onChange={(e) => {
                            const options = [...editDraft.options];
                            options[optIndex] = e.target.value;
                            setEditDraft({ ...editDraft, options });
                          }}
                          disabled={savingEdit}
                          className="flex-1 h-10 py-2"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Select the radio button next to the correct answer.</p>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={savingEdit}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveEdit} disabled={savingEdit}>
                      {savingEdit ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save'
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <p className="text-lg font-semibold text-gray-800">
                      {index + 1}. {question.text}
                    </p>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(question)}
                        disabled={actionsLocked}
                        title="Edit question"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRegenerate(question.id)}
                        disabled={actionsLocked}
                        title="Regenerate question with AI"
                      >
                        {isRegenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => {
                      const isCorrect = option === question.answer;
                      return (
                        <div
                          key={optIndex}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                            isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200'
                          }`}
                        >
                          <span className="font-bold w-6">{letters[optIndex]}</span>
                          <span className="flex-1 text-gray-800">{option}</span>
                          {isCorrect && <span className="text-green-600 font-semibold text-sm">Correct</span>}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizView;
