const API_ROOT = (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '')
const BASE = API_ROOT ? `${API_ROOT}/api` : '/api'
const TIMEOUT_MS = 45000

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt']
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024 // 3MB limit

async function call(path, options = {}) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    }

    try {
        const res = await fetch(BASE + path, {
            ...options,
            headers,
            signal: controller.signal,
        })
        clearTimeout(timer)

        if (!res.ok) {
            let errMsg = `Server error (${res.status})`
            try {
                const e = await res.json()
                errMsg = e.error || e.message || errMsg
            } catch (_) {}
            throw new Error(errMsg)
        }
        return res.json()
    } catch (err) {
        clearTimeout(timer)
        if (err.name === 'AbortError') throw new Error('Request timed out. Please retry in a few moments.')
        throw err
    }
}

function validateFile(file) {
    if (!file) throw new Error('No file selected.')
    if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error('File exceeds the 3MB maximum size limit. Please upload a smaller document.')
    }
    const name = file.name.toLowerCase()
    const hasValidExt = ALLOWED_EXTENSIONS.some(ext => name.endsWith(ext))
    if (!hasValidExt) {
        throw new Error('Unsupported file format. Please upload a PDF, DOCX, or TXT file.')
    }
}

export const auraApi = {
    newSession: () => call('/session/new', { method: 'POST' }),

    sendMessage: (sessionId, message, chatHistory = [], sessionData = {}) => call('/chat', {
        method: 'POST',
        body: JSON.stringify({
            session_id: sessionId,
            message,
            chat_history: chatHistory.slice(-10),
            session_data: sessionData
        }),
    }),

    analyzeResumeText: (text) => call('/resume/analyze', {
        method: 'POST',
        body: JSON.stringify({ text }),
    }),

    analyzeResumeFile: async (file) => {
        validateFile(file)
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch(BASE + '/resume/analyze', {
                method: 'POST',
                body: formData,
                signal: controller.signal,
            })
            clearTimeout(timer)
            if (!res.ok) {
                let errMsg = `Server error (${res.status})`
                try { const e = await res.json(); errMsg = e.error || errMsg } catch (_) {}
                throw new Error(errMsg)
            }
            return res.json()
        } catch (err) {
            clearTimeout(timer)
            if (err.name === 'AbortError') throw new Error('File upload timed out.')
            throw err
        }
    },

    buildResume: (data) => call('/resume/build', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    correctDocumentText: (text, correction_mode = 'full', doc_type = 'general') => call('/document/correct', {
        method: 'POST',
        body: JSON.stringify({ text, correction_mode, doc_type }),
    }),

    correctDocumentFile: async (file, correction_mode = 'full', doc_type = 'general') => {
        validateFile(file)
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('correction_mode', correction_mode)
            formData.append('doc_type', doc_type)
            const res = await fetch(BASE + '/document/correct', {
                method: 'POST',
                body: formData,
                signal: controller.signal,
            })
            clearTimeout(timer)
            if (!res.ok) {
                let errMsg = `Server error (${res.status})`
                try { const e = await res.json(); errMsg = e.error || errMsg } catch (_) {}
                throw new Error(errMsg)
            }
            return res.json()
        } catch (err) {
            clearTimeout(timer)
            if (err.name === 'AbortError') throw new Error('File upload timed out.')
            throw err
        }
    },

    startInterview: (role, level) => call('/interview/start', {
        method: 'POST',
        body: JSON.stringify({ role, level }),
    }),

    submitAnswer: (interviewId, answer) => call('/interview/answer', {
        method: 'POST',
        body: JSON.stringify({ interview_id: interviewId, answer }),
    }),

    getCareers: () => call('/careers'),

    getRoadmap: (careerId, semester, skills) => call('/roadmap', {
        method: 'POST',
        body: JSON.stringify({ career_role: careerId, current_semester: semester, known_skills: skills }),
    }),

    getRecommendations: (role, semester, skills) => call('/recommendations', {
        method: 'POST',
        body: JSON.stringify({ career_role: role, current_semester: semester, missing_skills: skills }),
    }),

    getSkillGap: (userSkills, targetRole) => call('/skill-gap', {
        method: 'POST',
        body: JSON.stringify({ user_skills: userSkills, target_role: targetRole }),
    }),

    healthCheck: () => call('/health'),
}
