import { motion } from "motion/react";
import { ATSAnalysisResult } from "../lib/gemini";
import { ScoreCircle } from "./ScoreCircle";
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, Lightbulb } from "lucide-react";
import { cn } from "../lib/utils";

interface ResultsDashboardProps {
  result: ATSAnalysisResult;
  onReset?: () => void;
}

export function ResultsDashboard({ result, onReset }: ResultsDashboardProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full max-w-5xl mx-auto space-y-8"
    >
      {/* Top Banner */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-serif text-blue-900">Analysis <span className="text-blue-600 italic">Complete</span></h2>
          <p className="text-blue-700/70 font-light mt-1">Here is how your resume stacks up against the job description.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Score Card */}
        <motion.div variants={item} className="md:col-span-1 bg-white border border-slate-200/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm">
          <ScoreCircle score={result.score} />
          <h3 className="text-lg font-semibold text-slate-900 mt-6">ATS Match Score</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-[200px]">
            {result.score >= 80 
              ? "Great match! You are highly likely to pass the ATS screen." 
              : result.score >= 50 
              ? "Fair match. Adding some key keywords will improve your chances."
              : "Low match. A thorough rewrite is recommended to target this role."}
          </p>
        </motion.div>

        {/* Keywords Matching */}
        <motion.div variants={item} className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-8 flex-1 shadow-sm">
            <h3 className="text-xl font-serif text-blue-950 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Matched Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.matchedKeywords.length > 0 ? (
                result.matchedKeywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200/50">
                    {kw}
                  </span>
                ))
              ) : (
                <span className="text-blue-800/50 text-sm font-light">No significant keywords matched.</span>
              )}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-8 flex-1 shadow-sm">
            <h3 className="text-xl font-serif text-blue-950 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Missing Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.missingKeywords.length > 0 ? (
                result.missingKeywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium border border-amber-200/50">
                    {kw}
                  </span>
                ))
              ) : (
                <span className="text-blue-800/50 text-sm font-light">Great job! No major keywords missing.</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Section Checklist */}
        <motion.div variants={item} className="md:col-span-1 bg-white/60 backdrop-blur-md border border-white/60 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-serif text-blue-950 mb-6">Structure Check</h3>
          <ul className="space-y-4">
            <ChecklistItem label="Contact Information" passed={result.sectionAnalysis.contactInfo} />
            <ChecklistItem label="Skills Section" passed={result.sectionAnalysis.skillsSection} />
            <ChecklistItem label="Experience Formatting" passed={result.sectionAnalysis.experienceFormatting} />
            <ChecklistItem label="Education" passed={result.sectionAnalysis.education} />
          </ul>
        </motion.div>

        {/* Actionable Improvements */}
        <motion.div variants={item} className="md:col-span-2 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <Lightbulb className="w-32 h-32 text-blue-300" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-serif text-blue-950 mb-6 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-500" />
              Suggested Improvements
            </h3>
            <div className="space-y-6">
              {result.improvements.length > 0 ? (
                result.improvements.map((imp, i) => (
                  <div key={i} className="flex gap-4 items-start bg-white/60 p-5 rounded-2xl border border-white/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                    <div className="mt-1 bg-blue-100 p-2 rounded-xl border border-blue-200/50">
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="space-y-3 w-full">
                      <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">{imp.category}</h4>
                      <p className="text-blue-800 leading-relaxed text-sm md:text-base font-light">{imp.suggestion}</p>
                      {imp.rewrittenExample && (
                        <div className="mt-4 bg-white/80 border border-blue-100/50 p-4 rounded-xl text-sm shadow-sm relative">
                          <span className="block text-xs font-semibold text-blue-500 mb-1 tracking-wide uppercase">Example Before/After: </span>
                          <span className="text-blue-900 font-serif italic block">"{imp.rewrittenExample}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex gap-4 items-start bg-white/60 p-5 rounded-2xl border border-white/80">
                  <div className="mt-1 bg-emerald-100 p-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-blue-800 leading-relaxed text-sm font-light">Your resume is perfectly targeted. Make sure the font and spacing are visually clean before sending!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

function ChecklistItem({ label, passed }: { label: string; passed: boolean }) {
  return (
    <li className="flex items-center gap-3">
      {passed ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      ) : (
        <XCircle className="w-5 h-5 text-blue-900/20" />
      )}
      <span className={cn("text-sm font-medium", passed ? "text-blue-900" : "text-blue-900/40 line-through")}>
        {label}
      </span>
    </li>
  );
}
