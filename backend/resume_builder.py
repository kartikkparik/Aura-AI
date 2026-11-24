from groq_client import build_resume_with_groq


def build_resume(user_data: dict) -> dict:
    if not user_data:
        return {"error": "No data provided", "resume_html": "", "resume_text": ""}

    personal = user_data.get("personal", {})
    if not personal.get("name"):
        return {"error": "Name is required to build resume", "resume_html": "", "resume_text": ""}

    ai_result = build_resume_with_groq(user_data)
    if not ai_result:
        return {
            "error": "AI generation service temporarily unavailable.",
            "resume_html": "",
            "resume_text": ""
        }

    template = user_data.get("template", "modern")
    name = personal.get("name", "")
    email = personal.get("email", "")
    phone = personal.get("phone", "")
    target_role = user_data.get("target_role", "Professional")

    summary = ai_result.get("summary", "")
    exp_bullets = ai_result.get("experience_bullets", {})
    skills_org = ai_result.get("skills_organized", {})

    text_content = f"{name}\n{email} | {phone}\n\nTARGET ROLE: {target_role}\n\nSUMMARY:\n{summary}\n\nEXPERIENCE:\n"
    for exp in user_data.get("experience", []):
        company = exp.get("company", "")
        role = exp.get("role", "")
        bullets = exp_bullets.get(company, []) or exp_bullets.get(role, []) or [exp.get("description", "")]
        text_content += f"- {role} at {company}\n"
        for bullet in bullets:
            text_content += f"  * {bullet}\n"

    text_content += "\nSKILLS:\n"
    for category, skill_list in skills_org.items():
        text_content += f"- {category}: {', '.join(skill_list)}\n"

    html_content = f"""
    <div class="resume-container template-{template}">
        <header>
            <h1>{name}</h1>
            <p class="target-title">{target_role}</p>
            <div class="contact-info">
                <span>{email}</span> | <span>{phone}</span>
            </div>
        </header>
        <section class="summary">
            <h2>Professional Summary</h2>
            <p>{summary}</p>
        </section>
        <section class="experience">
            <h2>Experience</h2>
    """
    for exp in user_data.get("experience", []):
        company = exp.get("company", "")
        role = exp.get("role", "")
        bullets = exp_bullets.get(company, []) or exp_bullets.get(role, []) or [exp.get("description", "")]
        html_content += f"<div class='job'><h3>{role} — {company}</h3><ul>"
        for bullet in bullets:
            html_content += f"<li>{bullet}</li>"
        html_content += "</ul></div>"

    html_content += "</section><section class='skills'><h2>Skills</h2>"
    for category, skill_list in skills_org.items():
        html_content += f"<div class='skill-category'><strong>{category}:</strong> {', '.join(skill_list)}</div>"
    html_content += "</section></div>"

    return {
        "resume_html": html_content,
        "resume_text": text_content,
        "professional_summary": summary,
        "tips": ai_result.get("tips", []),
        "ats_keywords": ai_result.get("ats_keywords", []),
        "template": template
    }
