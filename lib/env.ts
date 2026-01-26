// Environment variable validation and access

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (!value && !defaultValue) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please check your .env.local file and ensure ${key} is set.`
    );
  }

  return value || defaultValue!;
}

function getPublicEnvVar(key: string, defaultValue?: string): string {
  if (typeof window !== 'undefined') {
    // Client-side
    return (window as any).ENV?.[key] || defaultValue || '';
  }
  // Server-side
  return getEnvVar(key, defaultValue);
}

// Validate all required environment variables on startup
export function validateEnv(): void {
  const required = [
    'NEXT_PUBLIC_GOOGLE_SHEET_ID',
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\n` +
      `Please copy .env.example to .env.local and fill in the required values.`
    );
  }
}

// Export validated environment variables
export const env = {
  // Google Sheets
  googleSheetId: getEnvVar('NEXT_PUBLIC_GOOGLE_SHEET_ID'),
  googleServiceAccountEmail: getEnvVar('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
  googlePrivateKey: getEnvVar('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n'),

  // Supabase
  supabaseUrl: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),

  // Application
  defaultLocation: getEnvVar('DEFAULT_LOCATION', 'Bangkok'),
  refreshIntervalMs: parseInt(getEnvVar('REFRESH_INTERVAL_MS', '30000'), 10),
  sheetNameStadium: getEnvVar('GOOGLE_SHEET_NAME_STADIUM', 'Name_stadium'),
  sheetNameFormRes: getEnvVar('GOOGLE_SHEET_NAME_FORM_RES', 'Form_Res'),

  // API
  rateLimitMaxRequests: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  rateLimitWindowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '60000'), 10),
} as const;

// Public environment variables for client-side use
export const publicEnv = {
  googleSheetId: getPublicEnvVar('NEXT_PUBLIC_GOOGLE_SHEET_ID'),
  supabaseUrl: getPublicEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: getPublicEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
} as const;
