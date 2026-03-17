# Deploy Backend FREE on Render.com

Render.com gives you **free hosting** for your backend with automatic PostgreSQL database.

## Step 1: Sign Up

1. Go to https://render.com
2. Click **"Sign Up"**
3. Sign up with GitHub (easiest)
4. Authorize Render to access your GitHub

---

## Step 2: Create Web Service

1. Click **"+ New"** → **"Web Service"**
2. Select **"Deploy from GitHub repo"**
3. Find and select: `noob110-parrot/ai-placement-platform`
4. Click **"Connect"**

---

## Step 3: Configure Backend Service

Fill in these settings:

```
Name:                   ai-placement-backend
Runtime:                Python 3
Root Directory:         ./backend
Build Command:          pip install -r requirements.txt
Start Command:          uvicorn app.main:app --host 0.0.0.0 --port 8000
Instance Type:          Free (512MB RAM)
```

---

## Step 4: Add Environment Variables

Click **"Advanced"** and add these variables:

```
SECRET_KEY=your-super-secret-key-change-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
WHATSAPP_API_TOKEN=your-whatsapp-api-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_VERIFY_TOKEN=your-webhook-verify-token
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-frontend-url/api/auth/callback/google
N8N_WEBHOOK_URL=http://localhost:5678
N8N_API_KEY=your-n8n-api-key
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

**Database variables** (Render auto-creates these):
- `DATABASE_URL` - Will be auto-generated
- `REDIS_URL` - Optional, skip if not needed

---

## Step 5: Add PostgreSQL Database

1. Click **"+ Add Database"** in the same Render dashboard
2. Select **"PostgreSQL"**
3. Choose **"Free"** tier
4. Render auto-generates `DATABASE_URL`
5. This will be in your environment variables automatically

---

## Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will deploy automatically
3. Wait 5-10 minutes for build and deploy
4. You'll see: `Your service is live at: https://ai-placement-backend.onrender.com`

---

## Step 7: Get Your Backend URL

Once deployed:
- Backend URL: `https://ai-placement-backend.onrender.com`
- API Docs: `https://ai-placement-backend.onrender.com/docs`
- Health check: `https://ai-placement-backend.onrender.com/health`

---

## Step 8: Update Vercel Frontend

1. Go to https://vercel.com/dashboard
2. Click on **"frontend"** project
3. Go to **Settings** → **Environment Variables**
4. Find `NEXT_PUBLIC_API_URL`
5. Change it to: `https://ai-placement-backend.onrender.com`
6. Save
7. Go to **Deployments** tab
8. Click 3-dots on latest → **"Redeploy"**

Done! Your frontend will now call your free Render backend. ✅

---

## Free Tier Limits

- **Backend:** 512MB RAM, auto-sleep after 15 min inactivity
- **Database:** 90-day free trial, then $7/month (or stays free if not heavily used)
- **After trial:** Free tier continues, just slower

---

## Cost

- **Frontend (Vercel):** FREE ✅
- **Backend (Render):** FREE ✅
- **Database (Render PostgreSQL):** FREE for 90 days, then $7/month

**Total: Completely FREE** 🎉

---

## Test

After deployment:

```bash
# Test backend
curl https://ai-placement-backend.onrender.com/health

# Check API docs
https://ai-placement-backend.onrender.com/docs
```

---

## Troubleshooting

If backend doesn't deploy:
1. Check **Logs** in Render dashboard
2. Common issues:
   - Missing `requirements.txt` in backend folder
   - Wrong start command
   - Missing environment variables

If frontend can't reach backend:
1. Verify `NEXT_PUBLIC_API_URL` in Vercel is correct
2. Check browser console (F12) for CORS errors
3. Make sure Render backend is running (not sleeping)

