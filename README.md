# Aura AI

**AI-powered career mentorship platform for students — one session, seven tools, zero login.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Video Demo:** https://youtu.be/aQhjyn44JDw

**Author:** Kartik Pareek · Jaipur, India · CS50x 2026

---

## What it is

Aura AI unifies the fragmented world of career preparation into a single web app. A student opens the app, chats with an AI mentor in English, Hindi, or Hinglish, completes a short guided profiling flow, and the resulting profile powers every other tool — resume analysis, resume generation, document correction, mock interviews, and semester-wise career roadmaps.

No accounts. No sign-up. Conversations live in the browser's `localStorage` and persist across reloads for up to 7 days.

## The seven tools

| # | Tool | What it does |
|---|------|--------------|
| 1 | **Career Mentor** | ChatGPT-style conversational mentor with multi-thread history, profiling flow, and profile-aware answers across tech, healthcare, law, civil services, business, and design. |
| 2 | **Guided Profiling** | Five-step onboarding collects name, semester, skills, career goal, and weekly study hours, then returns an AI evaluation with 30-day actions and a job-readiness timeline. |
| 3 | **ATS Resume Analyzer** | Upload PDF/DOCX/TXT or paste text → 100-point score across format, keywords, experience, skills, and education, plus ATS rating and improvement notes. |
| 4 | **AI Resume Builder** | Multi-section form generates an ATS-optimized summary, quantified bullets, categorized skills, and keywords as styled HTML + plain text. |
| 5 | **Document Corrector** | Grammar / professional / rewrite / academic modes for emails, reports, letters; returns corrected text, categorized changes, and an improvement score. |
| 6 | **Mock Interview Engine** | Role- and level-matched questions, per-answer scoring with feedback, and a final grade card with weakest/strongest breakdown. |
| 7 | **Roadmaps & Recommendations** | Knowledge-base-driven semester roadmaps, skill-gap analysis, salary ranges, projects, certifications, and prioritized free/paid resources. |

## Architecture

```
React SPA (Vite + Tailwind)  ──REST/JSON──▶  Flask API (stateless)  ──▶  Groq LLM
        │                                          │
        └── localStorage (profiles, chats)         └── career_data.json (knowledge base)
```

- **Stateless backend, stateful-feeling frontend.** The Flask API stores nothing between requests — chat history and session data are sent as bounded snapshots. The SPA owns persistence via `localStorage` (up to 10 conversations, 7-day retention). This keeps the backend horizontally scalable with zero database ops and gives users privacy by default: their data never leaves their browser except as prompt context.
- **Single AI gateway.** Every feature funnels through `groq_client.py → ask_groq()`, which centralizes system prompts, input bounding, history trimming, model fallback (`gpt-oss-120b` → `gpt-oss-20b`), and retry on transient 429/503s — one file to swap providers.
- **Version-controlled knowledge base.** `career_data.json` holds curated career roles, semester roadmaps, skills, salaries, and resources — data, not user data, so static JSON beats a database here.
- **Security by default.** Secrets in `.env` (git-ignored), per-IP rate limiting on expensive endpoints, 3 MB upload cap, strict file-type validation, production CORS allowlist, structured logging without sensitive data.

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, react-markdown, lucide-react, react-hot-toast |
| Backend | Python, Flask, Flask-CORS, Groq SDK, Gunicorn |
| AI | Groq (`openai/gpt-oss-120b` with `gpt-oss-20b` fallback) |
| Data | `career_data.json` knowledge base · browser `localStorage` |
| Deploy | Dockerfile · Procfile · render.yaml (Render) |

## Quick start

**Prerequisites:** Python 3.10+, Node.js 18+, a free [Groq API key](https://console.groq.com).

```bash
# 1. Backend
git clone https://github.com/kartikkparik/Aura-AI.git && cd Aura-AI/backend
cp .env.example .env        # then set GROQ_API_KEY and SECRET_KEY
pip install -r requirements.txt
python app.py               # → http://localhost:5000

# 2. Frontend (new terminal)
cd ../frontend
npm install
npm run dev                 # → http://localhost:5173 (proxies /api to :5000)
```

On Windows, `start.bat` runs both servers automatically.

**Production:** set `ALLOWED_ORIGINS` in `backend/.env` and `VITE_API_URL` in `frontend/.env` before `npm run build`. Docker and Render blueprints are included.

## Project structure

```
├── backend/          Flask REST API — routes, Groq gateway, engines, knowledge base
│   ├── app.py            All /api endpoints, rate limiting, CORS, error handling
│   ├── groq_client.py    LLM gateway: prompts, fallback, retry
│   ├── chat_engine.py    Profiling state machine + mentor responses
│   ├── resume_analyzer.py / resume_builder.py / doc_corrector.py / interview_engine.py
│   ├── roadmap_engine/   Roadmap generator + recommendation engine
│   └── knowledge_base/   career_data.json — curated roles, roadmaps, resources
├── frontend/         React + Vite SPA
│   └── src/              Pages, components, SessionContext (localStorage state), API client
├── Dockerfile · Procfile · render.yaml
└── PRODUCT.md        Product/design context
```

## Acknowledgements

Built with Flask, React, Vite, Tailwind CSS, and the Groq API. Created by Kartik Pareek for CS50x 2026.
