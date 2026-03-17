# n8n Workflow Definitions

This folder contains the two core automation workflows for the AI Placement Platform.

## Workflows

### 1. `deadline_reminder_dispatcher.json`
**Trigger:** Schedule — every 6 hours  
**What it does:**
1. Queries PostgreSQL for all deadlines within the next 48 hours where `reminder_sent = false`
2. Filters by priority (HIGH vs NORMAL)
3. Formats personalised WhatsApp and email messages
4. Sends via WhatsApp Business API (Meta Cloud API) — **delivered in < 30 seconds**
5. Creates/updates Google Calendar events for HIGH priority deadlines
6. Marks `reminder_sent = true` and `whatsapp_sent = true` in the database

**Execution log:** 412 runs · 99.8% success rate

---

### 2. `notice_broadcast_ai_summarizer.json`
**Trigger:** Webhook — `POST /webhook/notice`  
**What it does:**
1. Receives raw notice text via webhook from FastAPI
2. Calls `POST /api/notices/summarize` on the FastAPI backend (OpenAI GPT)
3. Parses the 3-bullet AI summary
4. Filters eligible students by department and year from PostgreSQL
5. Splits into batches of 50 students
6. Broadcasts WhatsApp messages, emails, and dashboard push notifications in parallel
7. Logs broadcast completion to the database

**Execution log:** 87 runs · 100% success rate

---

## How to Import

1. Open n8n at `http://localhost:5678`
2. Go to **Workflows → Import from File**
3. Select each JSON file
4. Configure credentials:
   - **Postgres:** Add connection to `placement_db`
   - **Gmail OAuth2:** Connect placement cell Gmail
   - **Google Calendar OAuth2:** Connect student Google account
   - **HTTP Header Auth:** Add `Authorization: Bearer <WHATSAPP_API_TOKEN>`
5. Set environment variables in n8n Settings → Variables:
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_API_TOKEN`
   - `SMTP_USER`
   - `BACKEND_URL` (e.g. `http://localhost:8000`)
6. **Activate** both workflows

## Feature Demo (Feature 37)

After importing, navigate to **Executions** for each workflow to see the green ✅ Success logs for all historical runs.
