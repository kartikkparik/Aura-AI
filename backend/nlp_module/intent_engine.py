import json
import re
from pathlib import Path

KNOWLEDGE_BASE_PATH = Path(__file__).parent.parent / "knowledge_base" / "career_data.json"


def load_knowledge_base():
    with open(KNOWLEDGE_BASE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


KB = load_knowledge_base()
INTENT_PATTERNS = KB.get("intent_patterns", {})
CAREER_ROLES = KB.get("career_roles", [])
PROGRAMMING_LANGUAGES = KB.get("programming_languages", [])


def preprocess(text: str) -> str:
    return text.lower().strip()


def detect_intent(text: str) -> str:
    cleaned = preprocess(text)
    scores = {}
    for intent, keywords in INTENT_PATTERNS.items():
        score = sum(1 for kw in keywords if kw in cleaned)
        if score > 0:
            scores[intent] = score
    if not scores:
        return "fallback"
    return max(scores, key=scores.get)


def detect_career_role(text: str) -> str | None:
    cleaned = preprocess(text)
    role_aliases = {
        "data_scientist": ["data scientist", "data science", "ds"],
        "ml_engineer": ["ml engineer", "machine learning engineer", "mle", "machine learning"],
        "ai_engineer": ["ai engineer", "artificial intelligence engineer", "llm", "genai", "generative ai"],
        "full_stack_developer": ["full stack", "fullstack", "web developer", "web dev", "frontend", "backend"],
        "cyber_security_analyst": ["cyber security", "cybersecurity", "security analyst", "ethical hacker", "infosec", "penetration testing"]
    }
    for role_key, aliases in role_aliases.items():
        if any(alias in cleaned for alias in aliases):
            return role_key
    return None


def extract_semester(text: str) -> int | None:
    patterns = [
        r"(\d+)(?:st|nd|rd|th)?\s*sem(?:ester)?",
        r"sem(?:ester)?\s*(\d+)",
        r"year\s*(\d+)",
        r"(\d+)(?:st|nd|rd|th)?\s*year"
    ]
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            val = int(match.group(1))
            if "year" in text.lower():
                val = val * 2 - 1
            return min(max(val, 1), 8)
    return None


def extract_programming_languages(text: str) -> list:
    cleaned = preprocess(text)
    return [lang for lang in PROGRAMMING_LANGUAGES if lang in cleaned]


def extract_study_hours(text: str) -> int | None:
    match = re.search(r"(\d+)\s*(?:hours?|hrs?)", text.lower())
    if match:
        return int(match.group(1))
    return None


def extract_skills_from_text(text: str) -> list:
    skill_keywords = [
        "python", "java", "javascript", "react", "node", "django", "flask",
        "sql", "nosql", "mongodb", "postgresql", "tensorflow", "pytorch",
        "scikit-learn", "pandas", "numpy", "docker", "kubernetes", "aws",
        "gcp", "azure", "linux", "git", "html", "css", "typescript",
        "langchain", "openai", "machine learning", "deep learning", "nlp",
        "computer vision", "data analysis"
    ]
    cleaned = preprocess(text)
    return [skill for skill in skill_keywords if skill in cleaned]


def get_skill_gap(user_skills: list, target_role: str) -> dict:
    if target_role not in KB.get("careers", {}):
        return {"missing": [], "has": [], "percentage": 0}

    required_skills = [s.lower() for s in KB["careers"][target_role]["required_skills"]]
    user_skills_lower = [s.lower() for s in user_skills]

    has = [skill for skill in required_skills if any(u in skill or skill in u for u in user_skills_lower)]
    missing = [skill for skill in required_skills if skill not in has]
    percentage = round((len(has) / len(required_skills)) * 100) if required_skills else 0

    return {
        "has": has,
        "missing": missing,
        "percentage": percentage
    }


def analyze_message(text: str, session_data: dict) -> dict:
    return {
        "intent": detect_intent(text),
        "career_role": detect_career_role(text),
        "semester": extract_semester(text),
        "programming_languages": extract_programming_languages(text),
        "study_hours": extract_study_hours(text),
        "extracted_skills": extract_skills_from_text(text),
        "cleaned_text": preprocess(text)
    }
