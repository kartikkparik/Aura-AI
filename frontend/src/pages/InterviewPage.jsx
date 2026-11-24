import { useState } from 'react'
import { Mic, Send, Trophy, CheckCircle, ChevronRight, Loader, RotateCcw, Target } from 'lucide-react'
import { auraApi } from '../api/auraApi'

const CAREER_FIELDS = [
    'Software Engineer', 'Data Scientist', 'AI/ML Engineer', 'Full Stack Developer',
    'DevOps Engineer', 'Cybersecurity Analyst', 'Product Manager', 'UX Designer',
    'Business Analyst', 'Marketing Manager', 'Finance Analyst', 'HR Manager',
    'Doctor (MBBS)', 'CA (Chartered Accountant)', 'IAS Officer (UPSC)', 'Lawyer',
    'Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer', 'Content Creator',
]

const LEVELS = ['Fresher (0-1 yr)', 'Junior (1-3 yrs)', 'Mid-Level (3-5 yrs)', 'Senior (5+ yrs)']

const ScoreBadge = ({ score }) => {
    const c = score >= 8 ? 'var(--success)' : score >= 6 ? 'var(--warning)' : 'var(--danger)'
    return (
        <span style={{
            padding: '4px 12px', borderRadius: 20, fontWeight: 600, fontSize: '0.8rem',
            background: `rgba(${score >= 8 ? '16, 185, 129' : score >= 6 ? '245, 158, 11' : '239, 68, 68'}, 0.1)`,
            color: c, border: `1px solid ${c}`
        }}>
            {score}/10
        </span>
    )
}

