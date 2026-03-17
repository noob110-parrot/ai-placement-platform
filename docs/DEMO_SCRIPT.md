# AI Placement Platform — Live Demo Script
## Features 33–38 · Evaluator Walkthrough

---

## Feature 33 · Student Registration

**URL:** `http://localhost:3000/register`

### Steps
1. Open `/register` — the page loads with a clean dark form
2. Observe **real-time Gmail validation** as you type:
   - Type `aryan.mehta2024@gmail.com` → green checkmark appears: *"Gmail detected — Calendar & notification sync enabled"*
   - Type `test@yahoo.com` → red error: *"Only Gmail addresses supported"*
3. Fill all fields:

| Field | Value |
|---|---|
| Roll Number | CS21B047 |
| Full Name | Aryan Mehta |
| Gmail | aryan.mehta2024@gmail.com |
| Phone | +91 98765 43210 |
| Department | Computer Science & Engineering |
| Year | 4 |
| CGPA | 8.4 |
| Skills | Python, React, SQL, Machine Learning |

4. Click **Register Student →**
5. System calls `POST /api/students/register` — validates, writes to PostgreSQL, fires welcome WhatsApp
6. Success screen shows: *"Welcome, Aryan! WhatsApp message sent to +919876543210"*

### System Response
```json
{ "id": "uuid", "roll_no": "CS21B047", "name": "Aryan Mehta",
  "email": "aryan.mehta2024@gmail.com", "notifications": "active" }
```

---

## Feature 34 · Deadline + WhatsApp Notification (< 30 seconds)

**URL:** `http://localhost:3000/dashboard/deadlines`

### Steps
1. Navigate to **Deadlines** in the sidebar
2. Click **+ Add Deadline**
3. Fill the modal:

| Field | Value |
|---|---|
| Company | Google India |
| Role | Software Engineer Intern |
| Deadline | 25 March 2026, 11:59 PM |
| Priority | 🔴 High |
| Application URL | https://careers.google.com/jobs/... |

4. Click **Save & Notify ⚡**
5. Watch the amber banner: *"Triggering n8n workflow… WhatsApp dispatching…"*
6. **Within 18 seconds** — phone buzzes. WhatsApp message received:

```
Hey Aryan! 👋

⏰ DEADLINE ALERT
Company: *Google India*
Role: Software Engineer Intern
Deadline: *25 Mar 2026, 11:59 PM IST*

🔴 HIGH PRIORITY — Don't miss this!

Apply here: careers.google.com/jobs/...

✅ Added to your Google Calendar

— Your Placement Cell
```

7. The deadline card now shows: 🟢 **Sent** badge + 📅 **Cal** badge

---

## Feature 35 · Google Calendar Event

**After Feature 34:**

1. Open `calendar.google.com` signed in as `aryan.mehta2024@gmail.com`
2. Navigate to **25 March 2026**
3. At **11:59 PM** → event block visible:

```
🔴 [DEADLINE] Google India — SE Intern Application Due
  Wed, 25 March 2026 · 11:59 PM – 12:59 AM
  Description: Apply here: careers.google.com/...
  Priority: HIGH | Added by AI Placement Platform
  Reminders: Email 1 day before · Popup 1 hour before
  Calendar: Aryan Mehta — Placements
```

Event was created by n8n's Google Calendar node at **T+3 seconds** after the deadline was saved — before the WhatsApp message even arrived.

---

## Feature 36 · AI Notice Summarizer & Broadcast

**URL:** `http://localhost:3000/dashboard/notices`

### Steps
1. Navigate to **Notices** in the sidebar
2. Click **Load Sample** to populate the textarea with the TCS NQT notice
   *(or paste any real college notice)*
3. Set **Target Departments**: CSE, ECE, IT  
   Set **Channels**: WhatsApp ✅ Email ✅ Dashboard ✅
4. Click **Generate Summary ✨**
5. **In 2.3 seconds** — the AI summary card appears:

```
🤖 AI SUMMARY — TCS NQT Deadline Extension Notice

① TCS NQT registration deadline extended to 28 March 2026
   — register now at tcsion.com (min. CGPA 7.0, no active backlogs)

② Online proctored test scheduled 1–5 April 2026;
   bring valid government photo ID and admit card on exam day

③ Mandatory prep session: 26 March at 3:00 PM in Seminar Hall B
   — all registered candidates must attend
```

6. Click **Broadcast Now 📤**
7. **In 4.8 seconds** — broadcast complete panel shows:

```
📡 BROADCAST COMPLETE · Notice ID: NOTICE-2026-0317-07
Recipients targeted:     142
WhatsApp delivered:      139 / 142 ✅
Emails sent:             142 / 142 ✅
Dashboard notifications: 142 / 142 ✅
Failed:                  3 (logged)  ⚠️
Time taken:              4.8 seconds
```

---

## Feature 37 · n8n Workflow Dashboard — Green Success Logs

**URL:** `http://localhost:3000/dashboard/workflows`

### Steps
1. Navigate to **n8n Workflows** in the sidebar
2. Two workflow cards visible — both showing 🟢 Active badge

### Workflow 1: Deadline Reminder Dispatcher
- Click to expand → see 8-node chain, all with ✅ green ticks
- Switch to **Execution Log** tab:

| # | Started | Duration | Status |
|---|---|---|---|
| #412 | 17 Mar 2026, 06:00 | 2.1s | 🟢 Success |
| #411 | 17 Mar 2026, 00:00 | 1.8s | 🟢 Success |
| #410 | 16 Mar 2026, 18:00 | 3.2s | 🟢 Success |

### Workflow 2: Notice Broadcast & AI Summarizer
- Execution #87 (our just-triggered broadcast):

| # | Started | Duration | Status |
|---|---|---|---|
| #87 | 17 Mar 2026, 14:22 | 4.8s | 🟢 Success |
| #86 | 15 Mar 2026, 10:11 | 5.1s | 🟢 Success |

Both workflows: **zero failures across all visible executions.**

---

## Feature 38 · Forward-Thinking Vision

**URL:** `http://localhost:3000/dashboard/analytics`

### The Statement
> *"If we had more time, we would add…"*

### What We'd Build Next

| Feature | Effort | Impact |
|---|---|---|
| Placement Readiness Score (0–100) | ~2 weeks | Very High |
| Mock Interview AI (LLM-powered) | ~3 weeks | Very High |
| Recruiter Finder + LinkedIn outreach | ~4 weeks | High |
| Skill Gap Analyzer with learning paths | ~2 weeks | High |
| Cohort analytics heatmap for coordinators | ~1 week | High |

### Why This Matters
Every feature listed is **plug-in ready** — the API contracts exist, the database schema supports them, and the n8n pipelines can accept new webhook triggers without any architectural changes.

**The platform you saw today is Version 1. The architecture is already Version 3 in its thinking.**

---

## Quick Start for Demo

```bash
# 1. Start all services
cp .env.example .env  # fill in API keys
docker compose up -d

# 2. Run migrations
docker compose exec backend alembic upgrade head

# 3. Seed demo data
docker compose exec backend python scripts/seed_demo.py

# 4. Open platform
open http://localhost:3000
```

Services available at:
- **Platform:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs
- **n8n:** http://localhost:5678 (admin / placement123)
- **pgAdmin:** http://localhost:5050
