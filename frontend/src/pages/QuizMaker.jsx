import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Sparkles, Loader2, BookOpen, Gauge, Hash, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { api, getErrorMessage } from '../lib/api';

const QuizMaker = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [numQuestions, setNumQuestions] = useState(5);
  const [timeLimit, setTimeLimit] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loadingToast = toast.loading('Generating your quiz with AI...');

    try {
      const quiz = await api.createQuiz({
        topic,
        difficulty,
        numQuestions,
        timeLimit,
      });

      toast.success('Quiz created successfully!', { id: loadingToast });

      // Navigate to the quiz immediately
      navigate(`/quiz/${quiz.id}`);
    } catch (error) {
      console.error('Failed to create quiz', error);
      toast.error(getErrorMessage(error) || 'Failed to create quiz. Please try again.', { id: loadingToast });
      setLoading(false);
    }
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'Easy':
        return 'from-green-400 to-emerald-600';
      case 'Medium':
        return 'from-yellow-400 to-orange-600';
      case 'Hard':
        return 'from-red-500 to-pink-700';
      default:
        return 'from-indigo-500 to-purple-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-block mb-4"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
          Create Your Quiz
        </h1>
        <p className="text-xl text-gray-600">
          AI-powered quiz generation on any topic in seconds
        </p>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card animated={false}>
            <CardHeader>
              <CardTitle>Quiz Configuration</CardTitle>
              <CardDescription>
                Customize your quiz parameters below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Topic */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <BookOpen className="w-4 h-4" />
                    Topic
                  </label>
                  <Input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., JavaScript, World History, Biology..."
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter any subject you want to be quizzed on
                  </p>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Gauge className="w-4 h-4" />
                    Difficulty Level
                  </label>
                  <Select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    disabled={loading}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </Select>
                </div>

                {/* Number of Questions */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Hash className="w-4 h-4" />
                    Number of Questions
                  </label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="range"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                      min="1"
                      max="20"
                      disabled={loading}
                      className="flex-1"
                    />
                    <div className="w-16 h-12 rounded-lg border-2 border-indigo-200 bg-indigo-50 flex items-center justify-center font-bold text-indigo-600">
                      {numQuestions}
                    </div>
                  </div>
                </div>

                {/* Time Limit */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="w-4 h-4" />
                    Time Limit (minutes)
                  </label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="range"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                      min="1"
                      max="60"
                      disabled={loading}
                      className="flex-1"
                    />
                    <div className="w-16 h-12 rounded-lg border-2 border-purple-200 bg-purple-50 flex items-center justify-center font-bold text-purple-600">
                      {timeLimit}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading || !topic}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Quiz & Start
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: Live Preview */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card animated={false} className="sticky top-8">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                This is how your quiz will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Preview Card */}
              <div className="space-y-4">
                <div className={`h-40 rounded-xl bg-gradient-to-br ${getDifficultyColor()} p-6 relative overflow-hidden`}>
                  <motion.div
                    className="absolute inset-0 bg-white opacity-0"
                    animate={{ opacity: [0, 0.1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <Badge
                    variant={
                      difficulty === 'Easy' ? 'easy' :
                      difficulty === 'Medium' ? 'medium' :
                      'hard'
                    }
                    className="mb-3"
                  >
                    {difficulty}
                  </Badge>
                  <h3 className="text-white font-bold text-2xl truncate drop-shadow-lg">
                    {topic || 'Your Quiz Topic'}
                  </h3>
                  <p className="text-white/90 text-sm mt-2">
                    {numQuestions} {numQuestions === 1 ? 'question' : 'questions'} • {timeLimit} minutes
                  </p>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
                    <div className="text-3xl font-bold text-indigo-600">{numQuestions}</div>
                    <div className="text-sm text-gray-600 mt-1">Questions</div>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                    <div className="text-3xl font-bold text-purple-600">{timeLimit}</div>
                    <div className="text-sm text-gray-600 mt-1">Minutes</div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mt-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
                    AI-generated questions
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
                    Multiple choice format
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
                    Printable handout PDF
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
                    Separate answer key PDF
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QuizMaker;
