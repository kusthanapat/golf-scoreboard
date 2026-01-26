// Application configuration constants

export const config = {
  // Score validation
  score: {
    min: 1,
    max: 20,
    holesPerRound: 18,
  },

  // Par validation
  par: {
    min: 3,
    max: 6,
  },

  // Player name validation
  playerName: {
    minLength: 1,
    maxLength: 100,
  },

  // Course name validation
  courseName: {
    minLength: 1,
    maxLength: 200,
  },

  // Location validation
  location: {
    minLength: 1,
    maxLength: 100,
  },

  // Email validation
  email: {
    minLength: 3,
    maxLength: 255,
  },

  // Password validation
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: false, // Optional: can be enabled later
  },

  // Ranking groups
  ranking: {
    groupA: { min: 0, max: 12 },
    groupB: { min: 13, max: 24 },
    groupC: { min: 25, max: 36 },
    groupD: { min: 37, max: Infinity },
  },

  // Handicap calculation
  handicap: {
    multiplier: 1.5,
    adjustment: 0.8,
    minDifference: -50,
    maxDifference: 36,
  },

  // Google Sheets columns
  sheets: {
    stadium: {
      nameColumn: 0,      // A
      holesColumn: 1,     // B
      locationColumn: 2,  // C
      parsStartColumn: 3, // D
    },
    formRes: {
      timestampColumn: 0,    // A
      emailColumn: 1,        // B
      playerNameColumn: 2,   // C
      scoresStartColumn: 3,  // D-U (18 columns)
      locationColumn: 21,    // V
    },
  },

  // API configuration
  api: {
    defaultTimeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // UI configuration
  ui: {
    refreshInterval: 30000, // 30 seconds
    toastDuration: 3000,    // 3 seconds
    maxRecentItems: 10,
  },
} as const;

// Type-safe config access
export type Config = typeof config;
