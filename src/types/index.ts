// ─── Lesson ───────────────────────────────────────────────────────────────────
export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoId: string;
  description?: string;
  isCompleted?: boolean;
  order: number;
}

// ─── Step ─────────────────────────────────────────────────────────────────────
export interface Step {
  id: string;
  title: string;
  detail: string;
  order: number;
  isImportant?: boolean;
  tips?: string[];
}

// ─── Tool ─────────────────────────────────────────────────────────────────────
export interface Tool {
  id: string;
  name: string;
  description?: string;
  category: 'primary' | 'secondary' | 'optional';
  image?: string;
}

// ─── Chapter ──────────────────────────────────────────────────────────────────
export interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

// ─── Module ───────────────────────────────────────────────────────────────────
export interface Module {
  id: string;
  title: string;
  category: string;
  color: string;
  progress: number;
  videos: number;
  introVideoId: string;
  description: string;
  objectives: string[];
  chapters: Chapter[];
  steps: Step[];
  tools: Tool[];
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  learningOutcomes: string[];
  totalLessons?: number;
  lastAccessed?: string;
}

// ─── Quiz Question ────────────────────────────────────────────────────────────
export interface QuizQuestion {
  question: string;
  answers: string[];
  correct: number;
}

// ─── Quiz Data ────────────────────────────────────────────────────────────────
export interface QuizData {
  moduleId: string;
  questions: QuizQuestion[];
}

// ─── History Entry ────────────────────────────────────────────────────────────
export interface HistoryEntry {
  id: string;
  moduleId: string;
  moduleTitle: string;
  moduleColor: string;
  type: 'materi' | 'quiz';
  score?: number;
  total?: number;
  passed?: boolean;
  date: string;
  timestamp: number;
}

// ─── Theme ────────────────────────────────────────────────────────────────────
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  card: string;
}
