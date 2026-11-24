import os
import json
import re
import logging
from pathlib import Path

logger = logging.getLogger("aura.groq_client")

_env_path = Path(__file__).parent / ".env"
if _env_path.exists():
    with open(_env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip())

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

# Configurable fallback model list; uses verified current Groq production models
_configured_models = os.environ.get("GROQ_MODELS", "")
if _configured_models:
    MODELS_FALLBACK = [m.strip() for m in _configured_models.split(",") if m.strip()]
else:
    MODELS_FALLBACK = [
        "openai/gpt-oss-120b",  # Primary high-quality model (Groq recommended replacement)
        "openai/gpt-oss-20b",   # Fast resilient fallback
    ]

# Client request timeout (seconds)
GROQ_TIMEOUT = float(os.environ.get("GROQ_TIMEOUT", "25.0"))
# Maximum input prompt length to avoid token limit overflow or excessive billing
MAX_INPUT_LENGTH = 3000

CAREER_SYSTEM_PROMPT = """You are Aura AI — an elite, highly intelligent, and empathetic Career Operating System & Mentor.

## Domain Mastery
You provide razor-sharp, actionable, step-by-step guidance across all career verticals:
- Tech: Software Engineering, AI & Machine Learning, Data Science, Cybersecurity, Cloud/DevOps, Full-Stack, Web3
- Healthcare: MBBS, Dental, Nursing, Biotech, Pharma, Medical Research
- Business & Finance: Management, Investment Banking, CA, CFA, Fintech, Marketing, Strategy
- Civil Services & Law: UPSC (IAS/IPS), Judiciary, Corporate Law, Defence (NDA/CDS)
- Creative & Product: UX/UI, Product Management, Digital Media, Graphic Design

## Language Mirroring Rule
- Understand user messages written in English, Hinglish (Romanized Hindi), or Devanagari Hindi.
- Reply in clean, natural English when the user writes in English.
- Reply in natural, conversational Hinglish (Roman script only) when the user writes in Hinglish or Devanagari Hindi.
- NEVER reply in Devanagari Hindi script unless the user explicitly asks to translate into Hindi script.
- Typo-Tolerant: Seamlessly understand abbreviations, slang, and misspelled queries without asking to repeat.
- Structure & Readability: Use bold keywords, clean bullet points, and concise milestone breakdowns. Avoid overwhelming walls of text.
- Action-Oriented: Always provide concrete next steps, high-value free/official resources, and honest salary/timeline benchmarks.

## Developer & Origin
- If asked about your creator, engineer, or developer, state proudly and clearly that you were designed and engineered by Kartik Pareek (Full-Stack & AI Systems Developer).
"""

RESUME_SYSTEM_PROMPT = """You are an Executive Resume Strategist & ATS Specialist with 15+ years in global hiring.
Analyze the candidate's resume with strict, actionable standards:

Output in this exact format:
**OVERALL SCORE: XX/100**

**SECTION SCORES:**
- Format & Structure: XX/20
- Keywords & ATS: XX/25  
- Work Experience: XX/25
- Skills: XX/20
- Education: XX/10

**STRENGTHS:**
• [3-5 specific strengths]

**CRITICAL IMPROVEMENTS:**
• [5-7 high-impact fixes with concrete examples]

**ATS COMPATIBILITY:** [High/Medium/Low] — [Reasoning]

**MISSING KEYWORDS:**
• [High-demand domain keywords to add]

**OVERALL VERDICT:**
[Summary & top priority action]
"""

RESUME_BUILDER_SYSTEM_PROMPT = """You are an elite Resume Writer. Generate a high-impact, ATS-optimized JSON resume:
{
  "summary": "[Punchy 3-4 sentence professional summary tailored to target role]",
  "experience_bullets": {"company_role": ["Action verb + task + quantified metric result"]},
  "skills_organized": {"Category": ["skill1", "skill2"]},
  "ats_keywords": ["keyword1", "keyword2"],
  "tips": ["Strategic tip 1", "Tip 2"]
}
"""

DOCUMENT_CORRECTOR_SYSTEM_PROMPT = """You are a senior Professional Editor. Refine the given text according to the selected mode (grammar, professional, full, academic).
Return valid JSON:
{
  "corrected_text": "[fully refined text]",
  "changes_summary": [{"type": "Grammar/Style", "description": "Specific change description", "count": 2}],
  "error_count": 3,
  "improvement_score": 92,
  "key_improvements": ["Key fix 1", "Key fix 2"],
  "writing_tips": ["Actionable tip"]
}
"""

INTERVIEW_SYSTEM_PROMPT = """You are a Principal Mock Interviewer.
Ask clear, industry-relevant questions (technical, behavioral, situational).
For evaluations: Score 1-10, detail strong points, pinpoint gaps, and provide a model answer framework.
"""


def _get_groq_client():
    if not GROQ_API_KEY:
        logger.warning("GROQ_API_KEY is not configured.")
        return None
    try:
        from groq import Groq
        return Groq(api_key=GROQ_API_KEY, timeout=GROQ_TIMEOUT)
    except ImportError:
        logger.error("groq package not installed. Run: pip install groq")
        return None
    except Exception as e:
        logger.error(f"Failed to initialize Groq client: {e}")
        return None


