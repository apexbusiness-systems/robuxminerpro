// Data types for the application

export interface GuardrailHit {
  node: Element;
  from: string;
  to: string;
}

export interface Squad {
  name: string;
  description: string;
  members?: number;
  rank?: number;
  score?: number;
}

export interface Event {
  title: string;
  description: string;
  status: 'live' | 'ongoing' | 'upcoming' | 'past';
  endsIn?: string;
  reward?: string;
  participants: number;
}

export interface Achievement {
  title: string;
  description: string;
  earned: boolean;
  progress: number;
  maxProgress: number;
}

export interface LearningPath {
  title: string;
  description: string;
  progress: number;
  modules: number;
  completed: number;
}

export interface EarningsSession {
  balance: number;
  perMinute: number;
  elapsed: string;
}

export interface EarningsStreak {
  days: number;
}

export type AnyObj = Record<string, unknown>;
