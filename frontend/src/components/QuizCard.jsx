import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Eye, Trash2, Clock, FileQuestion, FileDown, Key } from 'lucide-react';
import { api } from '../lib/api';

const QuizCard = ({ quiz, onDelete }) => {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const confirmDelete = () => {
    setDeleteOpen(false);
    onDelete(quiz.id);
  };

  const handleExportHandout = async (e) => {
    e.stopPropagation();
    setExporting('handout');
    try {
      const result = await api.exportHandoutPdf(quiz.id);
      if (result.saved) toast.success('Handout PDF saved');
    } catch (error) {
      console.error('Failed to export handout', error);
      toast.error('Failed to export handout PDF');
    } finally {
      setExporting(null);
    }
  };

  const handleExportAnswerKey = async (e) => {
    e.stopPropagation();
    setExporting('answers');
    try {
      const result = await api.exportAnswerKeyPdf(quiz.id);
      if (result.saved) toast.success('Answer key PDF saved');
    } catch (error) {
      console.error('Failed to export answer key', error);
      toast.error('Failed to export answer key PDF');
    } finally {
      setExporting(null);
    }
  };

  const getDifficultyVariant = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'easy';
      case 'medium':
        return 'medium';
      case 'hard':
        return 'hard';
      default:
        return 'secondary';
    }
  };

  const getGradientClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'from-green-400 to-emerald-600';
      case 'medium':
        return 'from-yellow-400 to-orange-600';
      case 'hard':
        return 'from-red-500 to-pink-700';
      default:
        return 'from-indigo-500 to-purple-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
      className="group relative"
    >
      <Card className="overflow-hidden h-full border-2 hover:border-indigo-300 transition-colors">
        {/* Gradient header */}
        <div className={`h-32 bg-gradient-to-br ${getGradientClass(quiz.difficulty)} relative overflow-hidden`}>
          <motion.div
            className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
            initial={false}
            whileHover={{ opacity: 0.2 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute top-4 right-4">
            <Badge variant={getDifficultyVariant(quiz.difficulty)} className="shadow-lg">
              {quiz.difficulty || 'Medium'}
            </Badge>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-xl truncate drop-shadow-lg">
              {quiz.title || quiz.topic}
            </h3>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <FileQuestion className="w-4 h-4" />
              <span>{quiz.questions?.length || 0} questions</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{quiz.timeLimit || 10} min</span>
            </div>
          </div>

          {/* Created date */}
          {quiz.createdAt && (
            <p className="text-xs text-gray-500 mb-4">
              Created {new Date(quiz.createdAt).toLocaleDateString()}
            </p>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                onClick={() => navigate(`/quiz/${quiz.id}`)}
                className="flex-1"
                size="default"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={exporting !== null}
                onClick={handleExportHandout}
              >
                <FileDown className="w-4 h-4 mr-2" />
                {exporting === 'handout' ? 'Exporting...' : 'Handout PDF'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={exporting !== null}
                onClick={handleExportAnswerKey}
              >
                <Key className="w-4 h-4 mr-2" />
                {exporting === 'answers' ? 'Exporting...' : 'Answer Key'}
              </Button>
            </div>
          </div>
        </CardContent>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete this quiz?</DialogTitle>
              <DialogDescription>
                "{quiz.title}" and all of its questions will be permanently deleted. This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          style={{
            background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
          }}
        />
      </Card>
    </motion.div>
  );
};

export default QuizCard;
