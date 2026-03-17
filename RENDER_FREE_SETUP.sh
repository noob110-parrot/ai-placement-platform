#!/bin/bash
# Render.com deployment setup script

# This script sets up your app for free deployment on Render.com
# Render provides:
# - Free tier backend (512MB RAM, auto-sleep after 15min inactivity)
# - Free PostgreSQL (90 days free trial, then $7/month)
# - Free static site hosting

echo "🚀 Render.com Free Deployment Setup"
echo "===================================="
echo ""
echo "Steps:"
echo "1. Go to https://render.com"
echo "2. Sign up (free account)"
echo "3. Create new Web Service"
echo "4. Connect GitHub: noob110-parrot/ai-placement-platform"
echo "5. Configure:"
echo "   - Name: ai-placement-backend"
echo "   - Runtime: Python 3"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: uvicorn app.main:app --host 0.0.0.0 --port 8000"
echo "   - Root Directory: ./backend"
echo ""
echo "6. Add PostgreSQL Database (free 90-day trial)"
echo "7. Copy DATABASE_URL and add to environment"
echo "8. Deploy!"
echo ""
echo "Your free app will be at: https://ai-placement-backend.onrender.com"
