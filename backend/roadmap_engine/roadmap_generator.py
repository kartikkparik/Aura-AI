import json
from pathlib import Path
from typing import Optional

KNOWLEDGE_BASE_PATH = Path(__file__).parent.parent / "knowledge_base" / "career_data.json"

def load_knowledge_base():
    with open(KNOWLEDGE_BASE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

KB = load_knowledge_base()

def generate_roadmap(career_role: str, current_semester: int = 1, known_skills: list = None) -> dict:
    """
    Generate a personalized semester-wise roadmap for a given career role.
    Filters out already-completed semesters based on current_semester.
    """
    if career_role not in KB["careers"]:
        return {"error": f"Career role '{career_role}' not found."}

    known_skills = known_skills or []
    career_data = KB["careers"][career_role]
    roadmap_data = career_data.get("roadmap", {})

                            
    full_roadmap = []
    for sem_key, sem_data in roadmap_data.items():
        sem_num = int(sem_key.split("_")[1])
        status = "completed" if sem_num < current_semester else ("current" if sem_num == current_semester else "upcoming")
        full_roadmap.append({
            "semester": sem_num,
            "key": sem_key,
            "title": sem_data.get("title", f"Semester {sem_num}"),
            "topics": sem_data.get("topics", []),
            "resources": sem_data.get("resources", {}),
            "status": status
        })

                        
    required_skills = [s.lower() for s in career_data.get("required_skills", [])]
    known_lower = [s.lower() for s in known_skills]
    
    matching = [s for s in required_skills if any(k in s or s in k for k in known_lower)]
    missing_for_role = [s for s in required_skills if s not in matching]

    return {
        "career_role": career_role,
        "career_title": career_data["title"],
        "description": career_data["description"],
        "current_semester": current_semester,
        "total_semesters": len(roadmap_data),
        "roadmap": full_roadmap,
        "skill_gap": {
            "has": matching,
            "missing": missing_for_role,
            "completion_percentage": round((len(matching) / len(required_skills)) * 100) if required_skills else 0
        },
        "tools_frameworks": career_data.get("tools_frameworks", []),
        "salary_range": career_data.get("salary_range", {}),
        "projects": career_data.get("projects", []),
        "certifications": career_data.get("certifications", []),
        "future_scope": career_data.get("future_scope", "")
    }

def get_current_semester_plan(career_role: str, semester: int) -> dict:
    """Get the specific plan for the current semester."""
    if career_role not in KB["careers"]:
        return {}

    roadmap = KB["careers"][career_role].get("roadmap", {})
    sem_key = f"semester_{semester}"
    
    if sem_key in roadmap:
        return {
            "semester": semester,
            "title": roadmap[sem_key].get("title", ""),
            "topics": roadmap[sem_key].get("topics", []),
            "resources": roadmap[sem_key].get("resources", {})
        }
    
                                                    
    last_key = list(roadmap.keys())[-1]
    return {
        "semester": semester,
        "title": "Advanced/Project Phase",
        "topics": roadmap[last_key].get("topics", []),
        "resources": roadmap[last_key].get("resources", {})
    }

def get_all_roles_summary() -> list:
    """Get a summary of all available career roles."""
    summaries = []
    for role_key, role_data in KB["careers"].items():
        summaries.append({
            "key": role_key,
            "title": role_data["title"],
            "description": role_data["description"],
            "salary_range": role_data["salary_range"],
            "key_skills": role_data["required_skills"][:5],
            "top_tools": role_data["tools_frameworks"][:5],
            "future_scope": role_data["future_scope"]
        })
    return summaries

def compare_roles(role1: str, role2: str) -> dict:
    """Compare two career roles side by side."""
    if role1 not in KB["careers"] or role2 not in KB["careers"]:
        return {"error": "One or both roles not found"}
    
    r1 = KB["careers"][role1]
    r2 = KB["careers"][role2]
    
    return {
        "role1": {
            "title": r1["title"],
            "salary": r1["salary_range"],
            "skills": r1["required_skills"][:6],
            "tools": r1["tools_frameworks"][:5],
            "scope": r1["future_scope"]
        },
        "role2": {
            "title": r2["title"],
            "salary": r2["salary_range"],
            "skills": r2["required_skills"][:6],
            "tools": r2["tools_frameworks"][:5],
            "scope": r2["future_scope"]
        }
    }
