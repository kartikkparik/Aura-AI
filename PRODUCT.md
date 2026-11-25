# Product

## Platform

web

## Users

Primary: students in India — college students and early-career professionals preparing for their first or next role. Many interact in Hindi, Hinglish, or English, often with typos and abbreviations. Secondary: the project doubles as a CS50x 2026 portfolio piece for its author, Kartik Pareek, so clarity for technical reviewers matters alongside student usability.

## Product Purpose

Aura AI unifies fragmented career-preparation workflows — mentoring, resume help, document correction, mock interviews, and learning roadmaps — into one application. A student starts a conversation, completes a short profiling flow (name, semester, skills, career goal, weekly study hours), and the resulting profile context personalizes every other tool in the session. Success means a student can go from "where do I start?" to a scored resume, practiced interview answers, and a semester-wise roadmap without juggling separate tools or creating an account.

## Positioning

A single stateless session carries the student's profile across seven distinct career tools, so every recommendation — mentor replies, resume bullets, interview questions, roadmap priorities — is grounded in the same profile instead of generic output. The mechanism a neighboring product could not truthfully copy is the shared session-context model: one conversation bootstraps resume analysis, interview evaluation, and skill-gap roadmaps as one coherent preparation journey.

## Operating Context

- Students use the app in short sessions, likely alongside college coursework; the profiling flow is five conversational steps, not a form wall.
- Language is mixed: English, Hindi, and Hinglish inputs must be understood; typos and abbreviations are expected.
- Career verticals span technology, healthcare, law, civil services, finance, and design — not tech-only.
- File inputs are resumes/documents as PDF, DOCX, or TXT, or pasted text.
- Deployment target exists: Render via `render.yaml`, plus a `Dockerfile`; development runs Flask (`:5000`) + Vite (`:5173`) with a `/api` proxy.

## Capabilities and Constraints

- Seven user-facing tools, all required to keep working through the existing Flask `/api` surface: conversational mentor, guided profiling, ATS resume analyzer, AI resume builder, document corrector, mock interview engine, career roadmaps & recommendations.
- No accounts, ever-in-session: conversations persist in browser `localStorage` (up to 10 threads, 7-day retention). The backend is deliberately stateless; user data never reaches the server beyond per-request payloads. Design around session-based UX — no login walls, no cross-device sync promises.
- AI is powered exclusively through the Groq API (GPT-OSS models) via `backend/groq_client.py`; features degrade through model fallback, not provider choice.
- Product status is undecided between portfolio piece and growing product — avoid decisions that only serve one.
- Interview sessions expire after 30 minutes server-side; uploads capped at 3 MB; per-IP rate limiting on expensive endpoints.

## Brand Commitments

- Name: **Aura AI**. Author: Kartik Pareek. Built for CS50x 2026.
- The incumbent visual identity — dark glassmorphism theme, Inter / Space Grotesk / Syne type — is the current implementation, not a confirmed binding constraint. It may be preserved, expanded, or replaced by later design work.

## Evidence on Hand

- `README.md` — full feature and architecture documentation.
- Video demo: https://youtu.be/aQhjyn44JDw (linked from README; not verifiable locally).
- `backend/knowledge_base/career_data.json` — curated career roles, roadmaps, salary ranges, resources.
- No testimonials, user counts, press, or customer logos exist; future work must not fabricate them.

## Product Principles

1. One profile, every tool — session context is the product's spine; features must feel like they know the student.
2. Zero friction to start — no signup, no configuration; a student should get value within the first conversation.
3. Honest about limits — scores, grades, and roadmaps are AI-generated guidance, not credentialing; copy and UI should not overclaim.
4. India-first practicality — Hindi/Hinglish fluency, free-tier-friendly resources, and realistic study-hour constraints are features, not edge cases.
5. Portfolio-grade craft — the code is also a CS50x submission; clarity, documentation, and finish are part of the product.
