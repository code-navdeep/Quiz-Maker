import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, TrendingUp, FileText, Target, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import QuizCard from '../components/QuizCard';
import { api } from '../lib/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    avgDifficulty: '—',
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const data = await api.getAllQuizzes();
      setQuizzes(data);
      calculateStats(data);
    } catch (error) {
      console.error('Failed to fetch quizzes', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (quizzesData) => {
    const total = quizzesData.length;
    const totalQs = quizzesData.reduce((sum, quiz) => sum + (quiz.questions?.length || 0), 0);

    let avgDifficulty = '—';
    if (total > 0) {
      const counts = {};
      quizzesData.forEach((quiz) => {
        counts[quiz.difficulty] = (counts[quiz.difficulty] || 0) + 1;
      });
      const topCount = Math.max(...Object.values(counts));
      const leaders = Object.keys(counts).filter((d) => counts[d] === topCount);
      avgDifficulty = leaders.length === 1 ? leaders[0] : 'Mixed';
    }

    setStats({
      totalQuizzes: total,
      totalQuestions: totalQs,
      avgDifficulty,
    });
  };

  const handleDeleteQuiz = async (id) => {
    try {
      await api.deleteQuiz(id);
      toast.success('Quiz deleted successfully');
      setQuizzes(quizzes.filter(quiz => quiz.id !== id));
      calculateStats(quizzes.filter(quiz => quiz.id !== id));
    } catch (error) {
      console.error('Failed to delete quiz', error);
      toast.error('Failed to delete quiz');
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.topic?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Quiz Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage and track all your quizzes</p>
        </div>
        <Button onClick={() => navigate('/quiz-maker')} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Create New Quiz
        </Button>
      </motion.div>

      {/* Stats - Bento Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Total Quizzes */}
        <Card className="border-2 border-indigo-100 hover:border-indigo-300 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Quizzes</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{stats.totalQuizzes}</div>
            <p className="text-sm text-gray-500 mt-1">Active quiz collections</p>
          </CardContent>
        </Card>

        {/* Total Questions */}
        <Card className="border-2 border-emerald-100 hover:border-emerald-300 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Questions</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{stats.totalQuestions}</div>
            <p className="text-sm text-gray-500 mt-1">Questions generated</p>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="border-2 border-orange-100 hover:border-orange-300 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Average Difficulty</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{stats.avgDifficulty}</div>
            <p className="text-sm text-gray-500 mt-1">Across all quizzes</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search quizzes by topic..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12"
        />
      </motion.div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-6">
                <FileText className="w-12 h-12 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {searchQuery ? 'No quizzes found' : 'No quizzes yet'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Create your first AI-powered quiz to get started on your learning journey'}
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate('/quiz-maker')} size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Quiz
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredQuizzes.map((quiz) => (
            <motion.div key={quiz.id} variants={itemVariants}>
              <QuizCard quiz={quiz} onDelete={handleDeleteQuiz} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;
