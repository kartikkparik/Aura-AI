import re
from groq_client import generate_interview_question, evaluate_interview_answer


def start_interview_session(role: str, level: str) -> dict:
    return {
        "role": role,
        "level": level,
        "question_num": 1,
        "total_questions": 6,
        "asked_questions": [],
        "scores": [],
        "feedbacks": [],
        "current_question": None,
        "completed": False
    }


def get_next_question(session: dict) -> dict:
    if session["question_num"] > session["total_questions"]:
        session["completed"] = True
        return {"completed": True, "summary": _generate_summary(session)}

    question = generate_interview_question(
        role=session["role"],
        level=session["level"],
        question_num=session["question_num"],
        asked_questions=session["asked_questions"]
    )

    if not question:
        question = f"Q{session['question_num']}. Describe a challenging problem you solved and the approach you took."

    session["current_question"] = question
    session["asked_questions"].append(question)

    return {
        "completed": False,
        "question": question,
        "question_num": session["question_num"],
        "total_questions": session["total_questions"]
    }


def evaluate_answer(session: dict, user_answer: str) -> dict:
    if not user_answer.strip():
        return {
            "error": "Please provide an answer to continue.",
            "question": session.get("current_question", "")
        }

    feedback = evaluate_interview_answer(
        question=session.get("current_question", ""),
        answer=user_answer,
        role=session["role"],
        level=session["level"]
    )

    if not feedback:
        feedback = "Answer submitted. Focus on structuring responses using STAR (Situation, Task, Action, Result)."

    score_match = re.search(r'Score[:\s]+(\d+)/10', feedback, re.IGNORECASE)
    score = int(score_match.group(1)) if score_match else 6

    session["scores"].append(score)
    session["feedbacks"].append({"question": session["current_question"], "feedback": feedback, "score": score})
    session["question_num"] += 1

    if session["question_num"] > session["total_questions"]:
        session["completed"] = True
        return {
            "feedback": feedback,
            "score": score,
            "completed": True,
            "summary": _generate_summary(session)
        }

    return {
        "feedback": feedback,
        "score": score,
        "completed": False,
        "next_question_ready": True
    }


def _generate_summary(session: dict) -> dict:
    scores = session["scores"]
    if not scores:
        return {"overall_score": 0, "grade": "N/A", "message": "No answers recorded."}

    avg = sum(scores) / len(scores)
    overall = round(avg * 10)

    if overall >= 80:
        grade = "Excellent 🌟"
        message = "Outstanding preparation and clear articulation."
        color = "green"
    elif overall >= 65:
        grade = "Good 👍"
        message = "Solid foundation with room for more quantified examples."
        color = "blue"
    elif overall >= 50:
        grade = "Average 📈"
        message = "Fair attempt. Focus on technical specifics and structured delivery."
        color = "yellow"
    else:
        grade = "Needs Practice 💪"
        message = "Consistent practice with domain questions will build strong confidence."
        color = "red"

    weakest_idx = scores.index(min(scores)) if scores else 0
    strongest_idx = scores.index(max(scores)) if scores else 0

    return {
        "overall_score": overall,
        "average_score": round(avg, 1),
        "grade": grade,
        "grade_color": color,
        "message": message,
        "total_questions": len(scores),
        "scores": scores,
        "weakest_question": session["feedbacks"][weakest_idx]["question"] if session["feedbacks"] else "",
        "strongest_question": session["feedbacks"][strongest_idx]["question"] if session["feedbacks"] else "",
    }
