import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import RoadmapCard from '../components/RoadmapCard.jsx'
import SkillBadge from '../components/SkillBadge.jsx'
import { auraApi } from '../api/auraApi.js'
import { Loader, Download } from 'lucide-react'

const ROLES = [
    { key: 'data_scientist', label: '📊 Data Scientist' },
    { key: 'ml_engineer', label: '⚙️ ML Engineer' },
    { key: 'ai_engineer', label: '🤖 AI Engineer' },
    { key: 'full_stack_developer', label: '🌐 Full Stack' },
    { key: 'cyber_security_analyst', label: '🔒 Cyber Security' },
]

export default function RoadmapsPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'data_scientist')
    const [semester, setSemester] = useState(1)
    const [roadmap, setRoadmap] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchRoadmap = async (role, sem) => {
        setLoading(true)
        setError(null)
        try {
            const data = await auraApi.getRoadmap(role, sem, [])
            setRoadmap(data)
        } catch {
            setError('Could not reach the server. Check your connection and try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRoadmap(selectedRole, semester)
    }, [selectedRole, semester])

    const handleRoleChange = (key) => {
        setSelectedRole(key)
        setSearchParams({ role: key })
    }

    const handlePrint = () => window.print()

    return (
        <div className="page-enter max-w-6xl mx-auto px-6 py-12">
            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-4xl font-black mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        Semester <em className="font-serif italic text-ember-300">Roadmaps</em>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Select your career path and semester to see your personalized roadmap.
                    </p>
                </div>
                <button onClick={handlePrint} className="btn-ghost flex items-center gap-2">
                    <Download size={14} />
                    Save as PDF
                </button>
            </div>

            
            <div className="flex gap-2.5 flex-wrap mb-6">
                {ROLES.map(r => (
                    <button
                        key={r.key}
                        onClick={() => handleRoleChange(r.key)}
                        style={{
                            padding: '0.55rem 1.1rem',
                            borderRadius: '24px',
                            fontSize: '0.82rem',
                            fontWeight: 500,
                            fontFamily: 'Figtree, sans-serif',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            border: selectedRole === r.key
                                ? '1px solid var(--primary)'
                                : '1px solid var(--border-subtle)',
                            background: selectedRole === r.key
                                ? 'rgba(79, 70, 229, 0.1)'
                                : 'var(--bg-secondary)',
                            color: selectedRole === r.key ? 'var(--primary)' : 'var(--text-muted)',
                        }}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            
            <div className="flex items-center gap-3 mb-8">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Current Semester:</span>
                <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <button
                            key={s}
                            onClick={() => setSemester(s)}
                            style={{
                                width: '34px', height: '34px',
                                borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                                fontFamily: 'Figtree, sans-serif', cursor: 'pointer', transition: 'all 0.2s',
                                border: semester === s ? 'none' : '1px solid var(--border-subtle)',
                                background: semester === s
                                    ? 'var(--primary)'
                                    : 'var(--bg-secondary)',
                                color: semester === s ? '#FFFFFF' : 'var(--text-muted)',
                            }}
                        >{s}</button>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="flex justify-center py-20">
                    <Loader size={28} color="var(--primary)" className="animate-spin" />
                </div>
            )}

            {error && (
                <div className="glass-card p-6 text-center" style={{ borderColor: 'rgba(224,123,106,0.35)', background: 'rgba(224,123,106,0.08)' }}>
                    <p style={{ color: '#DC2626' }}>{error}</p>
                </div>
            )}

            {!loading && !error && roadmap && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    <div className="lg:col-span-2">
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                                        {roadmap.career_title} — Learning Path
                                    </h2>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                        {roadmap.total_semesters} semesters · {roadmap.roadmap?.length} phases
                                    </p>
                                </div>
                                
                                <div className="text-right">
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                                        {roadmap.skill_gap?.completion_percentage || 0}%
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Readiness</div>
                                </div>
                            </div>

                            
                            <div className="progress-bar mb-6">
                                <div className="progress-fill" style={{ width: `${roadmap.skill_gap?.completion_percentage || 0}%` }} />
                            </div>

                            
                            <div>
                                {roadmap.roadmap?.map((item, i) => (
                                    <RoadmapCard
                                        key={item.semester}
                                        item={item}
                                        isLast={i === roadmap.roadmap.length - 1}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    
                    <div className="flex flex-col gap-4">
                        
                        <div className="glass-card p-5">
                            <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                💰 Salary Range (India)
                            </h3>
                            {[
                                { label: 'Fresher', val: roadmap.salary_range?.fresher, color: '#10B981' },
                                { label: 'Mid', val: roadmap.salary_range?.mid, color: 'var(--secondary)' },
                                { label: 'Senior', val: roadmap.salary_range?.senior, color: 'var(--primary)' },
                            ].map(s => (
                                <div key={s.label} className="flex justify-between items-center mb-2">
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: s.color }}>{s.val}</span>
                                </div>
                            ))}
                        </div>

                        
                        <div className="glass-card p-5">
                            <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                ⚙️ Tools & Frameworks
                            </h3>
                            <div className="flex flex-wrap gap-1.5">
                                {roadmap.tools_frameworks?.slice(0, 10).map(t => (
                                    <SkillBadge key={t} name={t} variant="cyan" />
                                ))}
                            </div>
                        </div>

                        
                        {roadmap.skill_gap?.missing?.length > 0 && (
                            <div className="glass-card p-5">
                                <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                    🎯 Skills to Build
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {roadmap.skill_gap.missing.slice(0, 8).map(s => (
                                        <SkillBadge key={s} name={s} variant="red" />
                                    ))}
                                </div>
                            </div>
                        )}

                        
                        <div className="glass-card p-5">
                            <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                🏗️ Projects to Build
                            </h3>
                            {roadmap.projects?.slice(0, 4).map(p => (
                                <div key={p} className="flex items-start gap-2 mb-1.5">
                                    <span style={{ color: 'var(--primary)', fontSize: '0.8rem', marginTop: '2px' }}>▸</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{p}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
