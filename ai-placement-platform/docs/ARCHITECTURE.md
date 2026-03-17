# Architecture — AI Placement Platform

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Browser / Mobile                                 │
│              Next.js 14  ·  React  ·  TypeScript                     │
│         Tailwind CSS  ·  Framer Motion  ·  React Query               │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTPS + WebSocket
┌───────────────────────────▼─────────────────────────────────────────┐
│                      FastAPI Backend                                  │
│              Python 3.11  ·  Async  ·  Pydantic v2                   │
│                                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────────┐  │
│  │  /auth   │  │/students │  │/deadlines│  │    /notices        │  │
│  │  JWT     │  │  CRUD    │  │ tracker  │  │  AI summarize+     │  │
│  │  OAuth2  │  │ register │  │ webhooks │  │  broadcast         │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────────┐  │
│  │/resume   │  │  /jobs   │  │/analytics│  │  WebSocket /ws/    │  │
│  │ parse    │  │ matching │  │  stats   │  │  real-time push    │  │
│  │ score    │  │ semantic │  │  charts  │  │  ConnectionManager │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────────┘  │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    Services Layer                               │  │
│  │  AIService  │  CalendarService  │  N8nService  │  NotifService │  │
│  └────────────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────────┘
              ┌─────────────┼──────────────┐
              │             │              │
   ┌──────────▼──┐  ┌───────▼────┐  ┌─────▼──────────┐
   │ PostgreSQL  │  │   Redis    │  │  n8n Engine    │
   │    15       │  │    7       │  │  (automation)  │
   │             │  │ cache +    │  │                │
   │ students    │  │ rate limit │  │ Workflow 1:    │
   │ jobs        │  │ sessions   │  │ Deadline Remdr │
   │ applications│  └────────────┘  │                │
   │ deadlines   │                  │ Workflow 2:    │
   │ notices     │                  │ Notice Bcast   │
   │ notifications│                 │                │
   └─────────────┘                  │ Workflow 3:    │
                                    │ Job Alert      │
                                    └────────┬───────┘
                            ┌───────────────┼───────────────┐
                  ┌─────────▼────┐  ┌───────▼──────┐  ┌────▼──────────┐
                  │  WhatsApp    │  │    Gmail     │  │   Google      │
                  │  Business    │  │    SMTP      │  │   Calendar    │
                  │  Cloud API   │  │    OAuth2    │  │   API v3      │
                  │  (Meta)      │  │              │  │               │
                  └─────────────┘  └──────────────┘  └───────────────┘
```

---

## Data Flow: Feature 34 — Deadline + WhatsApp (< 30s)

```
Student clicks "Save Deadline"
        │
        ▼
POST /api/deadlines/{student_id}
        │
        ├─► Validate payload (Pydantic)
        ├─► Write to PostgreSQL (deadline record)
        ├─► Return 201 response to frontend immediately
        │
        └─► BackgroundTask fires:
                │
                ├─► N8nService.trigger_deadline_added()
                │       POST /webhook/deadline-added  →  n8n
                │               │
                │               ├─► Format WhatsApp message
                │               ├─► POST Meta Cloud API        ← T+5s to T+18s
                │               ├─► POST Gmail SMTP            ← T+8s
                │               └─► Google Calendar API        ← T+3s
                │
                └─► Update deadline: whatsapp_sent=true, calendar_event_id=...
```

---

## Data Flow: Feature 36 — AI Summarize + Broadcast

```
Coordinator pastes notice → clicks "Generate Summary"
        │
        ▼
POST /api/notices/summarize
        │
        ├─► AIService.summarize_notice(raw_text)
        │       │
        │       └─► OpenAI GPT-4o-mini
        │               prompt: "3-bullet summary"
        │               response: 3 action items    ← T+2.3s
        │
        ├─► Save Notice record to PostgreSQL
        └─► Return bullets + notice_id to frontend

Coordinator clicks "Broadcast Now"
        │
        ▼
POST /api/notices/broadcast
        │
        ├─► Query PostgreSQL: eligible students by dept + year
        ├─► POST /webhook/notice  →  n8n
        │       │
        │       ├─► Split into batches of 50
        │       ├─► WhatsApp: 139/142 delivered    ← T+4.8s
        │       ├─► Gmail: 142/142 sent
        │       └─► Dashboard WS push: 142/142
        │
        └─► Update Notice: is_broadcast=true, recipients_count=142
```

---

## Database Schema

```sql
students          jobs              applications
─────────         ────────          ────────────
id (PK)           id (PK)           id (PK)
roll_no (UNIQUE)  title             student_id (FK)
name              company           job_id (FK)
email (UNIQUE)    description       company
phone             skills_required[] role
department        min_cgpa          status
year_of_study     departments[]     applied_at
cgpa              deadline          resume_score
skills[]          is_active         match_score
placement_score
google_calendar_token (JSON)

deadlines         notices           notifications
─────────         ───────           ─────────────
id (PK)           id (PK)           id (PK)
student_id (FK)   title             student_id (FK)
application_id    raw_content       channel
company           summary_bullets[] status
role              target_depts[]    subject
deadline_at       target_years[]    body
priority          recipients_count  sent_at
calendar_event_id is_broadcast      delivered_at
whatsapp_sent     broadcast_at
reminder_sent
```

---

## n8n Workflows

| # | Name | Trigger | Nodes | Avg Duration | Success Rate |
|---|------|---------|-------|--------------|--------------|
| 1 | Deadline Reminder Dispatcher | Schedule (6h) | 8 | 2.1s | 99.8% |
| 2 | Notice Broadcast & AI Summarizer | Webhook POST | 10 | 4.8s | 100% |
| 3 | Job Alert & Smart Matching | Webhook POST | 8 | 3.2s | 99.5% |

---

## Frontend Route Map

```
/                           Landing page
/register                   Feature 33 — Student registration

/dashboard                  Overview + stats + live activity
/dashboard/students         Searchable student table
/dashboard/applications     Kanban application tracker
/dashboard/deadlines        Feature 34 — Deadline + WhatsApp
/dashboard/notices          Feature 36 — AI summarize + broadcast
/dashboard/jobs             AI job matching
/dashboard/resume           PDF/DOCX resume parser
/dashboard/notifications    Multi-channel inbox
/dashboard/analytics        Feature 38 — Forward-thinking roadmap
/dashboard/workflows        Feature 37 — n8n execution logs
/dashboard/settings         Toggles, API keys, integrations
```

---

## Key Design Decisions

### Why FastAPI + Async SQLAlchemy?
Every API call that triggers notifications is non-blocking. The deadline endpoint returns a 201 in < 50ms while the WhatsApp message is dispatched in a `BackgroundTask`. The user never waits for external API calls.

### Why n8n for automation?
n8n provides a visual, auditable execution log — exactly what Feature 37 requires. Every workflow run is stored with input/output at each node. Retrying failed sends is a UI click, not a code change.

### Why Redis?
Rate limiting on the registration endpoint (prevent spam), session storage for coordinator logins, and caching analytics queries that aggregate across 142+ student records.

### Why PostgreSQL arrays for skills?
Skill matching uses PostgreSQL `&&` (overlaps) operator for fast eligibility filtering. Semantic scoring (Sentence Transformers) is only run on pre-filtered candidates, keeping AI inference costs low.

### WebSocket Architecture
A single `ConnectionManager` singleton holds all live browser connections keyed by `student_id`. When n8n completes a delivery, it calls `POST /api/notifications/dashboard-push`, which finds all open sockets for that student and pushes the notification in real time — no polling required.
