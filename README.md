# Golf Scoreboard

A Next.js application for managing golf scores with Google Sheets and Supabase integration.

## Features

- User authentication with Supabase
- Course setup and management
- Score entry and tracking
- Google Sheets integration for data storage
- Responsive design with Tailwind CSS

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

Required environment variables:
- `NEXT_PUBLIC_GOOGLE_SHEET_ID` - Your Google Sheet ID
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Google service account email
- `GOOGLE_PRIVATE_KEY` - Google service account private key
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

### Manual Deployment

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import your repository on [Vercel](https://vercel.com/new)

3. Configure environment variables in Vercel:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all variables from `.env.example`:
     - `NEXT_PUBLIC_GOOGLE_SHEET_ID`
     - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
     - `GOOGLE_PRIVATE_KEY` (make sure to preserve the newlines in the private key)
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Deploy! Vercel will automatically:
   - Install dependencies
   - Run the build command
   - Deploy your application

### Environment Variables Setup

When adding the `GOOGLE_PRIVATE_KEY` to Vercel:
- Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the `\n` characters for line breaks
- Wrap the entire key in double quotes

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS 4
- **Database**: Supabase
- **External Integration**: Google Sheets API
- **Language**: TypeScript
- **Package Manager**: pnpm

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Vercel Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying)
