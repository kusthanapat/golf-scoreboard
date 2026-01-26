# Golf Scoreboard

A production-ready Next.js application for managing golf scores with Google Sheets and Supabase integration.

## Features

- User authentication with Supabase
- Course setup and management
- Score entry and tracking
- Google Sheets integration for data storage
- Responsive design with Tailwind CSS
- Comprehensive input validation and sanitization
- Production-ready error handling
- API rate limiting
- Type-safe TypeScript implementation
- Secure environment variable management

## Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm (recommended) or npm
- A Google Cloud service account with Google Sheets API access
- A Supabase project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd golf
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:

Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

### Required Variables (.env.local)
```bash
# Google Sheets
NEXT_PUBLIC_GOOGLE_SHEET_ID=your_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Application
DEFAULT_LOCATION=Bangkok
REFRESH_INTERVAL_MS=30000
GOOGLE_SHEET_NAME_STADIUM=Name_stadium
GOOGLE_SHEET_NAME_FORM_RES=Form_Res

# API (Optional - has defaults)
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

**IMPORTANT**: Never commit `.env.local` to git!

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS 4
- **Database**: Supabase
- **External Integration**: Google Sheets API
- **Language**: TypeScript
- **Package Manager**: pnpm

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── [pages]/           # Page components
├── components/            # Reusable React components
├── lib/                   # Utility libraries
│   ├── env.ts            # Environment variable validation
│   ├── errors.ts         # Error handling utilities
│   ├── validation.ts     # Input validation functions
│   ├── google-sheets.ts  # Google Sheets API client
│   ├── logger.ts         # Logging utility
│   ├── rate-limit.ts     # Rate limiting middleware
│   ├── config.ts         # Application configuration
│   └── types.ts          # Shared TypeScript types
└── data/                  # Static data files
```

## Security & Quality Features

- **Input Validation**: Server-side validation for all user inputs
- **XSS Protection**: Input sanitization to prevent cross-site scripting
- **Rate Limiting**: IP-based rate limiting on all API endpoints (100 req/min)
- **Error Handling**: Comprehensive error boundaries and safe error responses
- **Type Safety**: Full TypeScript with proper types
- **Environment Variables**: Validated and type-safe environment configuration
- **Logging**: Production-ready logging system

## Utility Libraries

### Google Sheets Client (`lib/google-sheets.ts`)
- Singleton pattern to reuse auth client
- Functions: `getSheetsClient()`, `getSheetData()`, `appendSheetData()`, `updateSheetData()`, `deleteSheetRows()`, `getSheetIdByName()`

### Error Handling (`lib/errors.ts`)
- `AppError` class for application-specific errors
- `createErrorResponse()` - Safe error responses
- `getErrorMessage()` - Client-side error extraction

### Validation (`lib/validation.ts`)
- `sanitizeString()`, `validatePlayerName()`, `validateEmail()`, `validatePassword()`, `validateScore()`, `validateScoreArray()`, `validatePar()`, `validateCourseName()`, `validateLocation()`

### Logging (`lib/logger.ts`)
- Methods: `debug()`, `info()`, `warn()`, `error()`
- Development: Console logging
- Production: Silent (except errors)

## Deploy on Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

### Manual Deployment

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import your repository on [Vercel](https://vercel.com/new)

3. Configure environment variables in Vercel:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all variables from `.env.example`

4. Deploy!

### Environment Variables Setup for Vercel

When adding the `GOOGLE_PRIVATE_KEY` to Vercel:
- Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the `\n` characters for line breaks
- Wrap the entire key in double quotes

## Troubleshooting

**Q: Build fails with "Missing environment variable"**
A: Copy `.env.example` to `.env.local` and fill in all required values

**Q: Google Sheets API errors**
A: Verify service account has access to the spreadsheet

**Q: Rate limiting too strict**
A: Adjust `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS` in `.env.local`

## External Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Vercel Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying)
