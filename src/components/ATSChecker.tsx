import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCard } from './UploadCard';
import { ResultsDashboard } from './ResultsDashboard';
import { analyzeResume, ATSAnalysisResult } from '../lib/gemini';
import { AnalyzingAnimation } from './AnalyzingAnimation';

export function ATSChecker() {
  const [appState, setAppState] = useState<'idle' | 'analyzing' | 'results'>('idle');
  const [results, setResults] = useState<ATSAnalysisResult | null>(null);

  const handleAnalyze = async (file: File, jobDescription: string) => {
    setAppState('analyzing');
    try {
      const matchResult = await analyzeResume(file, jobDescription);
      
      // Save to history
      const history = JSON.parse(localStorage.getItem('ats_history') || '[]');
      const newRecord = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        fileName: file.name,
        jobDescription,
        result: matchResult
      };
      localStorage.setItem('ats_history', JSON.stringify([newRecord, ...history].slice(0, 50))); // Keep last 50

      setResults(matchResult);
      setAppState('results');
    } catch (error) {
      console.error(error);
      alert('An error occurred while analyzing the resume. Make sure you entered a valid Job Description and your API key is correctly configured.');
      setAppState('idle');
    }
  };

  const handleReset = () => {
    setResults(null);
    setAppState('idle');
  };

  return (
    <div className="w-full">
      {appState === 'results' && (
        <div className="flex justify-end mb-4">
          <button 
            onClick={handleReset}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Start Over
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {appState === 'idle' && (
          <motion.div 
            key="hero-upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            className="space-y-10"
          >
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-4xl font-serif text-blue-900 leading-tight">
                Perfect your <span className="text-blue-600 italic">resume</span>
              </h2>
              <p className="text-lg text-blue-700/70 font-light">
                Instantly analyze your resume against any job description.
              </p>
            </div>
            <UploadCard onAnalyze={handleAnalyze} />
          </motion.div>
        )}

        {appState === 'analyzing' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="flex justify-center py-10"
          >
            <AnalyzingAnimation />
          </motion.div>
        )}

        {appState === 'results' && results && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ResultsDashboard result={results} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
