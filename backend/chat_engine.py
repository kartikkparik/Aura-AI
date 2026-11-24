from typing import Tuple
from groq_client import ask_groq

ROLE_DISPLAY = {
    "data_scientist": "Data Scientist",
    "ml_engineer": "ML Engineer",
    "ai_engineer": "AI Engineer",
    "full_stack_developer": "Full Stack Developer",
    "cyber_security_analyst": "Cyber Security Analyst"
}

PROFILING_QUESTIONS = [
    "What's your name?",
    "Which semester are you in? (e.g., 1st, 2nd, 5th...)",
    "Which programming languages or core skills do you have? (Python, Java, C++, etc.)",
    "What is your career goal? (AI Engineer, Doctor, CA, IAS, Data Scientist, etc.)",
    "How many hours per week can you dedicate to studying?"
]


def get_welcome_message() -> str:
    return """Hi, I'm **Aura** — your personal career mentor. No login needed.

I can guide you across many fields:
💻 **Tech** (AI/ML, Software Engineering, Data Science, Cybersecurity, Cloud)
🏥 **Healthcare** (MBBS, Nursing, Pharmacy, Biotech)
⚖️ **Law** (Corporate Law, Judiciary, LLB)
🏛️ **Civil & Govt** (UPSC/IAS, SSC, Defence NDA/CDS)
💼 **Business** (MBA, CA, CFA, Investment Banking)
🎨 **Design & Media** (UX/UI, Product Design, Digital Marketing)

**What I can do:**
✅ Step-by-step personalized learning roadmaps & timelines
✅ Skill gap analysis & free curated resources
✅ AI-powered Resume Analyzer & Builder
✅ Interactive Mock Interview prep with scoring
✅ Natural conversation — English, Hindi, or Hinglish

Tell me your career goal, or type **"start"** to set up your profile!"""


def handle_profiling(session_data: dict, user_text: str) -> Tuple[str, dict]:
    step = session_data.get("profiling_step", 0)

    if step == 0:
        name = user_text.strip().split()[0].title() if user_text.strip() else ""
        if name and len(name) > 1:
            session_data["name"] = name
            session_data["profiling_step"] = 1
            return (f"Welcome, **{name}**!\n\n{PROFILING_QUESTIONS[1]}", session_data)
        return (PROFILING_QUESTIONS[0], session_data)

    elif step == 1:
        nums = [int(w) for w in user_text.replace("st","").replace("nd","").replace("rd","").replace("th","").split() if w.replace("st","").replace("nd","").replace("rd","").replace("th","").isdigit()]
        if nums:
            sem = min(max(nums[0], 1), 12)
            session_data["current_semester"] = sem
            session_data["profiling_step"] = 2
            return (f"Got it — **Semester {sem}** ✓\n\n{PROFILING_QUESTIONS[2]}", session_data)
        return ("Please share a semester number, e.g. **3** or **5th**", session_data)

    elif step == 2:
        if any(w in user_text.lower() for w in ["none", "nahi", "no", "kuch nahi", "beginner", "nothing", "nhi"]):
            session_data["known_languages"] = []
            session_data["profiling_step"] = 3
            return (f"No problem — we'll build your roadmap from scratch!\n\n{PROFILING_QUESTIONS[3]}", session_data)
        skills = [s.strip() for s in user_text.replace(",", " ").split() if len(s.strip()) > 1]
        session_data["known_languages"] = skills[:10]
        skill_str = ", ".join(skills[:5]) if skills else "noted"
        session_data["profiling_step"] = 3
        return (f"Skills noted: **{skill_str}** ✓\n\n{PROFILING_QUESTIONS[3]}", session_data)

    elif step == 3:
        goal = user_text.strip()
        if len(goal) < 2:
            return (PROFILING_QUESTIONS[3], session_data)
        session_data["career_goal_text"] = goal
        role_map = {
            "data scientist": "data_scientist", "data science": "data_scientist",
            "ml engineer": "ml_engineer", "machine learning": "ml_engineer",
            "ai engineer": "ai_engineer", "artificial intelligence": "ai_engineer",
            "full stack": "full_stack_developer", "web developer": "full_stack_developer",
            "cyber security": "cyber_security_analyst", "cybersecurity": "cyber_security_analyst"
        }
        for key, val in role_map.items():
            if key in goal.lower():
                session_data["career_goal"] = val
                break
        session_data["profiling_step"] = 4
        return (f"Target Goal: **{goal}** 🎯\n\n{PROFILING_QUESTIONS[4]}", session_data)

    elif step == 4:
        nums = [int(w) for w in user_text.split() if w.isdigit()]
        hours = min(max(nums[0], 1), 80) if nums else 10
        session_data["weekly_study_hours"] = hours
        session_data["profiling_step"] = 5
        session_data["profiling_complete"] = True
        return (_generate_profile_summary(session_data), session_data)

    return ("To reset your profile, type **'start'**.", session_data)


