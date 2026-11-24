import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader, BarChart3, Zap, Download } from 'lucide-react'
import { auraApi } from '../api/auraApi'

const ScoreRing = ({ score, size = 120 }) => {
    const r = 46
    const circ = 2 * Math.PI * r
    const dash = (score / 100) * circ
    const color = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)' 
    return (
        <svg width={size} height={size} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
            <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
                strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ * 0.25}
                strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px rgba(0,0,0,0.05))` }} />
            <text x="50" y="46" textAnchor="middle" fill={color} fontSize="20" fontWeight="700" fontFamily="Figtree, sans-serif">{score}</text>
            <text x="50" y="60" textAnchor="middle" fill="var(--text-muted)" fontSize="9">/100</text>
        </svg>
    )
}

const SectionBar = ({ label, score, max }) => {
    const pct = max > 0 ? (score / max) * 100 : 0
    const color = pct >= 75 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)'
    return (
        <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{label}</span>
                <span style={{ color, fontWeight: 600 }}>{score}/{max}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'var(--border-subtle)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: color, transition: 'width 1s ease' }} />
            </div>
        </div>
    )
}

export default function ResumePage() {
    const [mode, setMode] = useState('upload') 
    const [text, setText] = useState('')
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const fileRef = useRef()

    const handleDrop = (e) => {
        e.preventDefault()
        const f = e.dataTransfer.files[0]
        if (!f) return
        if (f.size > 3 * 1024 * 1024) { setError('File is over the 3MB limit. Please upload a smaller file.'); setFile(null); return }
        setFile(f); setError('')
    }

    const analyze = async () => {
        setLoading(true); setError(''); setResult(null)
        try {
            let data
            if (mode === 'paste') {
                if (text.trim().length < 50) { setError('Resume text too short! Please paste your complete resume.'); setLoading(false); return }
                data = await auraApi.analyzeResumeText(text)
            } else {
                if (!file) { setError('Please select or drop a resume file.'); setLoading(false); return }
                data = await auraApi.analyzeResumeFile(file)
            }
            if (data.error) { setError(data.error); } else { setResult(data) }
        } catch (e) {
            setError(e.message || 'Could not reach the server. Check your connection and try again.')
        }
        setLoading(false)
    }

    const atsColor = { High: 'var(--success)', Medium: 'var(--warning)', Low: 'var(--danger)' }

    return (
        <div className="page-enter" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: 860, margin: '0 auto' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                        <div style={{ padding: '0.5rem', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                            <FileText size={22} color="var(--primary)" />
                        </div>
                    </div>
                    <h1 className="logo-text" style={{ fontSize: '2.2rem', display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        Resume <span className="logo-text-ai">Analyzer</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                        AI-powered resume scoring with ATS analysis — get a score out of 100 + actionable improvements
                    </p>
                </div>

                
                <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 4, maxWidth: 380, margin: '0 auto 1.5rem' }}>
                    {['upload', 'paste'].map(m => (
                        <button key={m} onClick={() => setMode(m)}
                            style={{
                                flex: 1, padding: '0.5rem', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Figtree, sans-serif',
                                background: mode === m ? 'var(--primary)' : 'transparent',
                                color: mode === m ? 'white' : 'var(--text-muted)', transition: 'all 0.2s',
                                boxShadow: mode === m ? 'var(--shadow-sm)' : 'none'
                            }}>
                            {m === 'upload' ? 'Upload File' : 'Paste Text'}
                        </button>
                    ))}
                </div>

                
                <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                    {mode === 'upload' ? (
                        <div onDragOver={e => e.preventDefault()} onDrop={handleDrop}
                            onClick={() => fileRef.current.click()}
                            onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    fileRef.current?.click()
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label="Upload resume file"
                            style={{
                                border: `2px dashed ${file ? 'var(--primary)' : 'var(--border-input)'}`,
                                borderRadius: 14, padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer',
                                background: file ? 'var(--bg-secondary)' : 'var(--bg-card)', transition: 'all 0.2s'
                            }}>
                            <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }}
                                onChange={e => {
                                    const f = e.target.files[0]
                                    if (f && f.size > 3 * 1024 * 1024) { setError('File is over the 3MB limit. Please upload a smaller file.'); setFile(null) }
                                    else { setFile(f); setError('') }
                                }} />
                            {file ? (
                                <div>
                                    <CheckCircle size={40} color="var(--success)" style={{ margin: '0 auto 0.75rem' }} />
                                    <p style={{ color: 'var(--success-soft)', fontWeight: 600 }}>{file.name}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            ) : (
                                <div>
                                    <Upload size={40} color="var(--primary)" style={{ margin: '0 auto 0.75rem' }} />
                                    <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>Drag & drop your resume</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>PDF, DOCX, or TXT • Max 3MB</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <textarea value={text} onChange={e => setText(e.target.value)}
                            placeholder="Paste your full resume text here…&#10;&#10;Example:&#10;Name: Alex Kumar&#10;Email: alex@email.com&#10;Skills: Python, React, Machine Learning...&#10;Experience: ..."
                            style={{
                                width: '100%', minHeight: 280, background: 'var(--bg-secondary)', border: '1px solid var(--border-input)',
                                borderRadius: 12, padding: '1rem', color: 'var(--text-primary)', fontSize: '0.88rem', fontFamily: 'Figtree, sans-serif',
                                resize: 'vertical', outline: 'none', lineHeight: 1.6
                            }} />
                    )}

                    {error && (
                        <div style={{
                            display: 'flex', gap: 8, alignItems: 'center', marginTop: '1rem', padding: '0.75rem 1rem',
                            background: 'rgba(224,123,106,0.1)', border: '1px solid rgba(224,123,106,0.35)', borderRadius: 10
                        }}>
                            <AlertCircle size={16} color="#e07b6a" />
                            <p style={{ color: '#eda894', fontSize: '0.85rem' }}>{error}</p>
                        </div>
                    )}

                    <button onClick={analyze} disabled={loading}
                        className="btn-primary" style={{ width: '100%', marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.85rem', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
                        {loading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />Analyzing your resume…</> : <><Zap size={18} />Analyze Resume</>}
                    </button>
                </div>

                
                {result && (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        
                        <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                <ScoreRing score={result.score} size={130} />
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Overall Score</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 220 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                                    <span style={{
                                        padding: '4px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                                        background: `rgba(${result.ats_level === 'High' ? '16, 185, 129' : result.ats_level === 'Medium' ? '245, 158, 11' : '239, 68, 68'},0.1)`,
                                        color: atsColor[result.ats_level] || '#F59E0B',
                                        border: `1px solid ${atsColor[result.ats_level] || '#F59E0B'}`
                                    }}>
                                        ATS: {result.ats_level || 'Medium'}
                                    </span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{result.word_count} words</span>
                                </div>
                                <div>
                                    {result.section_scores && Object.keys(result.section_scores).length > 0 ? (
                                        <>
                                            <SectionBar label="Format & Structure" score={result.section_scores.format || 0} max={20} />
                                            <SectionBar label="Keywords & ATS" score={result.section_scores.keywords || 0} max={25} />
                                            <SectionBar label="Work Experience" score={result.section_scores.experience || 0} max={25} />
                                            <SectionBar label="Skills" score={result.section_scores.skills || 0} max={20} />
                                            <SectionBar label="Education" score={result.section_scores.education || 0} max={10} />
                                        </>
                                    ) : (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>See detailed analysis below for section breakdown.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        
                        <div className="glass-card" style={{ padding: '1.75rem' }}>
                            <h3 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <BarChart3 size={18} /> Detailed Analysis
                            </h3>
                            <div className="markdown-content" style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                                {result.analysis}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    )
}
