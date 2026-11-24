import re
import io
import logging
from groq_client import analyze_resume_with_groq

logger = logging.getLogger("aura.resume_analyzer")

ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.txt'}
MAX_RESUME_TEXT_CHARS = 12000
MIN_RESUME_TEXT_CHARS = 50


def extract_score(analysis_text: str) -> int:
    match = re.search(r'OVERALL SCORE[:\s]+(\d+)', analysis_text, re.IGNORECASE)
    if match:
        return min(int(match.group(1)), 100)
    match = re.search(r'(\d+)\s*/\s*100', analysis_text)
    if match:
        return min(int(match.group(1)), 100)
    return 0


def extract_section_scores(analysis_text: str) -> dict:
    scores = {}
    patterns = {
        "format": r'Format[^:]*:\s*(\d+)/20',
        "keywords": r'Keywords[^:]*:\s*(\d+)/25',
        "experience": r'(?:Work\s+)?Experience[^:]*:\s*(\d+)/25',
        "skills": r'Skills[^:]*:\s*(\d+)/20',
        "education": r'Education[^:]*:\s*(\d+)/10',
    }
    for key, pattern in patterns.items():
        match = re.search(pattern, analysis_text, re.IGNORECASE)
        if match:
            scores[key] = int(match.group(1))
    return scores


def is_allowed_file(filename: str) -> bool:
    if not filename or '.' not in filename:
        return False
    ext = '.' + filename.rsplit('.', 1)[1].lower()
    return ext in ALLOWED_EXTENSIONS


def extract_text_from_file(file_content: bytes, filename: str) -> str:
    filename_lower = filename.lower()

    if filename_lower.endswith('.pdf'):
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            extracted = []
            for page in reader.pages[:10]:  # Limit to first 10 pages for sanity
                text = page.extract_text()
                if text:
                    extracted.append(text)
            return "\n".join(extracted).strip()
        except Exception as e:
            logger.warning(f"PDF extraction failed for {filename}: {e}")
            return ""

    elif filename_lower.endswith('.docx'):
        try:
            import docx
            doc = docx.Document(io.BytesIO(file_content))
            return "\n".join([p.text for p in doc.paragraphs if p.text]).strip()
        except Exception as e:
            logger.warning(f"DOCX extraction failed for {filename}: {e}")
            return ""

    elif filename_lower.endswith('.txt'):
        try:
            return file_content.decode('utf-8', errors='ignore').strip()
        except Exception:
            return file_content.decode('latin-1', errors='ignore').strip()

    return ""


def analyze_resume(resume_text: str = None, file_content: bytes = None, filename: str = "resume.txt") -> dict:
    if file_content and not resume_text:
        if not is_allowed_file(filename):
            return {
                "error": "Unsupported file format. Please upload a PDF, DOCX, or TXT file.",
                "score": 0,
                "analysis": ""
            }
        resume_text = extract_text_from_file(file_content, filename)

    if not resume_text or len(resume_text.strip()) < MIN_RESUME_TEXT_CHARS:
        return {
            "error": "Could not extract sufficient text from resume. Please ensure the document is not an image-only scan and contains at least 50 characters.",
            "score": 0,
            "analysis": ""
        }

    # Bounded text to protect LLM context
    bounded_text = resume_text.strip()[:MAX_RESUME_TEXT_CHARS]

    analysis = analyze_resume_with_groq(bounded_text)
    if not analysis:
        return {
            "error": "AI analysis service is temporarily busy. Please retry in a few moments.",
            "score": 0,
            "analysis": ""
        }

    overall_score = extract_score(analysis)
    section_scores = extract_section_scores(analysis)
    ats_match = re.search(r'ATS COMPATIBILITY[:\s]+(High|Medium|Low)', analysis, re.IGNORECASE)
    ats_level = ats_match.group(1) if ats_match else "Medium"

    return {
        "score": overall_score,
        "section_scores": section_scores,
        "analysis": analysis,
        "ats_level": ats_level,
        "word_count": len(bounded_text.split()),
        "char_count": len(bounded_text)
    }
