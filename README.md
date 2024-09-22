# JiveTracker

An open-source web app to track your recent Spotify activity. Not affiliated with Spotify. Nextjs frontend with Vercel KV backend.

## Requirements

- Node.js 18+
- pnpm 9+

Copy the `.env.example` file to `.env.local` and fill in the values.

For the other remaining fields, login to Vercel and create a new Vercel KV project and copy paste the `.env.local` from the dashboard.

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

1. Connect your GitHub repository to Vercel:
   - Go to [Vercel](https://vercel.com) and sign in
   - Click "Add New Project"
   - Select your GitHub repository

2. Configure your project:
   - Choose the appropriate framework preset (Next.js)
   - Set the root directory if needed
   - Add your environment variables from `.env.local`

3. Deploy:
   - Click "Deploy"

Vercel will automatically build and deploy your project. For future updates, simply push to your main branch, and Vercel will automatically redeploy.