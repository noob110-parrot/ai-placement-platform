#!/bin/bash
# Setup ngrok for AI Placement Platform

echo "🚀 AI Placement Platform - ngrok Setup"
echo "======================================="
echo ""

# Check if NGROK_AUTHTOKEN is set
if [ -z "$NGROK_AUTHTOKEN" ]; then
    echo "❌ NGROK_AUTHTOKEN not set!"
    echo ""
    echo "Steps to set up ngrok:"
    echo "1. Sign up at: https://dashboard.ngrok.com/signup"
    echo "2. Get your authtoken: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "3. Export it: export NGROK_AUTHTOKEN='your-token-here'"
    echo ""
    exit 1
fi

echo "✅ NGROK_AUTHTOKEN found"
echo ""
echo "Starting application with ngrok tunnels..."
echo ""

# Start with ngrok compose file
docker compose -f docker-compose.yml -f docker-compose.ngrok.yml up -d

echo ""
echo "✅ Application started!"
echo ""
echo "Waiting for ngrok URLs to be generated..."
sleep 5

# Get ngrok URLs
echo ""
echo "📱 Access URLs for Judges:"
echo "=============================="
echo ""

# Try to get frontend URL
FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$FRONTEND_URL" ]; then
    echo "🌐 Frontend: $FRONTEND_URL"
else
    echo "🌐 Frontend: (waiting for ngrok...)"
fi

# Try to get backend URL
BACKEND_URL=$(curl -s http://localhost:4041/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$BACKEND_URL" ]; then
    echo "🔌 Backend API: $BACKEND_URL"
    echo "📖 API Docs: $BACKEND_URL/docs"
else
    echo "🔌 Backend API: (waiting for ngrok...)"
fi

echo ""
echo "Local URLs:"
echo "===========  "
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "Backend API Docs: http://localhost:8000/docs"
echo "n8n: http://localhost:5678"
echo "PgAdmin: http://localhost:5050"
echo ""
echo "ngrok Inspector: http://localhost:4040"
echo ""
echo "To stop: docker compose -f docker-compose.yml -f docker-compose.ngrok.yml down"
