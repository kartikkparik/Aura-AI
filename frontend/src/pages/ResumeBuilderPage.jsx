import { useState, useRef } from 'react'
import { auraApi } from '../api/auraApi'
import {
    User, Mail, Phone, MapPin, Linkedin, Github, Globe,
    Briefcase, GraduationCap, Code2, FolderOpen, Award,
    Plus, Trash2, ChevronRight, ChevronLeft, Loader, Download,
    Sparkles, Target, CheckCircle, RefreshCw, Copy, ClipboardCheck
} from 'lucide-react'



const uid = () => Math.random().toString(36).slice(2, 9)

const emptyExp = () => ({ id: uid(), company: '', role: '', start: '', end: '', description: '' })
const emptyEdu = () => ({ id: uid(), institution: '', degree: '', field: '', year: '', gpa: '' })
const emptyProj = () => ({ id: uid(), name: '', description: '', tech_stack: '', link: '' })
const emptyCert = () => ({ id: uid(), name: '', issuer: '', year: '' })

const STEPS = [
    { icon: User, label: 'Personal', color: '#e8892f' },
    { icon: Briefcase, label: 'Experience', color: '#7fa8c9' },
    { icon: GraduationCap, label: 'Education', color: '#63b57a' },
    { icon: Code2, label: 'Skills', color: '#cfa44e' },
    { icon: FolderOpen, label: 'Projects', color: '#e07b6a' },
    { icon: Target, label: 'Finalize', color: '#d96c3f' },
]

const TEMPLATES = [
    { id: 'modern', label: '🚀 Modern', desc: 'Clean & contemporary' },
    { id: 'classic', label: '📋 Classic', desc: 'Traditional & formal' },
    { id: 'minimal', label: '⬜ Minimal', desc: 'Simple & elegant' },
    { id: 'creative', label: '🎨 Creative', desc: 'Bold & expressive' },
]



const StepIndicator = ({ current, steps }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '2.5rem', overflowX: 'auto', padding: '0 0.5rem' }}>
        {steps.map((s, i) => {
            const Icon = s.icon
            const done = i < current
            const active = i === current
            return (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                            width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: done ? s.color : active ? `${s.color}22` : 'var(--bg-secondary)',
                            border: `2px solid ${done || active ? s.color : 'var(--border-subtle)'}`,
                            transition: 'all 0.3s', boxShadow: active ? `0 0 16px ${s.color}44` : 'none'
                        }}>
                            {done ? <CheckCircle size={18} color="white" /> : <Icon size={17} color={active ? s.color : 'var(--text-muted)'} />}
                        </div>
                        <span style={{ fontSize: '0.68rem', color: active ? s.color : done ? 'var(--text-secondary)' : 'var(--text-muted)', fontWeight: active ? 700 : 500 }}>{s.label}</span>
                    </div>
                    {i < steps.length - 1 && (
                        <div style={{ width: 32, height: 2, background: i < current ? steps[i].color : 'var(--border-subtle)', marginBottom: 16, transition: 'background 0.3s', flexShrink: 0 }} />
                    )}
                </div>
            )
        })}
    </div>
)

const Field = ({ label, icon: Icon, children, required }) => (
    <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            {Icon && <Icon size={13} color="var(--primary)" />}{label}{required && <span style={{ color: '#EF4444' }}>*</span>}
        </label>
        {children}
    </div>
)

const inp = {
    width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-input)',
    borderRadius: 10, padding: '0.6rem 0.85rem', color: 'var(--text-primary)', fontSize: '0.88rem',
    fontFamily: 'Figtree, sans-serif', outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s'
}

const SectionCard = ({ title, icon: Icon, color, children, onAdd, addLabel }) => (
    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color, fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                <Icon size={18} />{title}
            </h3>
            {onAdd && (
                <button onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.4rem 0.85rem', borderRadius: 8, border: `1px solid ${color}44`, background: `${color}11`, color, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                    <Plus size={13} />{addLabel || 'Add'}
                </button>
            )}
        </div>
        {children}
    </div>
)



