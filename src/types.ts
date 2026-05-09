import { ATSAnalysisResult } from './lib/gemini';

export interface HistoryRecord {
  id: string;
  timestamp: number;
  fileName: string;
  jobDescription: string;
  result: ATSAnalysisResult;
}

export interface HRProfile {
  name: string;
  role: string;
  field: string;
  image: string;
  linkedin: string;
  isSearchQuery?: boolean;
  category?: string;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastActive: number;
  completedSteps: Record<string, number[]>; // domain -> step indices
  activeDomain?: string;
}

export interface LessonContent {
  content: string;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
}
