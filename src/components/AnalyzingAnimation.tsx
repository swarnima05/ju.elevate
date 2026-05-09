import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { FileSearch } from "lucide-react";

const STAGES = [
  "Parsing document structure...",
  "Extracting text and formatting...",
  "Cross-referencing job requirements...",
  "Scoring keyword density...",
  "Generating actionable insights..."
];

const KEYWORDS = [
  "React", "Leadership", "Python", "Agile", "TypeScript", 
  "SQL", "Communication", "Design", "Node.js", "Marketing",
  "Strategy", "Collaboration", "AWS", "Product", "Analysis"
];

export function AnalyzingAnimation() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % STAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm">
      {/* Floating Keywords Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {KEYWORDS.map((kw, i) => {
          // Deterministic pseudo-randomness based on index for stable renders
          const randomX = (Math.sin(i * 123) * 200); 
          const randomY = (Math.cos(i * 321) * 150);
          const delay = (i % 5) * 0.4;
          const duration = 2.5 + (i % 3);
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
              animate={{ 
                opacity: [0, 0.3, 0], 
                x: randomX, 
                y: randomY,
                scale: [0.5, 1, 0.8]
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "linear",
              }}
              className="absolute text-blue-400/40 font-mono text-sm tracking-wider font-bold whitespace-nowrap"
            >
              {kw}
            </motion.div>
          );
        })}
      </div>

      <div className="relative w-32 h-32 mb-10 z-10">
        <motion.div 
          animate={{ scale: [1, 1.05, 1] }} 
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut"}}
          className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-indigo-50/50 rounded-3xl shadow-inner border border-white flex flex-col items-center justify-center transform rotate-3"
        >
           <FileSearch className="w-12 h-12 text-blue-400 drop-shadow-sm transform -rotate-3" />
        </motion.div>
        
        {/* Scanner Line */}
        <motion.div
           animate={{ top: ['0%', '100%', '0%'] }}
           transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
           className="absolute left-0 right-0 h-[2px] bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-20 rounded-full"
        />
      </div>

      <div className="text-center space-y-3 z-10 relative h-24 w-full px-4 rounded-3xl">
        <h2 className="text-3xl font-serif text-blue-950">Analyzing Match</h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={stageIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="text-blue-800/80 font-light"
          >
            {STAGES[stageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