def _generate_profile_summary(session_data: dict) -> str:
    name = session_data.get("name", "Candidate")
    sem = session_data.get("current_semester", 1)
    goal = session_data.get("career_goal_text", session_data.get("career_goal", "not specified"))
    langs = session_data.get("known_languages", [])
    hours = session_data.get("weekly_study_hours", 10)
    lang_str = ", ".join(langs) if langs else "Beginner (Starting fresh)"

    prompt = f"""Student Profile:
- Name: {name}
- Current Semester: {sem}
- Career Goal: {goal}
- Current Skills: {lang_str}
- Weekly Study Hours: {hours} hours

Provide:
1. Concise profile evaluation
2. Top 3 high-impact immediate action steps for the next 30 days
3. Realistic timeline to achieve job-readiness
Keep it structured, encouraging, and tailored."""

    groq_response = ask_groq(prompt, student_context=session_data)

    if groq_response:
        header = f"""✅ **Profile Setup Complete, {name}!**

---
👤 **Candidate:** {name} | 📚 **Semester:** {sem}
🎯 **Goal:** {goal} | 💻 **Skills:** {lang_str} | ⏱️ **Study:** {hours} hrs/week

---

"""
        footer = "\n\n---\n💡 **Next Steps:**\n• **'roadmap'** — Semester-by-semester learning path\n• **'courses'** — Free and accredited resources\n• `/resume` page — Review or generate your resume"
        return header + groq_response + footer
    else:
        return f"✅ **Profile Complete, {name}!**\n\nSemester: **{sem}** | Goal: **{goal}** | Study: **{hours} hrs/week**\n\nAsk any question or type **'roadmap'** to begin! 🚀"


def process_message(user_text: str, session_data: dict, chat_history: list = None) -> Tuple[str, dict]:
    user_text = user_text.strip()
    if not user_text:
        return ("Please enter a message to begin.", session_data)

    if user_text.lower() in ["start", "begin", "setup", "profile", "restart", "reset", "shuru", "profile setup"]:
        session_data["profiling_step"] = 0
        session_data["profiling_complete"] = False
        session_data["name"] = None
        session_data["career_goal"] = None
        session_data["career_goal_text"] = None
        session_data["current_semester"] = 1
        session_data["known_languages"] = []
        return ("Let's set up your profile!\n\n" + PROFILING_QUESTIONS[0], session_data)

    if not session_data.get("profiling_complete", False) and session_data.get("profiling_step", 0) > 0:
        return handle_profiling(session_data, user_text)

    groq_response = ask_groq(
        user_message=user_text,
        student_context=session_data,
        chat_history=chat_history or []
    )

    if groq_response:
        return (groq_response, session_data)

    name_prefix = f"**{session_data.get('name', '')}**, " if session_data.get("name") else ""
    return (
        f"🤔 {name_prefix}AI service is currently responding slowly. Please retry in a moment or explore our Roadmaps & Resume tools.",
        session_data
    )
