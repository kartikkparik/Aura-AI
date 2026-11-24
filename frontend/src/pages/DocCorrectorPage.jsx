import { useState, useRef } from 'react'
import { auraApi } from '../api/auraApi'
import {
    FileText, Upload, CheckCircle, AlertCircle, Loader, Wand2,
    Copy, ClipboardCheck, ChevronDown, Download, RotateCcw, Diff
} from 'lucide-react'

const MODES = [
    { id: 'full', label: '✨ Full Correction', desc: 'Grammar + Style + Flow + Tone' },
    { id: 'grammar', label: '📝 Grammar Only', desc: 'Fix spelling & grammar' },
    { id: 'professional', label: '💼 Professional', desc: 'Business-ready tone' },
    { id: 'academic', label: '🎓 Academic', desc: 'Formal academic style' },
]
const DOC_TYPES = [
    { id: 'general', label: 'General' }, { id: 'email', label: 'Email' },
    { id: 'report', label: 'Report' }, { id: 'letter', label: 'Letter' },
    { id: 'essay', label: 'Essay' }, { id: 'resume', label: 'Resume' },
]

const CHANGE_COLORS = { Grammar: '#63b57a', Spelling: '#7fa8c9', Style: '#e8892f', Tone: '#cfa44e', General: '#7d7464' }

