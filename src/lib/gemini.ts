import { GoogleGenAI, Type } from "@google/genai";
import mammoth from "mammoth";

// We use the modern genai SDK. The key is exposed via process.env in Vite in this environment.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ATSAnalysisResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  sectionAnalysis: {
    contactInfo: boolean;
    skillsSection: boolean;
    experienceFormatting: boolean;
    education: boolean;
  };
  improvements: {
    category: string;
    suggestion: string;
    rewrittenExample?: string;
  }[];
}

export async function parseDocxToText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve(result.value);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export interface MockTestQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export async function generateMockTest(field: string): Promise<MockTestQuestion[]> {
  try {
    const responseSchema = {
      type: Type.ARRAY,
      description: "A list of 5 multiple choice questions for the given field.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Exactly 4 options"
          },
          correctAnswer: { 
            type: Type.INTEGER,
            description: "The index of the correct option (0-3)"
          }
        },
        required: ["question", "options", "correctAnswer"]
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [{ role: "user", parts: [{ text: `Generate a 5-question multiple choice test for a college student preparing for a job interview in the field of: ${field}. Make the questions challenging but fair. Return exactly 4 options per question.` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonStr = response.text?.trim() || "[]";
    return JSON.parse(jsonStr) as MockTestQuestion[];
  } catch (err) {
    console.error("Error generating mock test:", err);
    throw err;
  }
}

export interface RoadmapStep {
  title: string;
  description: string;
}

export async function generateRoadmap(field: string): Promise<RoadmapStep[]> {
  try {
    const responseSchema = {
      type: Type.ARRAY,
      description: "A step-by-step roadmap for learning and getting a job in the field.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["title", "description"]
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [{ role: "user", parts: [{ text: `Create a comprehensive, 5-to-7 step roadmap for a college student who wants to build a career in: ${field}. Keep descriptions concise but inspiring.` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonStr = response.text?.trim() || "[]";
    return JSON.parse(jsonStr) as RoadmapStep[];
  } catch (err) {
    console.error("Error generating roadmap:", err);
    throw err;
  }
}

export async function generateLesson(field: string, topic: string): Promise<any> {
    try {
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING, description: "Educational content for the lesson in Markdown format. Keep it concise, engaging, and highly informative." },
          quiz: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER, description: "Index of correct option (0-3)" },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        },
        required: ["content", "quiz"]
      };
  
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [{ role: "user", parts: [{ text: `Act as a senior mentor in ${field}. Teach me about "${topic}". Provide a concise lesson (markdown) followed by a challenging 1-question quiz to test understanding. Make the tone gamified and encouraging.` }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.8,
        },
      });
  
      const jsonStr = response.text?.trim() || "{}";
      return JSON.parse(jsonStr);
    } catch (err) {
      console.error("Error generating lesson:", err);
      throw err;
    }
}

export async function recommendHRConnections(field: string, customQuery?: string): Promise<any[]> {
  try {
    const responseSchema = {
      type: Type.ARRAY,
      description: "A list of real-world recruiting entities or search patterns for the given field.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the agency, role type, or connection hub" },
          role: { type: Type.STRING, description: "Context about why this connection is valuable" },
          field: { type: Type.STRING },
          image: { type: Type.STRING, description: "Icon or avatar URL" },
          linkedin: { type: Type.STRING, description: "LinkedIn search URL or company page" },
          isSearchQuery: { type: Type.BOOLEAN, description: "True if this is a search query template" },
          category: { type: Type.STRING, description: "Agency, Headhunter, or Search Hubble" }
        },
        required: ["name", "role", "field", "image", "linkedin", "isSearchQuery"]
      }
    };

    const prompt = customQuery 
      ? `I am looking for recruitment connections related to: "${customQuery}". Find 9 real-world recruitment pathways. Include specific high-end agencies and advanced LinkedIn search URLs for that niche.`
      : `I am a student looking for a job in ${field}. Recommend 9 real-world recruitment pathways. This must include specific top-tier recruiting agencies (e.g., CyberCoders, Robert Half, Hays, etc.) and direct LinkedIn search links for 'Technical Recruiters' at big tech companies. Return a mix of real names and search templates. Image should be a Pravatar link 1-70.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8,
      },
    });

    const jsonStr = response.text?.trim() || "[]";
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Error recommending HR connections:", err);
    return [];
  }
}

export async function analyzeResume(file: File, jobDescription: string): Promise<ATSAnalysisResult> {
  try {
    let parts: any[] = [];
    
    // Add Job Description text
    parts.push({ text: `Here is the Job Description:\n${jobDescription}\n` });
    parts.push({ text: `Please act as an ATS software. Analyze this resume against the job description. Keep the feedback extremely concise to maximize speed. Limit improvements to top 3 priority items. Provide highly specific, short advice.` });

    if (file.name.endsWith(".docx")) {
      // DOCX - parse text client-side
      const resumeText = await parseDocxToText(file);
      parts.push({ text: `Here is the plain text extracted from the candidate's DOCX resume:\n${resumeText}` });
    } else if (file.type === "application/pdf") {
      // PDF - send directly. Gemini reads PDFs beautifully
      const base64Data = await fileToBase64(file);
      parts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: base64Data,
        },
      });
    } else {
      // txt or basic fallback
      const text = await file.text();
      parts.push({ text: `Here is the candidate's resume text:\n${text}` });
    }

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        score: {
          type: Type.INTEGER,
          description: "An ATS match score from 0 to 100 representing how well the resume fits the job description.",
        },
        matchedKeywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Key skills and terms present in BOTH the job description and resume.",
        },
        missingKeywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Important skills, tools, or domain terms from the job description missing in the resume.",
        },
        sectionAnalysis: {
          type: Type.OBJECT,
          description: "Checklist evaluating if specific standard resume sections are present and well-formatted.",
          properties: {
            contactInfo: { type: Type.BOOLEAN },
            skillsSection: { type: Type.BOOLEAN },
            experienceFormatting: { type: Type.BOOLEAN },
            education: { type: Type.BOOLEAN },
          },
          required: ["contactInfo", "skillsSection", "experienceFormatting", "education"],
        },
        improvements: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "Category of improvement (e.g., 'Impact & Metrics', 'Keyword Optimization', 'Clarity')." },
              suggestion: { type: Type.STRING, description: "Highly nuanced and personalized advice based on the specific resume content." },
              rewrittenExample: { type: Type.STRING, description: "A concrete example of how to rewrite a specific bullet point from the resume to better match the job description. (Optional)" }
            },
            required: ["category", "suggestion"]
          },
          description: "Actionable, tailored improvements with rewritten examples where applicable.",
        },
      },
      required: ["score", "matchedKeywords", "missingKeywords", "sectionAnalysis", "improvements"],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite", // Use Flash Lite for speed and cost-efficiency
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for more analytical/consistent scoring
      },
    });

    const jsonStr = response.text?.trim() || "{}";
    const result = JSON.parse(jsonStr) as ATSAnalysisResult;
    return result;
  } catch (err) {
    console.error("Error analyzing resume with Gemini:", err);
    throw err;
  }
}
