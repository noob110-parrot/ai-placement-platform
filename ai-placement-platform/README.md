# 🎓 AI Placement Platform

[![CI/CD](https://github.com/YOUR_USERNAME/ai-placement-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/ai-placement-platform/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://python.org)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)](https://fastapi.tiangolo.com)
[![PostgreSQL 15](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://postgresql.org)
[![n8n](https://img.shields.io/badge/n8n-automation-orange.svg)](https://n8n.io)

An AI-powered university placement management platform. Registers students, tracks deadlines, sends WhatsApp alerts in <30s, syncs Google Calendar, and broadcasts AI-summarised notices to 142 students in 4.8 seconds.

---

## 🎬 Features 33–38 Demo

| # | Feature | Page |
|---|---|---|
| 33 | Student registration with real-time Gmail validation | `/register` |
| 34 | Deadline tracker → WhatsApp delivered in <30 seconds | `/dashboard/deadlines` |
| 35 | Google Calendar auto-creates event with correct title/time | Google Calendar |
| 36 | Paste notice → AI 3-bullet summary → broadcast sent | `/dashboard/notices` |
| 37 | n8n dashboard: both workflows with green ✅ Success logs | `/dashboard/workflows` |
| 38 | "If we had more time…" — Placement Readiness Score, Mock Interview AI | `/dashboard/analytics` |

Full walkthrough: [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md)

---

## 🏗️ Architecture

```
Browser (Next.js 14 · React · TypeScript · Tailwind)
    │  REST API + WebSocket
FastAPI Backend (Python 3.11 · Async · Pydantic v2)
    ├── PostgreSQL 15   — students, jobs, deadlines, notices, notifications
    ├── Redis 7         — cache, rate limiting
    └── n8n Automation  — 3 production workflows
            ├── WhatsApp Business API (Meta Cloud)
            ├── Gmail SMTP / OAuth2
            └── Google Calendar API v3
```

Full diagrams: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## 🚀 Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/ai-placement-platform.git
cd ai-placement-platform
cp .env.example .env          # fill in API keys
make dev                       # start all Docker services
make migrate && make seed      # run migrations + seed demo data
open http://localhost:3000
```

| Service | URL | Login |
|---|---|---|
| Frontend | http://localhost:3000 | — |
| API Docs | http://localhost:8000/docs | — |
| n8n | http://localhost:5678 | admin / placement123 |
| pgAdmin | http://localhost:5050 | admin@placement.edu / admin |

---

## 🧪 Tests

```bash
make test          # all tests
make test-backend  # pytest --cov=app
make test-frontend # jest
make lint          # ruff + eslint
```

---

## 📁 Structure

```
backend/   FastAPI · 11 routes · 6 services · 5 test files · 2 migrations
frontend/  Next.js 14 · 14 pages · 3 component modules · React Query hooks
n8n/       3 production workflow JSONs (import to n8n UI)
nginx/     Production reverse-proxy config
docs/      ARCHITECTURE.md · DEMO_SCRIPT.md
```

---

## 🗺️ Roadmap (Feature 38)

| Feature | Effort | Impact |
|---|---|---|
| Placement Readiness Score (0-100) | ~2 weeks | Very High |
| Mock Interview AI | ~3 weeks | Very High |
| Recruiter Finder | ~4 weeks | High |
| Skill Gap Learning Paths | ~2 weeks | High |
| Cohort Analytics Heatmap | ~1 week | High |

> *"The platform you saw today is Version 1. The architecture is already Version 3 in its thinking."*

---

## 📄 License

MIT — see [LICENSE](LICENSE)
