# JiveTracker

An open-source web app to track your recent Spotify activity. Not affiliated with Spotify. Nextjs frontend with Vercel KV backend.

## Requirements

- Node.js 18+
- pnpm 9+

Copy the `.env.example` file to `.env.local` and fill in the values.

Setup a Spotify Developer account and get client ID and client secret.
In the Spotify Developer Dashboard, set the callback URL to `https://<domain>/callback`.

Put the API client ID and client secret in the `.env.local` file.

## Development

1. Clone the repository
2. Install dependencies:
   ```
   pnpm install
   ```
3. Start the development server:
   ```
   pnpm dev
   ```

## Deployment

1. Build the project:
   ```
   pnpm build
   ```
2. Deploy to Vercel:
   ```
   pnpm deploy
   ```