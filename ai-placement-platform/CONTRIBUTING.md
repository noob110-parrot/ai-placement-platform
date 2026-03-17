# Contributing to AI Placement Platform

## Quick Setup

```bash
git clone https://github.com/YOUR_USERNAME/ai-placement-platform.git
cd ai-placement-platform
make setup          # copies .env.example → .env
# fill .env with your API keys
make dev            # starts all Docker services
make migrate        # runs DB migrations
make seed           # seeds demo students + jobs
```

## Project Structure

```
backend/
  app/
    api/routes/    → FastAPI route handlers (one file per feature)
    core/          → Config, database, security (JWT)
    models/        → SQLAlchemy ORM models
    schemas/       → Pydantic request/response schemas
    services/      → Business logic (AI, Calendar, WhatsApp, n8n)
    utils/         → Cache (Redis), WebSocket manager
  tests/           → pytest test suite
  scripts/         → seed_demo.py

frontend/
  src/
    app/           → Next.js 14 App Router pages
    components/    → Reusable UI primitives
    hooks/         → React Query + WebSocket hooks
    lib/           → Axios API client
    types/         → Shared TypeScript interfaces

n8n/workflows/     → Exportable n8n workflow JSON files
docs/              → ARCHITECTURE.md, DEMO_SCRIPT.md
```

## Development Workflow

1. **Create a branch**: `git checkout -b feat/your-feature`
2. **Backend changes**: Edit files in `backend/app/`, tests in `backend/tests/`
3. **Frontend changes**: Pages in `frontend/src/app/`, components in `frontend/src/components/`
4. **Run tests**: `make test`
5. **Lint**: `make lint`
6. **Commit**: `git commit -m "feat: description"`
7. **Open PR** against `main`

## Backend Conventions

- Every route file has a corresponding test file in `tests/`
- All external API calls (WhatsApp, Google, OpenAI) live in `services/`
- Routes should only call service methods — no business logic in route handlers
- Use `BackgroundTasks` for any operation that doesn't need to block the HTTP response

## Frontend Conventions

- Pages fetch data via React Query hooks defined in `hooks/index.ts`
- Never call `api` directly from page components — always go through a hook
- All toast notifications use `sonner`
- Dark theme only — use CSS variables from `globals.css`

## Adding a New n8n Workflow

1. Design the workflow in the n8n UI at `http://localhost:5678`
2. Export as JSON: **Workflow → Export → Download**
3. Save to `n8n/workflows/your_workflow_name.json`
4. Document it in `n8n/workflows/README.md`
5. Add the corresponding n8n trigger endpoint in `backend/app/api/routes/webhooks.py`

## Environment Variables

See `.env.example` for all required variables. Never commit `.env` to git.

## Testing

```bash
# All tests
make test

# Backend only with coverage
cd backend && pytest tests/ -v --cov=app

# Specific test file
cd backend && pytest tests/test_services.py -v

# Frontend
cd frontend && npm test
```

## API Documentation

Interactive API docs are available at `http://localhost:8000/docs` when the backend is running.

## Commit Message Format

```
feat:  new feature
fix:   bug fix
docs:  documentation change
test:  adding or updating tests
chore: build, deps, tooling
refactor: code restructure without feature change
```
