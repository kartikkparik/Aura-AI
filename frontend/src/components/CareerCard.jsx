import { TrendingUp, DollarSign } from 'lucide-react'
import SkillBadge from './SkillBadge.jsx'

const ROLE_ICONS = {
    data_scientist: '📊',
    ml_engineer: '⚙️',
    ai_engineer: '🤖',
    full_stack_developer: '🌐',
    cyber_security_analyst: '🔒',
}

export default function CareerCard({ career, onClick }) {
    const icon = ROLE_ICONS[career.key] || '🎯'
    return (
        <div
            onClick={() => onClick && onClick(career)}
            className="glass-card p-5 cursor-pointer group"
            style={{ transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = 'rgba(232,137,47,0.45)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(232,137,47,0.15)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(244,239,228,0.14)'
                e.currentTarget.style.boxShadow = 'none'
            }}
        >
            
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">{icon}</div>
                    <div>
                        <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f0f0ff', marginBottom: '0.15rem' }}>
                            {career.title}
                        </h3>
                        <div className="flex items-center gap-1" style={{ color: 'var(--secondary)', fontSize: '0.78rem', fontWeight: 500 }}>
                            <DollarSign size={11} />
                            <span>{career.salary_range?.fresher} → {career.salary_range?.senior}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1" style={{
                    fontSize: '0.7rem', color: '#86efac', fontWeight: 500,
                    background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: '20px', padding: '0.2rem 0.55rem'
                }}>
                    <TrendingUp size={10} />
                    High demand
                </div>
            </div>

            
            <p style={{ fontSize: '0.82rem', color: '#8b8ba8', lineHeight: '1.55', marginBottom: '1rem' }}>
                {career.description?.slice(0, 120)}…
            </p>

            
            <div className="flex flex-wrap gap-1.5">
                {career.key_skills?.slice(0, 4).map(skill => (
                    <SkillBadge key={skill} name={skill} />
                ))}
            </div>
        </div>
    )
}
