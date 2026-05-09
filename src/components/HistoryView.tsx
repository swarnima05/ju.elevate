import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HistoryRecord } from '../types';
import { ResultsDashboard } from './ResultsDashboard';
import { Trash2, Calendar, FileText, ChevronRight, Clock, Search, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

export function HistoryView() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedHistory = localStorage.getItem('ats_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // Sort by timestamp descending
        setHistory(parsed.sort((a: HistoryRecord, b: HistoryRecord) => b.timestamp - a.timestamp));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const deleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(r => r.id !== id);
    setHistory(newHistory);
    localStorage.setItem('ats_history', JSON.stringify(newHistory));
  };

  const filteredHistory = history.filter(r => 
    r.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.jobDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (selectedRecord) {
    return (
      <div className="w-full">
        <button 
          onClick={() => setSelectedRecord(null)}
          className="mb-8 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to History
        </button>
        <ResultsDashboard result={selectedRecord.result} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-serif text-blue-900 leading-tight">
          Your Analysis <span className="text-blue-600 italic">History</span>
        </h2>
        <p className="text-lg text-blue-700/70 font-light">
          Review your past resume evaluations and track your progress.
        </p>
      </div>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-900/30 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text"
          placeholder="Search by filename or job description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white/40 border border-white/60 focus:border-blue-400 outline-none rounded-2xl text-blue-950 placeholder:text-blue-950/30 transition-all font-light backdrop-blur-sm shadow-sm"
        />
      </div>

      <AnimatePresence mode="popLayout">
        {filteredHistory.length > 0 ? (
          <div className="grid gap-4">
            {filteredHistory.map((record) => (
              <motion.div
                key={record.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onClick={() => setSelectedRecord(record)}
                className="group relative bg-white/60 backdrop-blur-md border border-white/60 p-6 rounded-3xl hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer overflow-hidden"
              >
                {/* Progress bar background indicator */}
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-blue-500/20" 
                  style={{ width: `${record.result.score}%` }}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-110 transition-transform duration-500">
                      <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-blue-950 line-clamp-1">{record.fileName}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="flex items-center gap-1 text-xs text-blue-700/60">
                          <Clock className="w-3 h-3" />
                          {formatDate(record.timestamp)}
                        </span>
                        <span className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded-full",
                          record.result.score >= 80 ? "bg-emerald-50 text-emerald-600" :
                          record.result.score >= 60 ? "bg-blue-50 text-blue-600" :
                          "bg-rose-50 text-rose-600"
                        )}>
                          Score: {record.result.score}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <button 
                      onClick={(e) => deleteRecord(record.id, e)}
                      className="p-3 text-blue-800/30 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-xl border border-transparent hover:border-rose-100"
                      title="Delete Record"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="p-3 text-blue-800/30 group-hover:text-blue-500 transition-colors">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-100 font-light text-sm text-blue-900/60 line-clamp-2 italic">
                  "{record.jobDescription}"
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/20 backdrop-blur-sm rounded-[2.5rem] border border-white/40"
          >
            <div className="w-20 h-20 bg-white/60 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Clock className="w-10 h-10 text-blue-200" />
            </div>
            <h3 className="text-xl font-serif text-blue-900/60">No history found</h3>
            <p className="text-blue-800/40 mt-2 font-light">Analyzed resumes will appear here.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