const ResumePreview = ({ data, aiResult, template }) => {
    const { personal = {}, experience = [], education = [], skills = [], projects = [], certifications = [] } = data
    const colors = { modern: '#e8892f', classic: '#1E3A5F', minimal: '#374151', creative: '#d96c3f' }
    const accent = colors[template] || colors.modern

    const summary = aiResult?.professional_summary || ''
    const expBullets = aiResult?.experience_bullets || {}
    const skillsOrg = aiResult?.skills_organized || {}

    
    const displaySkills = Object.keys(skillsOrg).length > 0
        ? Object.entries(skillsOrg)
        : skills.length > 0 ? [['Skills', skills]] : []

    return (
        <div style={{
            background: 'white', color: '#1a1a1a', fontFamily: "'Georgia', serif",
            padding: '2.5rem', maxWidth: 750, margin: '0 auto', boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
            borderRadius: 4, fontSize: '0.85rem', lineHeight: 1.5
        }}>
            
            <div style={{ borderBottom: `3px solid ${accent}`, paddingBottom: '1.2rem', marginBottom: '1.2rem' }}>
                <h1 style={{ fontSize: '1.9rem', fontWeight: 700, color: '#111', margin: '0 0 0.3rem', fontFamily: 'Figtree, sans-serif', letterSpacing: '-0.5px' }}>
                    {personal.name || 'Your Name'}
                </h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.78rem', color: '#555', fontFamily: 'Figtree, sans-serif' }}>
                    {personal.email && <span>✉ {personal.email}</span>}
                    {personal.phone && <span>📞 {personal.phone}</span>}
                    {personal.location && <span>📍 {personal.location}</span>}
                    {personal.linkedin && <span>🔗 {personal.linkedin}</span>}
                    {personal.github && <span>💻 {personal.github}</span>}
                    {personal.website && <span>🌐 {personal.website}</span>}
                </div>
            </div>

            
            {summary && (
                <div style={{ marginBottom: '1.2rem' }}>
                    <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: accent, borderBottom: `1px solid ${accent}33`, paddingBottom: 4, marginBottom: '0.6rem', fontFamily: 'Figtree, sans-serif' }}>Professional Summary</h2>
                    <p style={{ color: '#333', margin: 0, lineHeight: 1.6 }}>{summary}</p>
                </div>
            )}

            
            {experience.length > 0 && (
                <div style={{ marginBottom: '1.2rem' }}>
                    <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: accent, borderBottom: `1px solid ${accent}33`, paddingBottom: 4, marginBottom: '0.8rem', fontFamily: 'Figtree, sans-serif' }}>Work Experience</h2>
                    {experience.map((exp, i) => {
                        const key = `${exp.company}_${exp.role}`.replace(/\s+/g, '_').toLowerCase()
                        const bullets = expBullets[key] || expBullets[Object.keys(expBullets)[i]] || []
                        return (
                            <div key={exp.id} style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#111', fontFamily: 'Figtree, sans-serif', fontSize: '0.9rem' }}>{exp.role || 'Job Title'}</div>
                                        <div style={{ color: accent, fontWeight: 600, fontSize: '0.82rem', fontFamily: 'Figtree, sans-serif' }}>{exp.company || 'Company'}</div>
                                    </div>
                                    <div style={{ color: '#777', fontSize: '0.78rem', fontFamily: 'Figtree, sans-serif', whiteSpace: 'nowrap' }}>
                                        {exp.start} {exp.end ? `— ${exp.end}` : '— Present'}
                                    </div>
                                </div>
                                {bullets.length > 0 ? (
                                    <ul style={{ margin: '0.4rem 0 0 1.2rem', padding: 0 }}>
                                        {bullets.map((b, bi) => <li key={bi} style={{ color: '#444', marginBottom: 3 }}>{b}</li>)}
                                    </ul>
                                ) : exp.description ? (
                                    <p style={{ margin: '0.4rem 0 0', color: '#444' }}>{exp.description}</p>
                                ) : null}
                            </div>
                        )
                    })}
                </div>
            )}

            
            {education.length > 0 && (
                <div style={{ marginBottom: '1.2rem' }}>
                    <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: accent, borderBottom: `1px solid ${accent}33`, paddingBottom: 4, marginBottom: '0.8rem', fontFamily: 'Figtree, sans-serif' }}>Education</h2>
                    {education.map(edu => (
                        <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontFamily: 'Figtree, sans-serif', fontSize: '0.88rem' }}>{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                                <div style={{ color: '#555', fontSize: '0.82rem' }}>{edu.institution}</div>
                                {edu.gpa && <div style={{ color: '#777', fontSize: '0.78rem' }}>GPA: {edu.gpa}</div>}
                            </div>
                            <div style={{ color: '#777', fontSize: '0.78rem', fontFamily: 'Figtree, sans-serif' }}>{edu.year}</div>
                        </div>
                    ))}
                </div>
            )}

            
            {displaySkills.length > 0 && (
                <div style={{ marginBottom: '1.2rem' }}>
                    <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: accent, borderBottom: `1px solid ${accent}33`, paddingBottom: 4, marginBottom: '0.8rem', fontFamily: 'Figtree, sans-serif' }}>Skills</h2>
                    {displaySkills.map(([cat, skillList], i) => (
                        <div key={i} style={{ marginBottom: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontFamily: 'Figtree, sans-serif', fontSize: '0.8rem', minWidth: 90 }}>{cat}:</span>
                            <span style={{ color: '#444' }}>{Array.isArray(skillList) ? skillList.join(' • ') : skillList}</span>
                        </div>
                    ))}
                </div>
            )}

            
            {projects.length > 0 && (
                <div style={{ marginBottom: '1.2rem' }}>
                    <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: accent, borderBottom: `1px solid ${accent}33`, paddingBottom: 4, marginBottom: '0.8rem', fontFamily: 'Figtree, sans-serif' }}>Projects</h2>
                    {projects.map(proj => (
                        <div key={proj.id} style={{ marginBottom: '0.8rem' }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, fontFamily: 'Figtree, sans-serif', fontSize: '0.88rem' }}>{proj.name}</span>
                                {proj.tech_stack && <span style={{ fontSize: '0.75rem', color: accent, background: `${accent}11`, padding: '1px 8px', borderRadius: 20, fontFamily: 'Figtree, sans-serif' }}>{proj.tech_stack}</span>}
                            </div>
                            {proj.description && <p style={{ margin: '0.3rem 0 0', color: '#444', fontSize: '0.83rem' }}>{proj.description}</p>}
                        </div>
                    ))}
                </div>
            )}

            
            {certifications.length > 0 && (
                <div>
                    <h2 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: accent, borderBottom: `1px solid ${accent}33`, paddingBottom: 4, marginBottom: '0.8rem', fontFamily: 'Figtree, sans-serif' }}>Certifications</h2>
                    {certifications.map(cert => (
                        <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <div>
                                <span style={{ fontWeight: 600, fontFamily: 'Figtree, sans-serif', fontSize: '0.85rem' }}>{cert.name}</span>
                                {cert.issuer && <span style={{ color: '#666', fontSize: '0.8rem' }}> — {cert.issuer}</span>}
                            </div>
                            {cert.year && <span style={{ color: '#777', fontSize: '0.78rem' }}>{cert.year}</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}



export default function ResumeBuilderPage() {
    const [step, setStep] = useState(0)
    const [template, setTemplate] = useState('modern')
    const [loading, setLoading] = useState(false)
    const [aiResult, setAiResult] = useState(null)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)
    const previewRef = useRef()

    
    const [personal, setPersonal] = useState({ name: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '' })
    const [summaryPrompt, setSummaryPrompt] = useState('')
    const [targetRole, setTargetRole] = useState('')
    const [experience, setExperience] = useState([emptyExp()])
    const [education, setEducation] = useState([emptyEdu()])
    const [skillInput, setSkillInput] = useState('')
    const [skills, setSkills] = useState([])
    const [projects, setProjects] = useState([])
    const [certifications, setCertifications] = useState([])

    const updateArr = (setter, id, field, val) => setter(a => a.map(i => i.id === id ? { ...i, [field]: val } : i))
    const removeFromArr = (setter, id) => setter(a => a.filter(i => i.id !== id))

    const addSkill = () => {
        const s = skillInput.trim()
        if (s && !skills.includes(s)) { setSkills(prev => [...prev, s]); setSkillInput('') }
    }
    const removeSkill = (sk) => setSkills(s => s.filter(x => x !== sk))

    const generateResume = async () => {
        setLoading(true); setError(''); setAiResult(null)
        try {
            const payload = {
                personal, summary_prompt: summaryPrompt, target_role: targetRole || 'Professional',
                experience: experience.filter(e => e.company || e.role),
                education: education.filter(e => e.institution || e.degree),
                skills, projects: projects.filter(p => p.name), certifications: certifications.filter(c => c.name),
                template
            }
            const result = await auraApi.buildResume(payload)
            if (result.error && !result.professional_summary) { setError(result.error); setLoading(false); return }
            setAiResult(result)
            setStep(5) 
        } catch (e) { setError(e.message || 'Could not reach the server. Check your connection and try again.') }
        setLoading(false)
    }

    const copyText = () => {
        const el = previewRef.current
        if (el) {
            const text = el.innerText
            navigator.clipboard.writeText(text)
            setCopied(true); setTimeout(() => setCopied(false), 2000)
        }
    }

    const printResume = () => {
        const printContent = previewRef.current?.innerHTML
        if (!printContent) return
        const win = window.open('', '_blank')
        win.document.write(`<!DOCTYPE html><html><head><title>Resume - ${personal.name}</title>
        <style>body{margin:0;padding:0;} @media print{body{margin:0;}}</style>
        </head><body>${printContent}</body></html>`)
        win.document.close(); win.focus(); win.print()
    }

    const data = { personal, experience, education, skills, projects, certifications }

    
    const canPrev = step > 0
    const canNext = step < 4

    return (
        <div className="page-enter" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: step === 5 ? 900 : 780, margin: '0 auto' }}>
                
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: '0.6rem' }}>
                        <div style={{ padding: '0.5rem', borderRadius: 12, background: 'var(--primary)', boxShadow: '0 4px 20px rgba(232,137,47,0.35)' }}>
                            <Sparkles size={22} color="white" />
                        </div>
                    </div>
                    <h1 className="logo-text" style={{ fontSize: '2.2rem', display: 'block', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                        Resume <span className="logo-text-ai">Builder</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        AI-powered • ATS-optimized • Professional templates
                    </p>
                </div>

                <StepIndicator current={step} steps={STEPS} />

                
                {step === 0 && (
                    <SectionCard title="Personal Information" icon={User} color="#e8892f">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0 1.5rem' }}>
                            <Field label="Full Name" icon={User} required>
                                <input style={inp} placeholder="e.g. Kartik Pareek" value={personal.name} onChange={e => setPersonal(p => ({ ...p, name: e.target.value }))} />
                            </Field>
                            <Field label="Email" icon={Mail} required>
                                <input style={inp} type="email" placeholder="kartik@email.com" value={personal.email} onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))} />
                            </Field>
                            <Field label="Phone" icon={Phone}>
                                <input style={inp} placeholder="+91 98765 43210" value={personal.phone} onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))} />
                            </Field>
                            <Field label="Location" icon={MapPin}>
                                <input style={inp} placeholder="Jaipur, Rajasthan" value={personal.location} onChange={e => setPersonal(p => ({ ...p, location: e.target.value }))} />
                            </Field>
                            <Field label="LinkedIn URL" icon={Linkedin}>
                                <input style={inp} placeholder="linkedin.com/in/username" value={personal.linkedin} onChange={e => setPersonal(p => ({ ...p, linkedin: e.target.value }))} />
                            </Field>
                            <Field label="GitHub URL" icon={Github}>
                                <input style={inp} placeholder="github.com/username" value={personal.github} onChange={e => setPersonal(p => ({ ...p, github: e.target.value }))} />
                            </Field>
                            <Field label="Portfolio Website" icon={Globe}>
                                <input style={inp} placeholder="yourportfolio.com" value={personal.website} onChange={e => setPersonal(p => ({ ...p, website: e.target.value }))} />
                            </Field>
                        </div>
                    </SectionCard>
                )}

                
                {step === 1 && (
                    <SectionCard title="Work Experience" icon={Briefcase} color="#7fa8c9" onAdd={() => setExperience(e => [...e, emptyExp()])} addLabel="Add Job">
                        {experience.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: '1.5rem 0' }}>
                                No experience? No problem! Fresher-friendly resume will be generated. 🎓
                            </p>
                        )}
                        {experience.map((exp, i) => (
                            <div key={exp.id} style={{ padding: '1rem', borderRadius: 10, background: 'var(--bg-secondary)', marginBottom: '1rem', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ fontWeight: 700, color: '#3B82F6', fontSize: '0.88rem' }}>Job #{i + 1}</span>
                                    {experience.length > 1 && (
                                        <button onClick={() => removeFromArr(setExperience, exp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={15} /></button>
                                    )}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 1rem' }}>
                                    <Field label="Company"><input style={inp} placeholder="Google Inc." value={exp.company} onChange={e => updateArr(setExperience, exp.id, 'company', e.target.value)} /></Field>
                                    <Field label="Job Title"><input style={inp} placeholder="Software Engineer" value={exp.role} onChange={e => updateArr(setExperience, exp.id, 'role', e.target.value)} /></Field>
                                    <Field label="Start Date"><input style={inp} placeholder="Jan 2023" value={exp.start} onChange={e => updateArr(setExperience, exp.id, 'start', e.target.value)} /></Field>
                                    <Field label="End Date"><input style={inp} placeholder="Present" value={exp.end} onChange={e => updateArr(setExperience, exp.id, 'end', e.target.value)} /></Field>
                                </div>
                                <Field label="Description (AI will enhance this)">
                                    <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} placeholder="Describe your responsibilities and achievements. AI will transform these into powerful bullet points!" value={exp.description} onChange={e => updateArr(setExperience, exp.id, 'description', e.target.value)} />
                                </Field>
                            </div>
                        ))}
                    </SectionCard>
                )}

                
                {step === 2 && (
                    <SectionCard title="Education" icon={GraduationCap} color="#63b57a" onAdd={() => setEducation(e => [...e, emptyEdu()])} addLabel="Add Degree">
                        {education.map((edu, i) => (
                            <div key={edu.id} style={{ padding: '1rem', borderRadius: 10, background: 'var(--bg-secondary)', marginBottom: '1rem', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ fontWeight: 700, color: '#10B981', fontSize: '0.88rem' }}>Degree #{i + 1}</span>
                                    {education.length > 1 && <button onClick={() => removeFromArr(setEducation, edu.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={15} /></button>}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 1rem' }}>
                                    <Field label="Institution"><input style={inp} placeholder="IIT Delhi / RTU Kota" value={edu.institution} onChange={e => updateArr(setEducation, edu.id, 'institution', e.target.value)} /></Field>
                                    <Field label="Degree"><input style={inp} placeholder="B.Tech / MBA / BCA" value={edu.degree} onChange={e => updateArr(setEducation, edu.id, 'degree', e.target.value)} /></Field>
                                    <Field label="Field of Study"><input style={inp} placeholder="Computer Science" value={edu.field} onChange={e => updateArr(setEducation, edu.id, 'field', e.target.value)} /></Field>
                                    <Field label="Year of Graduation"><input style={inp} placeholder="2025" value={edu.year} onChange={e => updateArr(setEducation, edu.id, 'year', e.target.value)} /></Field>
                                    <Field label="CGPA / Percentage"><input style={inp} placeholder="8.5 / 85%" value={edu.gpa} onChange={e => updateArr(setEducation, edu.id, 'gpa', e.target.value)} /></Field>
                                </div>
                            </div>
                        ))}
                    </SectionCard>
                )}

                
                {step === 3 && (
                    <div>
                        <SectionCard title="Skills" icon={Code2} color="#cfa44e">
                            <div style={{ display: 'flex', gap: 8, marginBottom: '0.75rem' }}>
                                <input style={{ ...inp, flex: 1 }} placeholder="Type a skill and press Enter (e.g. Python, React, SQL...)" value={skillInput}
                                    onChange={e => setSkillInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addSkill()} />
                                <button onClick={addSkill} style={{ padding: '0.6rem 1rem', borderRadius: 10, background: '#F59E0B', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}><Plus size={16} /></button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {skills.map(sk => (
                                    <span key={sk} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 20, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#D97706', fontSize: '0.82rem', fontWeight: 600 }}>
                                        {sk}
                                        <button onClick={() => removeSkill(sk)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D97706', padding: 0, display: 'flex' }}><Trash2 size={11} /></button>
                                    </span>
                                ))}
                                {skills.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Add your technical and soft skills above.</p>}
                            </div>
                        </SectionCard>

                        <SectionCard title="Projects" icon={FolderOpen} color="#e07b6a" onAdd={() => setProjects(p => [...p, emptyProj()])} addLabel="Add Project">
                            {projects.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '0.75rem 0' }}>Projects make your resume stand out! Add your best work. 🚀</p>}
                            {projects.map((proj, i) => (
                                <div key={proj.id} style={{ padding: '1rem', borderRadius: 10, background: 'var(--bg-secondary)', marginBottom: '0.75rem', border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                        <span style={{ fontWeight: 700, color: '#EF4444', fontSize: '0.85rem' }}>Project #{i + 1}</span>
                                        <button onClick={() => removeFromArr(setProjects, proj.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={15} /></button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 1rem' }}>
                                        <Field label="Project Name"><input style={inp} placeholder="E-commerce App" value={proj.name} onChange={e => updateArr(setProjects, proj.id, 'name', e.target.value)} /></Field>
                                        <Field label="Tech Stack"><input style={inp} placeholder="React, Node.js, MongoDB" value={proj.tech_stack} onChange={e => updateArr(setProjects, proj.id, 'tech_stack', e.target.value)} /></Field>
                                        <Field label="GitHub/Live Link"><input style={inp} placeholder="github.com/..." value={proj.link} onChange={e => updateArr(setProjects, proj.id, 'link', e.target.value)} /></Field>
                                    </div>
                                    <Field label="Description">
                                        <textarea style={{ ...inp, minHeight: 60, resize: 'vertical' }} placeholder="What did this project do? What problem it solved?" value={proj.description} onChange={e => updateArr(setProjects, proj.id, 'description', e.target.value)} />
                                    </Field>
                                </div>
                            ))}
                        </SectionCard>

                        <SectionCard title="Certifications" icon={Award} color="#d96c3f" onAdd={() => setCertifications(c => [...c, emptyCert()])} addLabel="Add Cert">
                            {certifications.map((cert, i) => (
                                <div key={cert.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0 1rem', padding: '0.75rem', borderRadius: 10, background: 'var(--bg-secondary)', marginBottom: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                                    <Field label="Certification Name"><input style={inp} placeholder="AWS Solutions Architect" value={cert.name} onChange={e => updateArr(setCertifications, cert.id, 'name', e.target.value)} /></Field>
                                    <Field label="Issuer"><input style={inp} placeholder="Amazon / Google / Coursera" value={cert.issuer} onChange={e => updateArr(setCertifications, cert.id, 'issuer', e.target.value)} /></Field>
                                    <Field label="Year"><input style={inp} placeholder="2024" value={cert.year} onChange={e => updateArr(setCertifications, cert.id, 'year', e.target.value)} /></Field>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.25rem' }}>
                                        <button onClick={() => removeFromArr(setCertifications, cert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={15} /></button>
                                    </div>
                                </div>
                            ))}
                            {certifications.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Add certifications to boost your credibility.</p>}
                        </SectionCard>
                    </div>
                )}

                
                {step === 4 && (
                    <div>
                        <SectionCard title="Finalize & Generate" icon={Target} color="#e8892f">
                            <Field label="Target Job Role" icon={Target} required>
                                <input style={inp} placeholder="e.g. Full Stack Developer, Data Scientist, Product Manager..." value={targetRole} onChange={e => setTargetRole(e.target.value)} />
                            </Field>
                            <Field label="Career Summary Direction (optional)">
                                <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} placeholder="Tell AI what to highlight: 'I want to switch from backend to full stack', 'Fresher targeting product companies', 'MBA with 3 years finance experience targeting consulting'..."
                                    value={summaryPrompt} onChange={e => setSummaryPrompt(e.target.value)} />
                            </Field>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>Choose Template</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                                    {TEMPLATES.map(t => (
                                        <button key={t.id} onClick={() => setTemplate(t.id)} style={{
                                            padding: '0.75rem 1rem', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                                            border: template === t.id ? '2px solid #EC4899' : '1px solid var(--border-subtle)',
                                            background: template === t.id ? 'rgba(236,72,153,0.08)' : 'var(--bg-secondary)',
                                            transition: 'all 0.2s'
                                        }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{t.label}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div style={{ padding: '0.75rem 1rem', background: 'rgba(224,123,106,0.1)', border: '1px solid rgba(224,123,106,0.35)', borderRadius: 10, color: '#eda894', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                    {error}
                                </div>
                            )}

                            <button onClick={generateResume} disabled={loading || !personal.name}
                                className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.9rem', fontSize: '1rem', opacity: (loading || !personal.name) ? 0.7 : 1 }}>
                                {loading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />Generating your Professional Resume...</> : <><Sparkles size={18} />Generate AI-Powered Resume</>}
                            </button>
                            {!personal.name && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Please fill in your name in Step 1 first</p>}
                        </SectionCard>
                    </div>
                )}

                
                {step === 5 && (
                    <div>
                        
                        {aiResult && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                {aiResult.tips?.length > 0 && (
                                    <div className="glass-card" style={{ padding: '1.25rem' }}>
                                        <h3 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Sparkles size={15} />AI Tips for Your Resume
                                        </h3>
                                        {aiResult.tips.map((tip, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: '0.5rem', fontSize: '0.83rem', color: 'var(--text-secondary)', alignItems: 'flex-start' }}>
                                                <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span>{tip}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {aiResult.ats_keywords?.length > 0 && (
                                    <div className="glass-card" style={{ padding: '1.25rem' }}>
                                        <h3 style={{ color: '#10B981', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Target size={15} />ATS Keywords to Include
                                        </h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {aiResult.ats_keywords.map((kw, i) => (
                                                <span key={i} style={{ padding: '2px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', fontSize: '0.75rem', fontWeight: 600 }}>{kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        
                        <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            <button onClick={() => { setStep(4); setAiResult(null) }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.2rem', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                                <RefreshCw size={14} />Regenerate
                            </button>
                            <button onClick={copyText} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.2rem', borderRadius: 10, border: '1px solid var(--border-subtle)', background: copied ? '#10B981' : 'var(--bg-secondary)', color: copied ? 'white' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>
                                {copied ? <ClipboardCheck size={14} /> : <Copy size={14} />}{copied ? 'Copied!' : 'Copy Text'}
                            </button>
                            <button onClick={printResume} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}>
                                <Download size={14} />Download / Print PDF
                            </button>
                        </div>

                        
                        <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                            <div ref={previewRef}>
                                <ResumePreview data={data} aiResult={aiResult} template={template} />
                            </div>
                        </div>
                    </div>
                )}

                
                {step < 5 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                        <button onClick={() => setStep(s => s - 1)} disabled={!canPrev}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.65rem 1.4rem', borderRadius: 10, border: '1px solid var(--border-subtle)', background: canPrev ? 'var(--bg-secondary)' : 'transparent', color: canPrev ? 'var(--text-primary)' : 'transparent', cursor: canPrev ? 'pointer' : 'default', fontWeight: 600, fontSize: '0.9rem' }}>
                            <ChevronLeft size={16} />Previous
                        </button>
                        {canNext ? (
                            <button onClick={() => setStep(s => s + 1)}
                                className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.65rem 1.6rem', fontSize: '0.9rem' }}>
                                Next<ChevronRight size={16} />
                            </button>
                        ) : (
                            <button onClick={generateResume} disabled={loading || !personal.name}
                                className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.65rem 1.6rem', fontSize: '0.9rem', opacity: (loading || !personal.name) ? 0.7 : 1 }}>
                                {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />Generating...</> : <><Sparkles size={16} />Generate Resume</>}
                            </button>
                        )}
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    )
}
