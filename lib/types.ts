// Shared TypeScript types for the application

export interface Course {
  id?: string;
  name: string;
  location: string;
  numHoles: number;
  pars: number[];
}

export interface Score {
  id?: string;
  playerName: string;
  location: string;
  scores: number[];
  courseName: string;
  totalScore: number;
  totalPar: number;
  timestamp: string;
}

export interface RankingPlayer {
  name: string;
  location: string;
  totalScore: number;
  numRounds: number;
  handicap: number;
  rank?: number;
  confirmed: number;
}

export interface GoogleSheetRow {
  values: Array<string | number>;
}

export interface ApiError {
  error: string;
  message?: string;
  code?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// Form validation types
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Province data
export interface Province {
  name: string;
  code?: string;
}
