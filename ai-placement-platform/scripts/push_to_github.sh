#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  AI Placement Platform — Push to GitHub
#  Run this script ONCE from the project root after unzipping.
# ─────────────────────────────────────────────────────────────

set -e

echo ""
echo "🎓 AI Placement Platform — GitHub Push Script"
echo "──────────────────────────────────────────────"
echo ""

# 1. Check git is installed
if ! command -v git &> /dev/null; then
    echo "❌  git not found. Install git first."
    exit 1
fi

# 2. Read GitHub username
read -p "👤 Your GitHub username: " GH_USER
if [ -z "$GH_USER" ]; then
    echo "❌  Username cannot be empty."
    exit 1
fi

REPO_NAME="ai-placement-platform"
REMOTE_URL="https://github.com/${GH_USER}/${REPO_NAME}.git"

echo ""
echo "📦 Repository: ${REMOTE_URL}"
echo ""

# 3. Init git if not already done
if [ ! -d ".git" ]; then
    git init
    git checkout -b main
fi

# 4. Set identity if not configured
if [ -z "$(git config user.email)" ]; then
    read -p "📧 Your email (for git config): " GIT_EMAIL
    git config user.email "$GIT_EMAIL"
    git config user.name "$GH_USER"
fi

# 5. Stage and commit everything
git add .
git status --short

echo ""
read -p "✅ Commit message (default: 'feat: AI Placement Platform — features 33-38'): " MSG
MSG="${MSG:-feat: AI Placement Platform — features 33-38}"

git commit -m "$MSG" 2>/dev/null || echo "(Nothing new to commit)"

# 6. Create GitHub repo using gh CLI if available, else manual
if command -v gh &> /dev/null; then
    echo ""
    echo "🚀 Creating GitHub repo using gh CLI..."
    gh repo create "$REPO_NAME" --public --push --source . && \
    echo "" && \
    echo "✅ Successfully pushed to https://github.com/${GH_USER}/${REPO_NAME}" && \
    echo "" && \
    echo "  🌐 View repo:   https://github.com/${GH_USER}/${REPO_NAME}" && \
    echo "  📄 API docs:    http://localhost:8000/docs  (after: make dev)" && \
    echo "  🎨 Frontend:    http://localhost:3000        (after: make dev)" && \
    echo ""
else
    echo ""
    echo "⚠️   gh CLI not found. Create the repo manually on GitHub, then run:"
    echo ""
    echo "    git remote add origin $REMOTE_URL"
    echo "    git branch -M main"
    echo "    git push -u origin main"
    echo ""
    echo "Or install GitHub CLI: https://cli.github.com"
    echo ""

    # Add remote if not already there
    if ! git remote get-url origin &> /dev/null; then
        git remote add origin "$REMOTE_URL"
        echo "✅ Remote 'origin' set to: $REMOTE_URL"
        echo "   Now run: git push -u origin main"
    fi
fi
