import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Linkedin, Search, ExternalLink, Users, Loader2, Play, RefreshCw } from 'lucide-react';
import { recommendHRConnections } from '../lib/gemini';
import { HRProfile } from '../types';
import { cn } from '../lib/utils';

export function HRConnectView() {
  const [field, setField] = useState(() => localStorage.getItem('selected_career_field') || 'Software Engineering');
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<HRProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, [field]);

  const fetchConnections = async (query?: string, isAppend = false) => {
    if (query) setSearching(true);
    else if (!isAppend) setLoading(true);

    try {
      const results = await recommendHRConnections(field, query);
      if (isAppend) {
        setProfiles(prev => [...prev, ...results]);
      } else {
        setProfiles(results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    fetchConnections(searchQuery);
  };

  const loadMore = () => {
    fetchConnections(searchQuery || undefined, true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-6">
        <h2 className="text-5xl font-serif text-blue-900 leading-tight">
          Live Recruiter <span className="text-blue-600 italic">Finder</span>
        </h2>
        <p className="text-blue-700/70 font-light max-w-2xl mx-auto text-lg text-pretty">
          Instead of generic lists, we scout **real industry gatekeepers**. Connect with specialized agencies and use our precision LinkedIn search templates.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto relative group">
          <input 
            type="text" 
            placeholder="Search for agencies or niches (e.g. NVIDIA HR, UK Fintech)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-32 py-5 bg-white/60 backdrop-blur-xl border-2 border-white/80 rounded-[2rem] shadow-lg shadow-blue-500/5 focus:outline-none focus:border-blue-400 focus:bg-white transition-all text-blue-950 placeholder:text-blue-900/30"
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5 group-focus-within:scale-110 transition-transform" />
          <button 
            type="submit"
            disabled={searching}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {searching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
            Scout
          </button>
        </form>
      </div>

      <div className="flex justify-center">
        <div className="flex bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/60 shadow-sm overflow-x-auto max-w-full">
          {['Software Engineering', 'AI / ML', 'Data Science', 'Product Management', 'Cybersecurity'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setField(f);
                setSearchQuery('');
              }}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                field === f && !searchQuery
                  ? "bg-blue-500 text-white shadow-md" 
                  : "text-blue-900/60 hover:text-blue-900 hover:bg-white/40"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-32 flex flex-col items-center justify-center gap-6"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
              <Search className="absolute inset-0 m-auto w-5 h-5 text-blue-500 animate-pulse" />
            </div>
            <p className="text-blue-900/40 font-serif italic text-xl">Mining industry data for real connections...</p>
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profiles.map((hr, idx) => (
                <motion.div 
                  key={idx}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group flex flex-col items-center text-center relative overflow-hidden h-full"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-[4rem]"></div>
                  
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl transition-transform group-hover:scale-110 duration-700 bg-white">
                      <img src={hr.image} alt={hr.name} className="w-full h-full object-cover" />
                    </div>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-white",
                      hr.isSearchQuery ? "text-blue-500" : "text-emerald-500"
                    )}>
                      {hr.isSearchQuery ? <Search className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <h3 className="text-2xl font-serif text-blue-950 px-2 leading-tight line-clamp-2">{hr.name}</h3>
                    <p className="text-blue-800/60 font-light leading-relaxed italic line-clamp-3 px-4">
                      "{hr.role}"
                    </p>
                  </div>
                  
                  <div className="w-full mt-8 space-y-4">
                    <div className={cn(
                      "inline-block px-4 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-[0.2em] border",
                      hr.isSearchQuery ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                    )}>
                      {hr.isSearchQuery ? "Precision Search" : "Direct Pathway"}
                    </div>
                    
                    <a 
                      href={hr.linkedin} 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-3 bg-blue-950 text-white py-4 rounded-[1.5rem] font-bold tracking-[0.1em] text-[11px] uppercase hover:bg-blue-600 transition-all shadow-xl shadow-blue-950/20 active:scale-95 group/btn"
                    >
                      {hr.isSearchQuery ? 'Scout Now' : 'Forge Connection'}
                      <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="flex justify-center pt-8">
              <button 
                onClick={loadMore}
                disabled={searching}
                className="flex items-center gap-3 px-10 py-5 bg-white/60 backdrop-blur-md border-2 border-white/80 rounded-[2rem] text-blue-900 font-bold uppercase tracking-widest text-[10px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Scout More Connections
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-50/50 via-white/50 to-blue-50/50 rounded-[2.5rem] p-10 border border-blue-100 text-center space-y-6">
        <div className="flex justify-center gap-1.5">
          {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>)}
        </div>
        <p className="text-blue-900/80 font-light italic text-lg leading-relaxed">
          "The best way to get hired is to be **found**. Our precision search patterns are designed to drop you directly into the feeds of the world's most active recruiters."
        </p>
        <div className="text-blue-600 font-serif font-bold uppercase tracking-widest text-[10px]">
          Live Industry Intelligence Engine
        </div>
      </div>
    </div>
  );
}
