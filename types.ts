
export interface JobMatch {
  role: string;
  fit_score: number;
  reason: string;
}

export interface Improvement {
  issue: string;
  suggestion: string;
  example_fix?: string;
}

export interface ResumeAnalysis {
  advisorNote: string;
  summary: string;
  skills: string[];
  missingSkills: string[];
  job_matches: JobMatch[];
  improvements: Improvement[];
  score: number;
  atsScore: number;
  improvedBulletPoints: { original: string; improved: string }[];
  atsAnalysis: {
    formattingStatus: 'Good' | 'Warning' | 'Critical';
    formattingFeedback: string;
    keywordDensityScore: number;
    standardSectionsFound: string[];
    missingStandardSections: string[];
  };
}

export interface User {
  id: string;
  email: string;
  password?: string; // In a real app, never store passwords in plaintext or send back to client
  name?: string;
}

export enum AppState {
  HOME = 'HOME',
  AUTH_LOGIN = 'AUTH_LOGIN',
  AUTH_SIGNUP = 'AUTH_SIGNUP',
  INPUT = 'INPUT',
  RESULTS = 'RESULTS',
  DASHBOARD = 'DASHBOARD'
}