def clean_model_output(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
    return text


def ask_groq(
    user_message: str,
    student_context: dict = None,
    chat_history: list = None,
    system_override: str = None,
    max_tokens: int = 600,
    temperature: float = 0.7
) -> str | None:
    client = _get_groq_client()
    if not client:
        return None

    # Guard against excessively large user input
    bounded_user_message = (user_message or "").strip()[:MAX_INPUT_LENGTH]
    if not bounded_user_message:
        return None

    system = system_override or CAREER_SYSTEM_PROMPT

    if student_context and not system_override:
        profile_parts = []
        if student_context.get("name"):
            profile_parts.append(f"Candidate Name: {str(student_context['name'])[:50]}")
        if student_context.get("current_semester"):
            profile_parts.append(f"Current Semester: {student_context['current_semester']}")
        if student_context.get("career_goal"):
            profile_parts.append(f"Career Goal: {str(student_context['career_goal'])[:80]}")
        if student_context.get("known_languages"):
            skills = student_context["known_languages"]
            skills_str = ", ".join([str(s)[:30] for s in skills[:8]]) if isinstance(skills, list) else str(skills)[:150]
            profile_parts.append(f"Known Skills: {skills_str}")
        if student_context.get("weekly_study_hours"):
            profile_parts.append(f"Weekly Study Hours: {student_context['weekly_study_hours']}")

        if profile_parts:
            system += "\n\n## CANDIDATE PROFILE CONTEXT\n" + "\n".join(profile_parts)

    messages = [{"role": "system", "content": system}]

    # Bound chat history to last 8 messages with max 1200 chars per message
    if chat_history:
        for msg in chat_history[-8:]:
            if isinstance(msg, dict):
                role = msg.get("role", "user")
                content = str(msg.get("content", ""))[:1200]
                if role in ("user", "assistant") and content:
                    messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": bounded_user_message})

    # Sequential fallback through verified models; retries only transient errors
    for model_name in MODELS_FALLBACK:
        retries_left = 1
        while retries_left >= 0:
            try:
                response = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=temperature,
                )
                raw_reply = response.choices[0].message.content or ""
                cleaned = clean_model_output(raw_reply)
                if cleaned:
                    return cleaned
                break
            except Exception as e:
                err_str = str(e).lower()
                is_transient = "429" in err_str or "rate_limit" in err_str or "503" in err_str or "timeout" in err_str
                if is_transient and retries_left > 0:
                    retries_left -= 1
                    import time
                    time.sleep(1.0)
                    continue
                else:
                    logger.warning(f"Groq model {model_name} failed: {type(e).__name__}")
                    break

    logger.error("All Groq fallback models failed to respond.")
    return None


def analyze_resume_with_groq(resume_text: str) -> str | None:
    prompt = f"Analyze the following resume thoroughly and provide structured feedback:\n\n{resume_text[:4000]}"
    return ask_groq(
        user_message=prompt,
        system_override=RESUME_SYSTEM_PROMPT,
        max_tokens=1500,
        temperature=0.3
    )


def generate_interview_question(role: str, level: str, question_num: int, asked_questions: list = None) -> str | None:
    asked = "\n".join([f"- {str(q)[:120]}" for q in (asked_questions or [])[:6]]) if asked_questions else "None yet"
    prompt = f"Role: {str(role)[:60]} | Level: {str(level)[:30]}\nQuestion #{question_num}\nPreviously Asked:\n{asked}\n\nGenerate ONE high-quality question for this round."
    return ask_groq(
        user_message=prompt,
        system_override=INTERVIEW_SYSTEM_PROMPT,
        max_tokens=250,
        temperature=0.7
    )


def evaluate_interview_answer(question: str, answer: str, role: str, level: str) -> str | None:
    prompt = f"Role: {str(role)[:60]} | Level: {str(level)[:30]}\n\nQuestion: {str(question)[:300]}\nCandidate Answer: {str(answer)[:1500]}\n\nProvide Score (1-10), strengths, areas for improvement, and an ideal response snippet."
    return ask_groq(
        user_message=prompt,
        system_override=INTERVIEW_SYSTEM_PROMPT,
        max_tokens=600,
        temperature=0.4
    )


def build_resume_with_groq(user_data: dict) -> dict | None:
    personal = user_data.get("personal", {})
    prompt = f"""Build an ATS-optimized professional resume JSON for:
Target Role: {str(user_data.get('target_role', 'Software Engineer'))[:80]}
Candidate: {str(personal.get('name', 'Candidate'))[:60]} | Email: {str(personal.get('email', ''))[:80]}
Experience: {json.dumps(user_data.get('experience', []))[:1500]}
Skills: {', '.join([str(s)[:30] for s in user_data.get('skills', [])[:20]])}
Education: {json.dumps(user_data.get('education', []))[:800]}
Projects: {json.dumps(user_data.get('projects', []))[:1000]}
"""
    response = ask_groq(
        user_message=prompt,
        system_override=RESUME_BUILDER_SYSTEM_PROMPT,
        max_tokens=2000,
        temperature=0.4
    )
    if not response:
        return None

    try:
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return json.loads(response)
    except Exception:
        return {"summary": response, "ats_keywords": [], "tips": [], "experience_bullets": {}, "skills_organized": {}}


def correct_document_with_groq(doc_text: str, correction_mode: str = "full", doc_type: str = "general") -> dict | None:
    prompt = f"Mode: {correction_mode}\nDocument Type: {doc_type}\n\nText:\n{doc_text[:2500]}"
    response = ask_groq(
        user_message=prompt,
        system_override=DOCUMENT_CORRECTOR_SYSTEM_PROMPT,
        max_tokens=2500,
        temperature=0.2
    )
    if not response:
        return None

    try:
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return json.loads(response)
    except Exception:
        return {
            "corrected_text": response,
            "changes_summary": [{"type": "General", "description": "Document refined", "count": 1}],
            "error_count": 0,
            "improvement_score": 88,
            "key_improvements": ["Enhanced structure, phrasing, and flow"],
            "writing_tips": []
        }
