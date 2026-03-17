# Full Stack Deployment Guide - Vercel + Railway

This guide deploys the entire AI Placement Platform to cloud services.

## Architecture

```
Frontend (Vercel) → Backend API (Railway) → PostgreSQL (Railway) → Redis (Railway)
                                          ↓
                                     n8n (Railway)
                                     PgAdmin (Railway)
```

---

## Step 1: Deploy Backend on Railway ✅

### 1.1 Create Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository: `noob110-parrot/ai-placement-platform`
5. Connect your GitHub account if needed

### 1.2 Add Services

Railway will auto-detect Python. Configure:

- **Python Service:**
  - Name: `backend`
  - Root Directory: `./backend`
  - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 1.3 Add PostgreSQL Database

1. In Railway project, click "Add"
2. Select "PostgreSQL"
3. It will auto-generate a DATABASE_URL

### 1.4 Add Redis Cache

1. Click "Add" again
2. Select "Redis"
3. It will auto-generate REDIS_URL

### 1.5 Set Environment Variables

In Railway project settings, add all from your `.env`:

```
DATABASE_URL=postgresql://...  (auto-generated)
REDIS_URL=redis://...          (auto-generated)
SECRET_KEY=your-super-secret-key-change-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
WHATSAPP_API_TOKEN=your-token
WHATSAPP_PHONE_NUMBER_ID=your-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-id
WHATSAPP_VERIFY_TOKEN=your-token
GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=https://your-frontend-url/api/auth/callback/google
N8N_WEBHOOK_URL=https://your-n8n-url
N8N_API_KEY=your-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=AI Placement Platform <placement@university.edu>
ENABLE_WHATSAPP_NOTIFICATIONS=true
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_CALENDAR_SYNC=true
ENABLE_AI_SUMMARIZER=true
```

### 1.6 Deploy

Click "Deploy" - Railway will build and deploy automatically.

**Get Backend URL:**
- Once deployed, go to Railway project
- Click on Backend service
- Copy the "Public URL" (e.g., `https://backend-production.up.railway.app`)

---

## Step 2: Deploy PgAdmin on Railway

### 2.1 Add PgAdmin Service

1. In Railway project, click "Add"
2. Search for "PgAdmin" or use Docker image: `dpage/pgadmin4:latest`
3. Set environment variables:

```
PGADMIN_DEFAULT_EMAIL=admin@placement.edu
PGADMIN_DEFAULT_PASSWORD=admin
```

4. Set port to `5050`
5. Deploy

**Get PgAdmin URL:** Copy the public URL from PgAdmin service

---

## Step 3: Deploy n8n on Railway

### 3.1 Add n8n Service

1. In Railway project, click "Add"
2. Use Docker image: `n8nio/n8n:latest`
3. Set environment variables:

```
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=placement123
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://your-n8n-public-url
```

4. Set port to `5678`
5. Deploy

**Get n8n URL:** Copy the public URL from n8n service

---

## Step 4: Update Frontend on Vercel

### 4.1 Update Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your frontend project
3. Go to Settings → Environment Variables
4. Update/Add:

```
NEXT_PUBLIC_API_URL=https://your-backend-railway-url
```

Example:
```
NEXT_PUBLIC_API_URL=https://backend-production.up.railway.app
```

### 4.2 Redeploy Frontend

1. Go to Deployments tab
2. Click the 3-dot menu on latest deployment
3. Select "Redeploy"
4. Or push a commit to main branch

---

## Step 5: Get All Public URLs

After deployment, collect these URLs:

```
FRONTEND:     https://frontend-one-pi-39.vercel.app
BACKEND:      https://backend-production.up.railway.app
BACKEND DOCS: https://backend-production.up.railway.app/docs
PGADMIN:      https://pgadmin-production.up.railway.app
N8N:          https://n8n-production.up.railway.app
DATABASE:     PostgreSQL (via Railway)
REDIS:        Redis (via Railway)
```

---

## Step 6: Test Everything

### Test Frontend
```bash
curl https://frontend-one-pi-39.vercel.app
```

### Test Backend API
```bash
curl https://backend-production.up.railway.app/docs
```

### Test Database Connection
```bash
# Via PgAdmin: https://pgadmin-production.up.railway.app
# Login: admin@placement.edu / admin
```

### Test n8n
```bash
# Visit: https://n8n-production.up.railway.app
# Login: admin / placement123
```

---

## Cost Breakdown (Monthly)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel (Frontend) | ✅ Free | $10-40+ |
| Railway (Backend) | $5 credit → ~10$/mo | Pay-as-you-go |
| Railway (PostgreSQL) | Included | Included |
| Railway (Redis) | Included | Included |
| Railway (PgAdmin) | Included | Included |
| Railway (n8n) | Included | Included |
| **Total** | **~Free** | **$15-20/mo** |

---

## Troubleshooting

### Frontend can't reach Backend
- Check NEXT_PUBLIC_API_URL is set correctly
- Verify ALLOWED_ORIGINS in backend includes frontend URL
- Check browser console for CORS errors

### Backend won't start
- Check logs: Railway Dashboard → Backend → Logs
- Verify DATABASE_URL and REDIS_URL are set
- Ensure requirements.txt is in backend/ directory

### Database connection fails
- Check DATABASE_URL format
- Verify PostgreSQL service is running
- Check PgAdmin for database creation

### n8n not accessible
- Check Railway logs
- Verify port 5678 is exposed
- Check N8N_WEBHOOK_URL matches public URL

---

## Commands for Manual Deployment

### Using Railway CLI

```bash
# Install
npm i -g @railway/cli

# Login
railway login

# Deploy Backend
cd backend
railway link  # select your project
railway up

# Deploy n8n (via docker-compose)
docker compose -f docker-compose.yml up -d
railway up
```

### Using Vercel CLI

```bash
# Deploy Frontend
cd frontend
vercel --prod
```

---

## Next Steps for Judges

1. Share these URLs with judges:
   - Frontend: https://frontend-one-pi-39.vercel.app
   - API Docs: https://backend-production.up.railway.app/docs
   - n8n: https://n8n-production.up.railway.app (admin/placement123)

2. All code is in GitHub (branch: main)
3. Deployments are automatic on git push

---

## Quick Links

- Frontend: https://vercel.com/noob110-parrots-projects/frontend
- Backend: https://railway.app (noob110-parrot's projects)
- GitHub: https://github.com/noob110-parrot/ai-placement-platform

