import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface ScoreCircleProps {
  score: number;
}

export function ScoreCircle({ score }: ScoreCircleProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Simple way to animate the counting number
    let start = 0;
    const duration = 1500; // ms
    const increment = score / (duration / 16); 
    
    const animate = () => {
      start += increment;
      if (start < score) {
        setAnimatedScore(Math.ceil(start));
        requestAnimationFrame(animate);
      } else {
        setAnimatedScore(score);
      }
    };
    
    if (score > 0) {
      animate();
    }
  }, [score]);

  // Determine color based on score
  let strokeColor = "#fb7185"; // rose-400
  if (score >= 75) strokeColor = "#34d399"; // emerald-400
  else if (score >= 50) strokeColor = "#fcd34d"; // amber-300

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-40 h-40 transform -rotate-90 filter drop-shadow-sm">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="8"
          fill="transparent"
          className="text-white/60"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke={strokeColor}
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-serif text-blue-950">
          {animatedScore}<span className="text-2xl text-blue-700/50 mix-blend-multiply">%</span>
        </span>
      </div>
    </div>
  );
}
