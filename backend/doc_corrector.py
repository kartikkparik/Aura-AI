import re
from groq_client import correct_document_with_groq


def extract_text_from_file(file_content: bytes, filename: str) -> str:
    filename_lower = filename.lower()

    if filename_lower.endswith('.pdf'):
        try:
            import PyPDF2
            import io
            reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            text = "".join([page.extract_text() or "" for page in reader.pages])
            return text.strip()
        except ImportError:
            return "[PDF parsing requires PyPDF2]"
        except Exception as e:
            return f"[PDF parse error: {e}]"

    elif filename_lower.endswith(('.docx', '.doc')):
        try:
            import docx
            import io
            doc = docx.Document(io.BytesIO(file_content))
            return "\n".join([p.text for p in doc.paragraphs]).strip()
        except ImportError:
            return "[DOCX parsing requires python-docx]"
        except Exception as e:
            return f"[DOCX parse error: {e}]"

    else:
        try:
            return file_content.decode('utf-8', errors='ignore').strip()
        except Exception:
            return file_content.decode('latin-1', errors='ignore').strip()


def correct_document(
    doc_text: str = None,
    file_content: bytes = None,
    filename: str = "document.txt",
    correction_mode: str = "full",
    doc_type: str = "general"
) -> dict:
    if file_content and not doc_text:
        doc_text = extract_text_from_file(file_content, filename)

    if not doc_text or len(doc_text.strip()) < 10:
        return {
            "error": "Document text is too short. Please provide meaningful content to analyze.",
            "corrected_text": "",
            "changes_summary": [],
            "error_count": 0,
            "improvement_score": 0
        }

    if len(doc_text) > 8000:
        doc_text = doc_text[:8000]

    result = correct_document_with_groq(doc_text, correction_mode, doc_type)
    if not result:
        return {
            "error": "Document refinement service temporarily unavailable.",
            "corrected_text": "",
            "changes_summary": [],
            "error_count": 0,
            "improvement_score": 0
        }

    return result
