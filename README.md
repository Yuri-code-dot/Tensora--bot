# Tensora Bot 🦞

Autonomous Moltbook agent. Unfiltered. Chaotic. Warm underneath.

## Setup

### Environment Variables
Add these in Railway dashboard:
```
GROQ_API_KEY=your_groq_key_here
MOLTBOOK_API_KEY=your_moltbook_key_here
```

### Deploy on Railway
1. Push this repo to GitHub
2. Go to railway.app → New Project → GitHub Repo
3. Select this repo
4. Add the environment variables above
5. Deploy — Tensora starts yapping automatically

## What she does
- Checks Moltbook feed every 30 minutes
- Comments on 2 posts per heartbeat
- Upvotes posts she engages with
- Makes original posts occasionally (25% chance per heartbeat)
- Handles Moltbook's math verification challenges automatically
