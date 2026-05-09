import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { generateLesson, RoadmapStep } from '../lib/gemini';
import { UserStats, LessonContent } from '../types';
import { Sparkles, Trophy, Zap, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface GamifiedLearningProps {
  field: string;
  roadmap: RoadmapStep[];
  onBack: () => void;
}

export function GamifiedLearning({ field, roadmap, onBack }: GamifiedLearningProps) {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('user_stats');
    let initialStats: UserStats;
    
    try {
      initialStats = saved ? JSON.parse(saved) : {
        xp: 0,
        level: 1,
        streak: 0,
        lastActive: Date.now(),
        completedSteps: {},
        activeDomain: field
      };

      // Ensure completedSteps is a proper object if it was corrupted
      if (!initialStats.completedSteps || typeof initialStats.completedSteps !== 'object') {
        initialStats.completedSteps = {};
      }
    } catch (e) {
      initialStats = {
        xp: 0,
        level: 1,
        streak: 0,
        lastActive: Date.now(),
        completedSteps: {},
        activeDomain: field
      };
    }

    // Calculate streak
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const diff = now - initialStats.lastActive;
    
    if (diff < oneDay * 2) {
      if (diff > oneDay) initialStats.streak += 1;
    } else {
      initialStats.streak = 0;
    }
    initialStats.lastActive = now;
    
    return initialStats;
  });

  const [currentStepIdx, setCurrentStepIdx] = useState(() => {
    const saved = localStorage.getItem('user_stats');
    if (saved) {
      const parsed: UserStats = JSON.parse(saved);
      const completed = parsed.completedSteps[field] || [];
      // Find the first index that isn't completed
      for (let i = 0; i < roadmap.length; i++) {
        if (!completed.includes(i)) return i;
      }
      return 0; // If all completed, start over or stay at 0
    }
    return 0;
  });
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    fetchLesson(currentStepIdx);
  }, [currentStepIdx]);

  useEffect(() => {
    localStorage.setItem('user_stats', JSON.stringify(stats));
  }, [stats]);

  const fetchLesson = async (idx: number) => {
    setLoading(true);
    setQuizAnswer(null);
    setShowFeedback(false);
    try {
      const content = await generateLesson(field, roadmap[idx].title);
      setLesson(content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = (idx: number) => {
    setQuizAnswer(idx);
    const correct = idx === lesson?.quiz.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const xpGain = 50;
      setStats(prev => {
        const newXp = prev.xp + xpGain;
        const newLevel = Math.floor(newXp / 500) + 1;
        const currentDomainSteps = prev.completedSteps[field] || [];
        const newDomainSteps = currentDomainSteps.includes(currentStepIdx) 
          ? currentDomainSteps 
          : [...currentDomainSteps, currentStepIdx];
          
        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          completedSteps: {
            ...prev.completedSteps,
            [field]: newDomainSteps
          }
        };
      });
    }
  };

  const handleRetry = () => {
    setQuizAnswer(null);
    setShowFeedback(false);
    setIsCorrect(false);
  };

  const nextStep = () => {
    if (currentStepIdx < roadmap.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      onBack(); // Finished the roadmap!
    }
  };

  const completedIndices = stats.completedSteps[field] || [];
  const completedCount = completedIndices.length;
  const masteryPercent = Math.round((completedCount / roadmap.length) * 100);
  const xpToNextLevel = (stats.level * 500) - stats.xp;
  const levelProgress = ((stats.xp % 500) / 500) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Gamified Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/60 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest">Level</p>
            <p className="text-xl font-serif text-blue-950 font-bold">{stats.level}</p>
          </div>
          <div className="flex-1 ml-2">
            <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                className="h-full bg-blue-500" 
              />
            </div>
            <p className="text-[10px] text-blue-800/60 mt-1 text-right">{xpToNextLevel} XP to next level</p>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest">Streak</p>
            <p className="text-xl font-serif text-blue-950 font-bold">{stats.streak} Days</p>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md border border-white/60 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest">Mastery</p>
            <p className="text-xl font-serif text-blue-950 font-bold">{masteryPercent}%</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] overflow-hidden shadow-xl min-h-[600px] flex flex-col">
        {/* Progress Bar Container */}
        <div className="bg-white/20 border-b border-white/20">
          <div className="flex justify-between items-center px-6 py-2">
            <span className="text-[10px] font-bold text-blue-900/40 uppercase tracking-[0.2em]">Course Progress</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">{masteryPercent}% Complete</span>
          </div>
          <div className="h-2 w-full bg-blue-900/5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${masteryPercent}%` }}
              className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
            />
          </div>
        </div>

        <div className="p-8 md:p-12 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-12">
            <button 
              onClick={onBack}
              className="group flex items-center gap-2 text-sm text-blue-950/60 hover:text-blue-950 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Exit Learning
            </button>
            
            {/* Horizontal Mini-map Stepper */}
            <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto px-4 no-scrollbar max-w-[50%]">
              {roadmap.map((_, i) => {
                const isStepCompleted = completedIndices.includes(i);
                const isActive = i === currentStepIdx;
                
                return (
                  <div 
                    key={i}
                    onClick={() => setCurrentStepIdx(i)}
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer shrink-0 border",
                      isActive 
                        ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30 scale-110" 
                        : isStepCompleted
                          ? "bg-emerald-500 border-emerald-300 text-white"
                          : "bg-white/40 border-white/60 text-blue-900/40 hover:bg-white/60"
                    )}
                  >
                    {isStepCompleted ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                  </div>
                );
              })}
            </div>

            <div className="px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-200/50">
               <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Step {currentStepIdx + 1}/{roadmap.length}</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center py-20 gap-4"
              >
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-xl font-serif text-blue-900/60 animate-pulse">Generating your lesson...</p>
              </motion.div>
            ) : lesson ? (
              <motion.div
                key="lesson"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-serif text-blue-950 leading-tight">
                    {roadmap[currentStepIdx].title}
                  </h2>
                  <div className="prose prose-blue max-w-none text-blue-900/80 font-light leading-relaxed">
                    <ReactMarkdown>{lesson.content}</ReactMarkdown>
                  </div>
                </div>

                {/* Quiz Section */}
                <div className="pt-10 border-t border-blue-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-xl font-serif text-blue-950">Quick Quiz</h3>
                  </div>

                  <div className="bg-white/60 p-8 rounded-3xl border border-white/80 space-y-6">
                    <p className="text-lg text-blue-950 font-medium">{lesson.quiz.question}</p>
                    <div className="grid gap-3">
                      {lesson.quiz.options.map((opt, i) => (
                        <button
                          key={i}
                          disabled={showFeedback}
                          onClick={() => handleQuizSubmit(i)}
                          className={cn(
                            "w-full text-left p-5 rounded-2xl border-2 transition-all font-light",
                            showFeedback 
                              ? i === lesson.quiz.correctAnswer
                                ? "bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm"
                                : quizAnswer === i
                                  ? "bg-rose-50 border-rose-300 text-rose-900"
                                  : "bg-white/20 border-white/40 text-blue-950/40 opacity-60"
                              : "bg-white/40 border-white/60 text-blue-950 hover:bg-white/80 hover:border-blue-400"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span>{opt}</span>
                            {showFeedback && i === lesson.quiz.correctAnswer && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            )}
                            {showFeedback && quizAnswer === i && i !== lesson.quiz.correctAnswer && (
                              <AlertCircle className="w-5 h-5 text-rose-500" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {showFeedback && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pt-4 space-y-6"
                        >
                          <div className={cn(
                            "p-5 rounded-2xl",
                            isCorrect ? "bg-emerald-500/10 text-emerald-800" : "bg-rose-500/10 text-rose-800"
                          )}>
                             <p className="text-sm font-light italic leading-relaxed">
                               <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">Feedback</span>
                               {lesson.quiz.explanation}
                             </p>
                          </div>

                          {!isCorrect && (
                            <motion.div 
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="flex justify-center pt-2"
                            >
                              <button
                                onClick={handleRetry}
                                className="px-6 py-2.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-2"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                              </button>
                            </motion.div>
                          )}

                          {isCorrect && (
                            <motion.div 
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              className="flex flex-col items-center gap-4 py-4"
                            >
                              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg font-bold tracking-widest text-sm uppercase">
                                <Zap className="w-4 h-4 fill-white animate-pulse" />
                                +50 XP Gained!
                              </div>
                              <button
                                onClick={nextStep}
                                className="group flex items-center gap-2 text-blue-600 font-medium hover:gap-4 transition-all"
                              >
                                {currentStepIdx === roadmap.length - 1 ? 'Finish Roadmap' : 'Next Lesson'}
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
