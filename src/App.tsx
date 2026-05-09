// Feature owner: Priya Aheer
// Module: Login page
// Handles login, signup, form validation, and local user session flow.

import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ATSChecker } from './components/ATSChecker';
import { MockTestView } from './components/MockTestView';
import { RoadmapView } from './components/RoadmapView';
import { HRConnectView } from './components/HRConnectView';
import { Chatbot } from './components/Chatbot';
import { HistoryView } from './components/HistoryView';
import { FileText, Navigation, PenLine, Users, LogOut, Sparkles, History } from 'lucide-react';

type View = 'login' | 'dashboard' | 'mock-test' | 'roadmap' | 'ats' | 'hr-connect' | 'history';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [isLogin, setIsLogin] = useState(true);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<Record<string, string>>({});

  useEffect(() => {
    setLoginError('');
  }, [isLogin]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const eTrimmed = email.trim();
    const pTrimmed = password.trim();

    if (isLogin) {
      if (eTrimmed && pTrimmed) {
        // Accept universally if no users registered yet to avoid friction, 
        // OR strictly check against registeredUsers if they actually signed up.
        if (registeredUsers[eTrimmed] === pTrimmed || (!registeredUsers[eTrimmed] && Object.keys(registeredUsers).length === 0)) {
          const nameFallback = eTrimmed.split('@')[0];
          setUserName(prev => prev || nameFallback);
          setCurrentView('dashboard');
        } else {
          setLoginError('Invalid email or password. Please try again.');
        }
      }
    } else {
      if (eTrimmed && pTrimmed && repeatPassword.trim()) {
        if (pTrimmed !== repeatPassword.trim()) {
          setLoginError('Passwords do not match.');
          return;
        }
        if (registeredUsers[eTrimmed]) {
          setLoginError('Email already registered. Please log in.');
          return;
        }
        setRegisteredUsers(prev => ({ ...prev, [eTrimmed]: pTrimmed }));
        const nameFallback = eTrimmed.split('@')[0];
        setUserName(prev => prev || nameFallback);
        setCurrentView('dashboard');
      }
    }
  };

  const handleLogout = () => {
    setCurrentView('login');
    setIsLogin(true);
    setEmail('');
    setPassword('');
    setRepeatPassword('');
    setUserName('');
  };

  const navItems = [
    { id: 'mock-test', label: 'Mock Tests', icon: PenLine, color: 'text-indigo-500' },
    { id: 'roadmap', label: 'Roadmaps', icon: Navigation, color: 'text-sky-500' },
    { id: 'ats', label: 'ATS Checker', icon: FileText, color: 'text-blue-500' },
    { id: 'history', label: 'History', icon: History, color: 'text-purple-500' },
    { id: 'hr-connect', label: 'HR Connect', icon: Users, color: 'text-blue-600' },
  ] as const;

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-blue-200 text-slate-800">
      
      {/* Soft Ethereal Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {/* Adjusted moving gradients to enhance the glassmorphism backdrop */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/40 mix-blend-multiply filter blur-[120px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-indigo-300/40 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] rounded-full bg-sky-300/30 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[60px]"></div>
      </div>

      <AnimatePresence mode="wait">
        {currentView === 'login' && (
          <motion.div 
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
            className="min-h-screen flex items-center justify-center p-6"
          >
            <div className="w-full max-w-[360px] bg-white/10 backdrop-blur-[24px] border border-white/30 p-10 pt-12 rounded-[2.5rem] shadow-[0_8px_32px_rgba(31,38,135,0.05)] flex flex-col relative overflow-hidden">
              
              {/* Top Bar */}
              <div className="flex justify-between items-start mb-12 w-full">
                <h2 className="text-[28px] leading-tight font-medium tracking-wide font-serif text-blue-950 w-2/3 text-left">
                  {isLogin ? 'Welcome Back!' : 'Create Account'}
                </h2>
                <button className="text-blue-950/60 hover:text-blue-950 transition-colors mt-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="8" x2="20" y2="8"></line>
                    <line x1="12" y1="16" x2="20" y2="16"></line>
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col w-full text-left">
                
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                     <div className="pb-6">
                        <label className="block text-[10px] font-bold tracking-[0.2em] text-blue-900/60 mb-3 uppercase">
                          Full Name
                        </label>
                        <input 
                          type="text" 
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Natalia Smith"
                          className="w-full px-5 py-4 bg-transparent border border-white/50 focus:border-blue-400 outline-none rounded-2xl text-sm text-blue-950 placeholder:text-blue-950/30 transition-all font-light"
                          required={!isLogin}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-blue-900/60 mb-3 uppercase">
                    Email
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="natolia@email.com"
                    className="w-full px-5 py-4 bg-transparent border border-white/50 focus:border-blue-400 outline-none rounded-2xl text-sm text-blue-950 placeholder:text-blue-950/30 transition-all font-light"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-blue-900/60 mb-3 uppercase">
                    Password
                  </label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-5 py-4 bg-transparent border border-white/50 focus:border-blue-400 outline-none rounded-2xl text-sm text-blue-950 placeholder:text-blue-950/30 transition-all font-light tracking-widest"
                    required
                  />
                </div>

                <AnimatePresence>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                     <div className="pt-2">
                        <label className="block text-[10px] font-bold tracking-[0.2em] text-blue-900/60 mb-3 uppercase">
                          Repeat Password
                        </label>
                        <input 
                          type="password" 
                          value={repeatPassword}
                          onChange={(e) => setRepeatPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-5 py-4 bg-transparent border border-white/50 focus:border-blue-400 outline-none rounded-2xl text-sm text-blue-950 placeholder:text-blue-950/30 transition-all font-light tracking-widest"
                          required={!isLogin}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {loginError && (
                  <div className="text-rose-500 text-xs font-medium text-center pt-2">
                    {loginError}
                  </div>
                )}

                <div className="pt-10 w-full flex justify-center pb-2">
                  <button 
                    type="submit"
                    className="w-full max-w-[200px] py-4 rounded-3xl bg-white/40 backdrop-blur-md border border-white/50 hover:bg-white/50 text-blue-950 font-medium tracking-widest text-xs uppercase transition-all shadow-[0_4px_15px_rgba(0,0,0,0.05)] mx-auto"
                  >
                    {isLogin ? 'Log In' : 'Sign Up'}
                  </button>
                </div>
                
                <div className="text-center mt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-[11px] text-blue-950/60 hover:text-blue-950 transition-colors"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {currentView !== 'login' && (
          <motion.div 
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col"
          >
            {/* Elegant Header */}
            <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
              <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="text-2xl font-serif text-blue-950 tracking-tight"
                >
                  ju.elevate
                </button>

                <div className="flex items-center gap-6">
                  {/* Desktop Nav */}
                  <nav className="hidden md:flex items-center gap-1 bg-white/20 backdrop-blur-xl rounded-full p-1 border border-white/30 shadow-inner">
                    {navItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id as View)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 border ${
                          currentView === item.id 
                            ? 'bg-white/60 border-white/50 text-blue-950 shadow-[0_2px_10px_rgba(0,0,0,0.05)] backdrop-blur-md' 
                            : 'border-transparent text-blue-800/70 hover:text-blue-950 hover:bg-white/30 hover:border-white/30'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    ))}
                  </nav>

                  <div className="flex items-center gap-4 border-l border-white/40 pl-6">
                    <span className="font-medium text-blue-900 hidden sm:inline-block">Hi, {userName}</span>
                    <button 
                      onClick={handleLogout}
                      className="p-2 text-blue-800/50 hover:text-blue-600 transition-all rounded-full hover:bg-white/30 hover:backdrop-blur-md border border-transparent hover:border-white/30"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </header>

            {/* Mobile Nav - below header on small screens */}
            <div className="md:hidden overflow-x-auto py-3 px-4 bg-white/10 backdrop-blur-2xl border-b border-white/20 flex gap-2 sticky top-20 z-40 hide-scrollbar">
               {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as View)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 border ${
                      currentView === item.id 
                        ? 'bg-white/50 border-white/60 text-blue-950 shadow-sm backdrop-blur-md' 
                        : 'bg-white/20 border-white/20 text-blue-800/80 backdrop-blur-sm hover:bg-white/30'
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </button>
                ))}
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12">
              <AnimatePresence mode="wait" initial={false}>
                
                {currentView === 'dashboard' && (
                  <motion.div 
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-12"
                  >
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                      <h2 className="text-4xl font-serif text-blue-950 leading-tight">
                        Welcome back, <br/><span className="text-blue-600 italic">{userName}</span>
                      </h2>
                      <p className="text-lg text-blue-800/70 font-light">
                        What would you like to achieve today?
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {navItems.map((item, idx) => (
                        <button
                          key={item.id}
                          onClick={() => setCurrentView(item.id as View)}
                          className="group relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-[30px] border border-white/30 p-8 rounded-[2rem] text-left transition-all duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 flex flex-col items-center justify-center text-center aspect-[4/3] sm:aspect-auto sm:min-h-[250px]"
                        >
                          <div className={`w-20 h-20 rounded-full bg-white/60 backdrop-blur-md border border-white/70 mb-6 flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.05)] group-hover:scale-110 transition-transform duration-500 ${item.color}`}>
                            <item.icon className="w-8 h-8" />
                          </div>
                          <h3 className="text-2xl font-serif text-blue-950 mb-2">{item.label}</h3>
                          <p className="text-blue-800/70 font-light text-sm sm:text-base max-w-[250px]">
                            {item.id === 'mock-test' && "Simulate real interview questions with a timer."}
                            {item.id === 'roadmap' && "Follow guided paths for your dream career."}
                            {item.id === 'ats' && "Optimize your resume to beat the algorithms."}
                            {item.id === 'history' && "Review your past resume analysis reports."}
                            {item.id === 'hr-connect' && "Network with top industry recruiters."}
                          </p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentView === 'mock-test' && (
                  <motion.div key="mock-test" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <MockTestView />
                  </motion.div>
                )}

                {currentView === 'roadmap' && (
                  <motion.div key="roadmap" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                     <RoadmapView />
                  </motion.div>
                )}

                {currentView === 'ats' && (
                  <motion.div key="ats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                     <ATSChecker />
                  </motion.div>
                )}

                {currentView === 'hr-connect' && (
                  <motion.div key="hr-connect" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                     <HRConnectView />
                  </motion.div>
                )}

                {currentView === 'history' && (
                  <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                     <HistoryView />
                  </motion.div>
                )}

              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
      <Chatbot />
    </div>
  );
}

