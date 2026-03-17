# ═══════════════════════════════════════════════════════════
#  AI Placement Platform — Makefile
#  One-command setup and management
# ═══════════════════════════════════════════════════════════

.PHONY: help setup dev stop logs migrate seed test lint clean push

# Default target
help:
	@echo ""
	@echo "  🎓 AI Placement Platform — Available Commands"
	@echo "  ─────────────────────────────────────────────"
	@echo "  make setup      → First-time setup (copy .env, start services, migrate, seed)"
	@echo "  make dev        → Start all services in dev mode"
	@echo "  make stop       → Stop all containers"
	@echo "  make logs       → Tail all service logs"
	@echo "  make migrate    → Run Alembic DB migrations"
	@echo "  make seed       → Seed demo data"
	@echo "  make test       → Run backend + frontend tests"
	@echo "  make lint       → Lint backend (ruff) + frontend (eslint)"
	@echo "  make clean      → Remove containers and volumes"
	@echo "  make push       → Commit and push to GitHub"
	@echo ""

# ── Setup ─────────────────────────────────────────────────

setup:
	@echo "🚀 Setting up AI Placement Platform..."
	@[ -f .env ] || cp .env.example .env
	@echo "⚠️  Edit .env and fill in your API keys, then re-run: make dev"

# ── Development ───────────────────────────────────────────

dev:
	@echo "▶  Starting all services..."
	docker compose up -d
	@echo ""
	@echo "  Services:"
	@echo "  Frontend  → http://localhost:3000"
	@echo "  Backend   → http://localhost:8000"
	@echo "  API Docs  → http://localhost:8000/docs"
	@echo "  n8n       → http://localhost:5678  (admin / placement123)"
	@echo "  pgAdmin   → http://localhost:5050"
	@echo ""

stop:
	docker compose down

logs:
	docker compose logs -f --tail=50

# ── Database ──────────────────────────────────────────────

migrate:
	docker compose exec backend alembic upgrade head

seed:
	docker compose exec backend python scripts/seed_demo.py

migrate-create:
	@read -p "Migration name: " name; \
	docker compose exec backend alembic revision --autogenerate -m "$$name"

# ── Testing ───────────────────────────────────────────────

test: test-backend test-frontend

test-backend:
	@echo "🧪 Running backend tests..."
	docker compose exec backend pytest tests/ -v --cov=app --cov-report=term-missing

test-frontend:
	@echo "🧪 Running frontend tests..."
	cd frontend && npm test -- --passWithNoTests

# ── Linting ───────────────────────────────────────────────

lint: lint-backend lint-frontend

lint-backend:
	@echo "🔍 Linting backend..."
	docker compose exec backend pip install ruff -q
	docker compose exec backend ruff check app/ --ignore E501

lint-frontend:
	@echo "🔍 Linting frontend..."
	cd frontend && npm run lint

# ── Cleanup ───────────────────────────────────────────────

clean:
	@echo "🗑  Removing containers and volumes..."
	docker compose down -v --remove-orphans
	@echo "Done."

# ── Git ───────────────────────────────────────────────────

push:
	@read -p "Commit message: " msg; \
	git add . && git commit -m "$$msg" && git push origin main
	@echo "✅ Pushed to GitHub"

# ── n8n workflows ─────────────────────────────────────────

n8n-import:
	@echo "📥 Importing n8n workflows..."
	@echo "Open http://localhost:5678 and import files from n8n/workflows/"

n8n-logs:
	docker compose logs n8n -f --tail=100
