import json
from pathlib import Path
from typing import Optional

KNOWLEDGE_BASE_PATH = Path(__file__).parent.parent / "knowledge_base" / "career_data.json"

def load_knowledge_base():
    with open(KNOWLEDGE_BASE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

KB = load_knowledge_base()

def get_recommendations(career_role: str, semester: int, missing_skills: list, prefer_free: bool = True) -> dict:
    """
    Generate course and resource recommendations based on career role,
    current semester, and skill gaps.
    """
    if career_role not in KB["careers"]:
        return {"error": f"Role '{career_role}' not found."}

    career = KB["careers"][career_role]
    roadmap = career.get("roadmap", {})
    sem_key = f"semester_{semester}"

                                                 
    current_resources = []
    next_resources = []

    if sem_key in roadmap:
        sem_data = roadmap[sem_key]
        resources = sem_data.get("resources", {})
        current_resources = _flatten_resources(resources, label="Current Semester")

    next_sem_key = f"semester_{semester + 1}"
    if next_sem_key in roadmap:
        next_data = roadmap[next_sem_key]
        next_resources = _flatten_resources(next_data.get("resources", {}), label="Next Semester Preview")

                           
    all_resources = current_resources + next_resources
    if prefer_free:
        free = [r for r in all_resources if r.get("type") == "free"]
        paid = [r for r in all_resources if r.get("type") == "paid"]
        prioritized = free + paid
    else:
        prioritized = all_resources

                                        
    skill_resources = _get_skill_resources(missing_skills)

    return {
        "recommended_resources": prioritized,
        "skill_gap_resources": skill_resources,
        "platforms": {
            "free": [
                {"name": "NPTEL", "url": "https://nptel.ac.in/", "description": "IIT/IISc courses with certification"},
                {"name": "freeCodeCamp", "url": "https://www.freecodecamp.org/", "description": "Free full-stack coding curriculum"},
                {"name": "Kaggle Learn", "url": "https://www.kaggle.com/learn", "description": "Hands-on ML and data science courses"},
                {"name": "DeepLearning.AI Short Courses", "url": "https://www.deeplearning.ai/", "description": "Free short AI/ML courses"},
                {"name": "HuggingFace Courses", "url": "https://huggingface.co/learn", "description": "NLP & LLM courses"},
                {"name": "TryHackMe", "url": "https://tryhackme.com/", "description": "Hands-on cybersecurity learning"},
                {"name": "The Odin Project", "url": "https://www.theodinproject.com/", "description": "Full stack web dev curriculum"}
            ],
            "paid": [
                {"name": "Coursera", "url": "https://www.coursera.org/", "description": "University-backed courses with certificates"},
                {"name": "Udemy", "url": "https://www.udemy.com/", "description": "Affordable video courses with sales"},
                {"name": "edX", "url": "https://www.edx.org/", "description": "University courses, some fully free"},
                {"name": "LinkedIn Learning", "url": "https://www.linkedin.com/learning/", "description": "Professional skill development"}
            ]
        }
    }

def _flatten_resources(resources: dict, label: str) -> list:
    """Flatten youtube and course resources into a unified list."""
    flat = []
    for channel in resources.get("youtube", []):
        flat.append({
            "name": channel["name"],
            "url": channel["url"],
            "platform": "YouTube",
            "type": "free",
            "label": label
        })
    for course in resources.get("courses", []):
        flat.append({
            "name": course["name"],
            "url": course["url"],
            "platform": "Course Platform",
            "type": course.get("type", "free"),
            "label": label
        })
    return flat

def _get_skill_resources(missing_skills: list) -> list:
    """Get targeted resources for specific missing skills."""
    skill_map = {
        "python": [
            {"name": "Python for Everybody (Coursera)", "url": "https://www.coursera.org/specializations/python", "type": "free"},
            {"name": "CS50P - Harvard Python", "url": "https://cs50.harvard.edu/python/", "type": "free"}
        ],
        "machine learning": [
            {"name": "ML by Andrew Ng (Coursera)", "url": "https://www.coursera.org/learn/machine-learning", "type": "paid"},
            {"name": "NPTEL ML Course", "url": "https://nptel.ac.in/courses/106106139", "type": "free"}
        ],
        "deep learning": [
            {"name": "Deep Learning Specialization", "url": "https://www.coursera.org/specializations/deep-learning", "type": "paid"},
            {"name": "Fast.ai (Free)", "url": "https://course.fast.ai/", "type": "free"}
        ],
        "sql": [
            {"name": "SQLZoo (Free)", "url": "https://sqlzoo.net/", "type": "free"},
            {"name": "Mode SQL Tutorial", "url": "https://mode.com/sql-tutorial/", "type": "free"}
        ],
        "docker": [
            {"name": "Docker Crash Course - TechWorld Nana", "url": "https://www.youtube.com/watch?v=3c-iBn73dDE", "type": "free"}
        ],
        "react": [
            {"name": "Full Stack Open (Helsinki)", "url": "https://fullstackopen.com/", "type": "free"}
        ],
        "statistics": [
            {"name": "Khan Academy Statistics", "url": "https://www.khanacademy.org/math/statistics-probability", "type": "free"}
        ],
        "networking": [
            {"name": "Cisco NetAcad", "url": "https://www.netacad.com/", "type": "free"}
        ]
    }

    results = []
    for skill in missing_skills:
        skill_lower = skill.lower()
        for key, resources in skill_map.items():
            if key in skill_lower or skill_lower in key:
                for r in resources:
                    r["for_skill"] = skill
                    results.append(r)
    return results
