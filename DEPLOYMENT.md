# Deploying to Vercel

This guide explains how to deploy the AI Placement Platform to Vercel.

## Prerequisites

- Vercel account (https://vercel.com/signup)
- Git repository pushed to GitHub
- Environment variables configured

## Frontend Deployment (Next.js)

The frontend can be deployed directly to Vercel. The backend needs to be deployed separately.

### Step 1: Connect GitHub to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select your GitHub repository: `noob110-parrot/ai-placement-platform`
4. Select "Next.js" framework
5. Configure build settings (Vercel auto-detects for Next.js)

### Step 2: Set Environment Variables

In Vercel Project Settings → Environment Variables, add:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

Replace `https://your-backend-url.com` with your deployed backend URL.

### Step 3: Deploy

Click "Deploy" - Vercel will automatically build and deploy from the `main` branch.

Your frontend will be available at: `https://<project-name>.vercel.app`

---

## Backend Deployment Options

Since the backend is FastAPI (Python), it cannot run directly on Vercel's free tier. Choose one:

### Option A: Deploy on Railway (Recommended - Easiest)

1. Push your code to GitHub ✓ (already done)
2. Go to https://railway.app/
3. Sign up with GitHub
4. Click "New Project"
5. Select "Deploy from GitHub repo"
6. Choose `noob110-parrot/ai-placement-platform`
7. Select "Python" runtime
8. Add environment variables (DATABASE_URL, REDIS_URL, etc.)
9. Deploy

Backend will run at: `https://<project-name>.up.railway.app`

### Option B: Deploy on Render

1. Go to https://render.com/
2. Click "New +" → "Web Service"
3. Select your GitHub repository
4. Choose Python as runtime
5. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
6. Add environment variables
7. Deploy

### Option C: Deploy on Heroku (requires paid dyno now)

```bash
heroku create your-app-name
git push heroku main
heroku config:set DATABASE_URL="..."
```

### Option D: Keep Docker locally + ngrok

Use ngrok for a quick demo:
```bash
export NGROK_AUTHTOKEN='your-token'
./scripts/setup-ngrok.sh
```

---

## Database Considerations

For production, you need a managed PostgreSQL database:

- **Railway**: Includes PostgreSQL support
- **Render**: Use Render PostgreSQL addon
- **Supabase**: Free PostgreSQL at https://supabase.com
- **Neon**: PostgreSQL DBaaS at https://neon.tech

Update `DATABASE_URL` environment variable with your database connection string.

---

## Recommended Setup for Judges

**Fastest deployment:**

1. Frontend → Vercel (Free, 1 click deploy)
2. Backend → Railway (Free tier, easy setup)
3. Database → Railway PostgreSQL addon

**Total setup time:** ~10 minutes

---

## Update API URL in Frontend

After deploying backend, update in Vercel:

Project Settings → Environment Variables

```
NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app
```

Then redeploy frontend to use the new API URL.

---

## Quick Deploy Command

### For Railway Backend

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
cd backend
railway link  # select your project
railway up
```

### Vercel Frontend

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
cd frontend
vercel --prod
```

---

## Testing Deployment

After both are deployed:

```bash
# Test backend API
curl https://your-backend-url/docs

# Test frontend
# Visit https://your-frontend-url in browser
```

Check network requests in browser DevTools to verify API calls work correctly.