const ScoreBar = ({ label, value, max = 100, color }) => {
    const pct = Math.min((value / max) * 100, 100)
    return (
        <div style={{ marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 3 }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
                <span style={{ color, fontWeight: 700 }}>{value}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'var(--border-subtle)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: color, transition: 'width 1s ease' }} />
            </div>
        </div>
    )
}

export default function DocCorrectorPage() {
    const [inputMode, setInputMode] = useState('paste')   
    const [text, setText] = useState('')
    const [file, setFile] = useState(null)
    const [correctionMode, setCorrectionMode] = useState('full')
    const [docType, setDocType] = useState('general')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)
    const [showDiff, setShowDiff] = useState(false)
    const fileRef = useRef()

    const handleDrop = (e) => {
        e.preventDefault()
        const f = e.dataTransfer.files[0]
        if (!f) return
        if (f.size > 3 * 1024 * 1024) { setError('File is over the 3MB limit. Please upload a smaller file.'); setFile(null); return }
        setFile(f); setError('')
    }

    const correct = async () => {
        setLoading(true); setError(''); setResult(null)
        try {
            let data
            if (inputMode === 'paste') {
                if (text.trim().length < 10) { setError('Document text too short!'); setLoading(false); return }
                data = await auraApi.correctDocumentText(text, correctionMode, docType)
            } else {
                if (!file) { setError('Please select a file.'); setLoading(false); return }
                data = await auraApi.correctDocumentFile(file, correctionMode, docType)
            }
            if (data.error && !data.corrected_text) { setError(data.error) }
            else { setResult(data) }
        } catch (e) { setError(e.message || 'Could not reach the server. Check your connection and try again.') }
        setLoading(false)
    }

    const copyResult = () => {
        if (result?.corrected_text) {
            navigator.clipboard.writeText(result.corrected_text)
            setCopied(true); setTimeout(() => setCopied(false), 2000)
        }
    }

    const downloadTxt = () => {
        if (!result?.corrected_text) return
        const blob = new Blob([result.corrected_text], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'corrected_document.txt'; a.click()
        URL.revokeObjectURL(url)
    }

    const improvementColor = (score) => score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)'

    return (
        <div className="page-enter" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: 920, margin: '0 auto' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: '0.6rem' }}>
                        <div style={{ padding: '0.5rem', borderRadius: 12, background: 'var(--primary)', boxShadow: '0 4px 20px rgba(232,137,47,0.35)' }}>
                            <Wand2 size={22} color="white" />
                        </div>
                    </div>
                    <h1 className="logo-text" style={{ fontSize: '2.2rem', display: 'block', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                        Document <span className="logo-text-ai">Corrector</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        AI-powered grammar, style & tone correction — paste text or upload a file
                    </p>
                </div>

                
                <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 4, maxWidth: 340, margin: '0 auto 1.5rem' }}>
                    {[['paste', 'Paste Text'], ['upload', 'Upload File']].map(([m, lbl]) => (
                        <button key={m} onClick={() => setInputMode(m)} style={{
                            flex: 1, padding: '0.5rem', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', fontFamily: 'Figtree, sans-serif',
                            background: inputMode === m ? 'var(--primary)' : 'transparent',
                            color: inputMode === m ? 'var(--primary-ink)' : 'var(--text-muted)', transition: 'all 0.2s',
                        }}>{lbl}</button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 220px', gap: '1.25rem', alignItems: 'start' }}>
                    
                    <div className="glass-card" style={{ padding: '1.75rem' }}>
                        
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Correction Mode</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 8 }}>
                                {MODES.map(m => (
                                    <button key={m.id} onClick={() => setCorrectionMode(m.id)} style={{
                                        padding: '0.55rem 0.6rem', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                                        border: correctionMode === m.id ? '1.5px solid #10B981' : '1px solid var(--border-subtle)',
                                        background: correctionMode === m.id ? 'rgba(16,185,129,0.08)' : 'var(--bg-secondary)',
                                        transition: 'all 0.2s'
                                    }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-primary)' }}>{m.label}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        
                        {inputMode === 'paste' ? (
                            <textarea value={text} onChange={e => setText(e.target.value)}
                                placeholder="Paste your document here...\n\nExample:\nDear Sir,\nI am writing to apply for the position of Software Engineer. I have 2 years of experience in Python and Java...\n\nAI will fix grammar, style, and tone."
                                style={{
                                    width: '100%', minHeight: 240, background: 'var(--bg-secondary)', border: '1px solid var(--border-input)',
                                    borderRadius: 12, padding: '1rem', color: 'var(--text-primary)', fontSize: '0.88rem',
                                    fontFamily: 'Figtree, sans-serif', resize: 'vertical', outline: 'none', lineHeight: 1.7, boxSizing: 'border-box'
                                }} />
                        ) : (
                            <div onDragOver={e => e.preventDefault()} onDrop={handleDrop}
                                onClick={() => fileRef.current.click()}
                                style={{
                                    border: `2px dashed ${file ? '#10B981' : 'var(--border-input)'}`, borderRadius: 14,
                                    padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer',
                                    background: file ? 'var(--bg-secondary)' : 'var(--bg-card)', transition: 'all 0.2s', minHeight: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                }}>
                                <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }}
                                    onChange={e => { setFile(e.target.files[0]); setError('') }} />
                                {file ? (
                                    <div>
                                        <CheckCircle size={40} color="#10B981" style={{ margin: '0 auto 0.75rem' }} />
                                        <p style={{ color: '#10B981', fontWeight: 600 }}>{file.name}</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                ) : (
                                    <div>
                                        <Upload size={40} color="#10B981" style={{ margin: '0 auto 0.75rem' }} />
                                        <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>Drag & drop your document</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>PDF, DOCX, or TXT • Max 3MB</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {error && (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(224,123,106,0.1)', border: '1px solid rgba(224,123,106,0.35)', borderRadius: 10 }}>
                                <AlertCircle size={16} color="#EF4444" />
                                <p style={{ color: '#DC2626', fontSize: '0.85rem' }}>{error}</p>
                            </div>
                        )}

                        <button onClick={correct} disabled={loading}
                            className="btn-primary" style={{ width: '100%', marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.85rem', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
                            {loading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />Correcting your document…</> : <><Wand2 size={18} />Correct Document</>}
                        </button>
                    </div>

                    
                    <div>
                        <div className="glass-card" style={{ padding: '1.25rem' }}>
                            <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <FileText size={15} color="var(--primary)" />Document Type
                            </h3>
                            {DOC_TYPES.map(dt => (
                                <button key={dt.id} onClick={() => setDocType(dt.id)} style={{
                                    width: '100%', marginBottom: 6, padding: '0.5rem 0.85rem', borderRadius: 9, cursor: 'pointer', textAlign: 'left',
                                    border: docType === dt.id ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                                    background: docType === dt.id ? 'var(--bg-secondary)' : 'transparent',
                                    color: docType === dt.id ? 'var(--primary)' : 'var(--text-secondary)',
                                    fontWeight: docType === dt.id ? 700 : 500, fontSize: '0.83rem', transition: 'all 0.15s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    {dt.label}
                                    {docType === dt.id && <CheckCircle size={13} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                
                {result && (
                    <div style={{ marginTop: '1.75rem', animation: 'fadeIn 0.5s ease' }}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                            
                            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: improvementColor(result.improvement_score || 80) }}>
                                    {result.improvement_score || 80}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Quality Score</div>
                                <ScoreBar label="" value={result.improvement_score || 80} color={improvementColor(result.improvement_score || 80)} />
                            </div>

                            
                            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3B82F6' }}>
                                    {result.error_count || result.changes_summary?.reduce((s, c) => s + (c.count || 0), 0) || 0}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Issues Fixed</div>
                            </div>

                            
                            <div className="glass-card" style={{ padding: '1.25rem' }}>
                                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Changes Breakdown</h4>
                                {result.changes_summary?.map((ch, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.78rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: CHANGE_COLORS[ch.type] || '#6B7280', flexShrink: 0, display: 'inline-block' }} />
                                            <span style={{ color: 'var(--text-secondary)' }}>{ch.type}</span>
                                        </span>
                                        <span style={{ fontWeight: 700, color: CHANGE_COLORS[ch.type] || '#6B7280' }}>{ch.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        
                        {result.key_improvements?.length > 0 && (
                            <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
                                <h3 style={{ color: '#10B981', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    ✅ Key Improvements Made
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {result.key_improvements.map((imp, i) => (
                                        <span key={i} style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', fontSize: '0.8rem', fontWeight: 500 }}>
                                            {imp}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        
                        <div className="glass-card" style={{ padding: '1.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
                                <h3 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                                    <Wand2 size={17} />Corrected Document
                                </h3>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {inputMode === 'paste' && (
                                        <button onClick={() => setShowDiff(!showDiff)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.45rem 0.85rem', borderRadius: 9, border: '1px solid var(--border-subtle)', background: showDiff ? 'var(--primary)' : 'var(--bg-secondary)', color: showDiff ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' }}>
                                            <Diff size={13} />Diff View
                                        </button>
                                    )}
                                    <button onClick={copyResult} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.45rem 0.85rem', borderRadius: 9, border: '1px solid var(--border-subtle)', background: copied ? '#10B981' : 'var(--bg-secondary)', color: copied ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem', transition: 'all 0.2s' }}>
                                        {copied ? <ClipboardCheck size={13} /> : <Copy size={13} />}{copied ? 'Copied!' : 'Copy'}
                                    </button>
                                    <button onClick={downloadTxt} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.45rem 0.85rem', borderRadius: 9, border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' }}>
                                        <Download size={13} />Download
                                    </button>
                                    <button onClick={() => { setText(''); setFile(null); setResult(null); setError('') }}
                                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.45rem 0.85rem', borderRadius: 9, border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' }}>
                                        <RotateCcw size={13} />New
                                    </button>
                                </div>
                            </div>

                            {showDiff && inputMode === 'paste' ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#EF4444', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>Original</div>
                                        <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7, padding: '1rem', background: 'rgba(239,68,68,0.04)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.15)', minHeight: 200 }}>
                                            {text}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>Corrected</div>
                                        <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', fontSize: '0.85rem', lineHeight: 1.7, padding: '1rem', background: 'rgba(16,185,129,0.04)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.15)', minHeight: 200 }}>
                                            {result.corrected_text}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.8, padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                                    {result.corrected_text}
                                </div>
                            )}

                            
                            {result.writing_tips?.length > 0 && (
                                <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(232,137,47,0.06)', borderRadius: 10, border: '1px solid rgba(232,137,47,0.2)' }}>
                                    <h4 style={{ color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem' }}>Writing Tips</h4>
                                    {result.writing_tips.map((tip, i) => (
                                        <p key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.3rem 0' }}>• {tip}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    )
}
