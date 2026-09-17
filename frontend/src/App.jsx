import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import QuizMaker from './pages/QuizMaker';
import QuizView from './pages/QuizView';
import Dashboard from './pages/Dashboard';
import Footer from './components/Footer';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-right" richColors closeButton />
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quiz-maker" element={<QuizMaker />} />
          <Route path="/quiz/:id" element={<QuizView />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
