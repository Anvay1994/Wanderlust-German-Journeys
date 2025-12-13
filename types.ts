
export enum AppState {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  GAME_SESSION = 'GAME_SESSION',
  PROFILE = 'PROFILE',
  STORE = 'STORE',
  GUIDEBOOK = 'GUIDEBOOK',
  ADMIN = 'ADMIN'
}

export enum GermanLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2'
}

export interface UserProfile {
  name: string;
  level: GermanLevel;
  interests: string[];
  credits: number;
  xp: number;
  streak: number;
  completedModules: string[];
  unlockedModules: string[]; // Tracks modules purchased individually
  ownedLevels: GermanLevel[]; // Tracks full levels purchased
}

export interface CurriculumModule {
  id: string;
  level: GermanLevel;
  title: string;
  description: string;
  grammarFocus: string[];
  vocabularyTheme: string;
  missionType: 'Roleplay' | 'Investigation' | 'Puzzle' | 'Negotiation';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  translation?: string;
  grammarCorrection?: string;
  audioUrl?: string;
}

export interface PerformanceReview {
  strengths: string;
  weaknesses: string;
  feedback: string;
}

export interface MissionState {
  moduleId: string;
  messages: ChatMessage[];
  status: 'active' | 'completed' | 'failed';
  objectives: string[];
  objectivesCompleted: boolean[];
}

export interface SuggestedResponse {
  german: string;
  english: string;
}

export interface MissionBriefing {
  vocabulary: { german: string; english: string }[];
  lesson: {
    title: string;
    explanation: string;
    example: string;
    // New fields for detailed class-like structure
    grammarTable?: { headers: string[], rows: string[][] }; 
    commonMistakes?: string[];
  };
  keyPhrases: { german: string; english: string }[];
  culturalFact: string;
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number; // Index 0-3
  };
}

export interface PracticeDrill {
  id: string;
  level: GermanLevel;
  category: string;
  english: string;
  german: string; // Solution
  hint?: string;
}