export default function InterviewPage() {
    const [phase, setPhase] = useState('setup') 
    const [role, setRole] = useState('Software Engineer')
    const [level, setLevel] = useState('Fresher (0-1 yr)')
    const [interviewId, setInterviewId] = useState(null)
    const [currentQ, setCurrentQ] = useState('')
    const [qNum, setQNum] = useState(1)
    const [totalQ, setTotalQ] = useState(8)
    const [answer, setAnswer] = useState('')
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState(null)
    const [history, setHistory] = useState([])
    const [summary, setSummary] = useState(null)
    const [error, setError] = useState('')

    const startInterview = async () => {
        setLoading(true); setError('')
        try {
            const data = await auraApi.startInterview(role, level.split(' ')[0])
            setInterviewId(data.interview_id)
            setCurrentQ(data.question || '')
            setQNum(data.question_num || 1)
            setTotalQ(data.total_questions || 8)
            setPhase('interview')
            setHistory([])
            setFeedback(null)
        } catch (err) {
            setError(err.message || 'Could not reach the server. Check your connection and try again.')
        }
        setLoading(false)
    }

    const submitAnswer = async () => {
        if (!answer.trim()) return
        setLoading(true); setError('')
        try {
            const data = await auraApi.submitAnswer(interviewId, answer)
            const entry = { question: currentQ, answer, feedback: data.feedback, score: data.score, qNum }
            setHistory(prev => [...prev, entry])
            setFeedback({ text: data.feedback, score: data.score })
            setAnswer('')

            if (data.completed && data.summary) {
                setSummary(data.summary)
                setPhase('complete')
            } else if (data.question) {
                setCurrentQ(data.question)
                setQNum(data.question_num || (qNum + 1))
                setFeedback(null)
            }
        } catch (err) {
            setError(err.message || 'Answer submit mein error. Try again!')
        }
        setLoading(false)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) submitAnswer()
    }

    const gradeColor = { green: 'var(--success)', blue: 'var(--info)', yellow: 'var(--warning)', red: 'var(--danger)' }

    
    if (phase === 'setup') return (
        <div className="page-enter" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: 560, width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: 'var(--shadow-sm)' }}>
                        <Target size={26} color="var(--primary)" />
                    </div>
                    <h1 className="logo-text" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        Mock <span className="logo-text-ai">Interview</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>AI-powered mock interview for any career field — get scored + feedback</p>
                </div>

                <div className="glass-card" style={{ padding: '1.75rem' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Career Field / Role</label>
                        <select value={role} onChange={e => setRole(e.target.value)}
                            style={{
                                width: '100%', padding: '0.7rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-input)',
                                borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.95rem', fontFamily: 'Figtree, sans-serif', outline: 'none'
                            }}>
                            {CAREER_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <input placeholder="Ya custom field likho: e.g. Graphic Designer, Chef, Pilot..."
                            onKeyDown={e => e.key === 'Enter' && setRole(e.target.value)}
                            onBlur={e => { if (e.target.value) setRole(e.target.value) }}
                            style={{
                                width: '100%', marginTop: '0.5rem', padding: '0.7rem 1rem', background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-input)', borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.9rem',
                                fontFamily: 'Figtree, sans-serif', outline: 'none'
                            }} />
                    </div>

                    <div style={{ marginBottom: '1.75rem' }}>
                        <label style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Experience Level</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {LEVELS.map(l => (
                                <button key={l} onClick={() => setLevel(l)}
                                    style={{
                                        padding: '0.7rem', borderRadius: 10, border: `1px solid ${level === l ? 'var(--primary)' : 'var(--border-input)'}`,
                                        background: level === l ? 'var(--bg-card)' : 'var(--bg-secondary)', color: level === l ? 'var(--primary)' : 'var(--text-muted)',
                                        cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Figtree, sans-serif', fontWeight: level === l ? 600 : 400, transition: 'all 0.2s',
                                        boxShadow: level === l ? 'var(--shadow-sm)' : 'none'
                                    }}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: '0.7rem 1rem', borderRadius: 10, background: 'rgba(224,123,106,0.1)', border: '1px solid rgba(224,123,106,0.35)', marginBottom: '1rem' }}>
                            <p style={{ color: '#eda894', fontSize: '0.85rem' }}>{error}</p>
                        </div>
                    )}

                    <button onClick={startInterview} disabled={loading} className="btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.9rem', fontSize: '1rem' }}>
                        {loading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />Preparing questions...</> : <><ChevronRight size={18} />Start Mock Interview</>}
                    </button>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    
    if (phase === 'interview') return (
        <div className="page-enter" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>🎯 {role} — {level.split(' ')[0]}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>Q{qNum} of {totalQ}</span>
                        <div style={{ width: 100, height: 6, borderRadius: 3, background: 'var(--border-subtle)' }}>
                            <div style={{ width: `${(qNum / totalQ) * 100}%`, height: '100%', borderRadius: 3, background: 'var(--primary)', transition: 'width 0.5s' }} />
                        </div>
                    </div>
                </div>

                
                <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Mic size={18} color="var(--primary)" />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 4 }}>Interviewer</p>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: 1.65, fontWeight: 500 }}>{currentQ}</p>
                        </div>
                    </div>
                </div>

                
                {feedback && (
                    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem', borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>AI Feedback</span>
                            <ScoreBadge score={feedback.score} />
                        </div>
                        <div className="markdown-content" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                            {feedback.text}
                        </div>
                    </div>
                )}

                
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                    {error && (
                        <div style={{ padding: '0.6rem 1rem', borderRadius: 8, background: 'rgba(224,123,106,0.1)', border: '1px solid rgba(224,123,106,0.35)', marginBottom: '0.75rem' }}>
                            <p style={{ color: '#eda894', fontSize: '0.85rem' }}>{error}</p>
                        </div>
                    )}
                    <textarea value={answer} onChange={e => setAnswer(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your answer here… (English or Hindi)&#10;&#10;Tip: press Ctrl+Enter to submit"
                        rows={5} style={{
                            width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-input)',
                            borderRadius: 10, padding: '1rem', color: 'var(--text-primary)', fontSize: '0.95rem', fontFamily: 'Figtree, sans-serif',
                            resize: 'vertical', outline: 'none', lineHeight: 1.6
                        }} />
                    <button onClick={submitAnswer} disabled={loading || !answer.trim()} className="btn-primary"
                        style={{
                            width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.8rem',
                            opacity: (!answer.trim() || loading) ? 0.6 : 1
                        }}>
                        {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />Evaluating...</> : <><Send size={16} />{feedback ? 'Submit & Next Question' : 'Submit Answer'}</>}
                    </button>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    
    if (phase === 'complete' && summary) return (
        <div className="page-enter" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: 620, width: '100%' }}>
                <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                    <Trophy size={52} color="var(--warning)" style={{ margin: '0 auto 1rem', filter: 'drop-shadow(0 0 16px rgba(207,164,78,0.25))' }} />
                    <h2 style={{ color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>Interview Complete!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{role} — {level.split(' ')[0]}</p>

                    <div style={{
                        fontSize: '4rem', fontWeight: 800, fontFamily: 'Figtree, sans-serif', color: gradeColor[summary.grade_color] || '#F59E0B',
                        marginBottom: '0.5rem'
                    }}>
                        {summary.overall_score}%
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: gradeColor[summary.grade_color], marginBottom: '0.3rem' }}>{summary.grade}</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '2rem' }}>{summary.message}</p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: '2rem' }}>
                        {(summary.scores || []).map((s, i) => <ScoreBadge key={i} score={s} />)}
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => { setPhase('setup'); setHistory([]); setFeedback(null) }} className="btn-ghost"
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <RotateCcw size={15} />Try Again
                        </button>
                        <button onClick={() => setPhase('setup')} className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Target size={15} />New Interview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    return null
}
