// Feature owner: Ritika Khandelwal
// Module: Career roadmap feature
// Handles career field selection, roadmap generation, and learning progress flow.

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateRoadmap, RoadmapStep } from '../lib/gemini';
import { Map, ArrowRight, Zap, Trophy, Play, CheckCircle2 } from 'lucide-react';
import { GamifiedLearning } from './GamifiedLearning';
import { cn } from '../lib/utils';

const FIELDS = [
  "Software Engineering",
  "Artificial Intelligence / ML",
  "Web Development",
  "Data Science",
  "Product Management",
  "UI/UX Design",
];

export function RoadmapView() {
  const [selectedField, setSelectedField] = useState(() => {
    return localStorage.getItem('selected_career_field') || "";
  });
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (selectedField) {
      fetchRoadmap(selectedField);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('user_stats');
    if (saved) {
      setStats(JSON.parse(saved));
    }
  }, [isLearning]); // Refresh stats when returning from learning

  const fetchRoadmap = async (field: string) => {
    setSelectedField(field);
    localStorage.setItem('selected_career_field', field);
    
    // Refresh stats when switching fields
    const saved = localStorage.getItem('user_stats');
    if (saved) {
      setStats(JSON.parse(saved));
    }

    // Try to load cached roadmap first
    const cached = localStorage.getItem(`roadmap_${field}`);
    if (cached) {
      setRoadmap(JSON.parse(cached));
      return;
    }

    setLoading(true);
    try {
      const steps = await generateRoadmap(field);
      setRoadmap(steps);
      localStorage.setItem(`roadmap_${field}`, JSON.stringify(steps));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (isLearning) {
    return <GamifiedLearning field={selectedField} roadmap={roadmap} onBack={() => setIsLearning(false)} />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-serif text-blue-900">Career <span className="text-blue-600 italic">Roadmaps</span></h2>
        <p className="text-blue-700/70 font-light">Discover the path to your dream job and start your gamified learning journey.</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {FIELDS.map(field => (
          <button
            key={field}
            onClick={() => fetchRoadmap(field)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              selectedField === field 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white/50 text-blue-800 hover:bg-white hover:shadow-sm border border-white/60'
            }`}
          >
            {field}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-20">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          </motion.div>
        )}

        {!loading && roadmap.length > 0 && (
          <motion.div 
            key="roadmap" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-10"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/60 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                  <Zap className="w-32 h-32 text-blue-600" />
               </div>
               <div className="relative z-10 flex-1">
                  <h3 className="text-2xl font-serif text-blue-950 mb-2">Ready to level up?</h3>
                  <p className="text-blue-800/60 font-light">Start your gamified learning quest for <span className="font-medium text-blue-600">{selectedField}</span> now.</p>
               </div>
               <button 
                onClick={() => setIsLearning(true)}
                className="relative z-10 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-3xl font-bold tracking-widest text-xs uppercase shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
               >
                 <Play className="w-4 h-4 fill-current" />
                 Start Learning quest
               </button>
            </div>

            <div className="relative">
              {/* Soft connecting line */}
              <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-blue-200 via-sky-200 to-indigo-200 hidden md:block"></div>

              <div className="space-y-6">
                {roadmap.map((step, idx) => {
                  const isCompleted = stats?.completedSteps?.[selectedField]?.includes(idx);
                  
                  return (
                    <div key={idx} className="relative flex items-start gap-6 md:gap-10">
                      <div className={cn(
                        "hidden md:flex relative z-10 w-16 h-16 shrink-0 shadow-lg rounded-full items-center justify-center font-serif text-xl border-4 transition-all duration-500",
                        isCompleted 
                          ? "bg-emerald-500 border-emerald-200 text-white" 
                          : "bg-white border-blue-100 text-blue-600"
                      )}>
                        {isCompleted ? <Trophy className="w-6 h-6" /> : idx + 1}
                      </div>
                      <div className={cn(
                        "flex-1 backdrop-blur-md border p-8 rounded-3xl shadow-sm transition-all group",
                        isCompleted 
                          ? "bg-emerald-50/40 border-emerald-100/50" 
                          : "bg-white/60 border-white/60 hover:shadow-md"
                      )}>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className={cn(
                            "text-xl font-medium flex items-center gap-3",
                            isCompleted ? "text-emerald-950" : "text-blue-950"
                          )}>
                            <span className={cn(
                              "md:hidden w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                              isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                            )}>
                              {idx + 1}
                            </span>
                            {step.title}
                          </h3>
                          {isCompleted && (
                            <div className="hidden sm:flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Mastered
                            </div>
                          )}
                        </div>
                        <p className={cn(
                          "leading-relaxed font-light",
                          isCompleted ? "text-emerald-800/60" : "text-blue-800/80"
                        )}>{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
