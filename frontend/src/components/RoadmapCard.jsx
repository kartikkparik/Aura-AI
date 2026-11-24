import { BookOpen, CheckCircle, Clock, Lock } from 'lucide-react'

const STATUS_STYLES = {
    completed: {
        icon: <CheckCircle size={14} color="#8fd0a0" />,
        dotColor: '#63b57a',
        borderColor: 'rgba(99,181,122,0.25)',
        bg: 'rgba(99,181,122,0.07)',
        label: 'Completed',
        labelColor: '#8fd0a0',
    },
    current: {
        icon: <Clock size={14} color="#f0b878" />,
        dotColor: '#e8892f',
        borderColor: 'rgba(232,137,47,0.4)',
        bg: 'rgba(232,137,47,0.08)',
        label: 'Current',
        labelColor: '#f0b878',
    },
    upcoming: {
        icon: <Lock size={14} color="#7d7464" />,
        dotColor: '#4a443a',
        borderColor: 'rgba(244,239,228,0.1)',
        bg: 'transparent',
        label: 'Upcoming',
        labelColor: '#7d7464',
    },
}

export default function RoadmapCard({ item, isLast }) {
    const s = STATUS_STYLES[item.status] || STATUS_STYLES.upcoming

    return (
        <div style={{ position: 'relative', paddingLeft: '44px', paddingBottom: isLast ? 0 : '1.5rem' }}>
            
            {!isLast && (
                <div style={{
                    position: 'absolute', left: '14px', top: '28px', bottom: 0,
                    width: '2px',
                    background: item.status === 'completed'
                        ? '#63b57a'
                        : 'rgba(244,239,228,0.12)',
                }} />
            )}

            
            <div style={{
                position: 'absolute', left: '0', top: '8px',
                width: '30px', height: '30px',
                borderRadius: '50%',
                background: item.status === 'current'
                    ? 'var(--primary)'
                    : item.status === 'completed'
                        ? 'rgba(99,181,122,0.25)'
                        : 'rgba(38,33,27,0.9)',
                border: `2px solid ${s.dotColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 2,
                boxShadow: item.status === 'current' ? '0 0 12px rgba(232,137,47,0.45)' : 'none',
            }}>
                {s.icon}
            </div>

            
            <div style={{
                background: s.bg,
                border: `1px solid ${s.borderColor}`,
                borderRadius: '14px',
                padding: '1rem 1.15rem',
                transition: 'all 0.2s',
            }}>
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <span style={{ fontSize: '0.72rem', color: '#7d7464', fontWeight: 500 }}>
                            Semester {item.semester}
                        </span>
                        <h4 style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '1px' }}>
                            {item.title}
                        </h4>
                    </div>
                    <span style={{
                        fontSize: '0.7rem', color: s.labelColor, fontWeight: 500,
                        background: `${s.bg || 'rgba(125,116,100,0.1)'}`,
                        border: `1px solid ${s.borderColor}`,
                        borderRadius: '20px', padding: '0.18rem 0.55rem'
                    }}>
                        {s.label}
                    </span>
                </div>

                
                {(item.status === 'current' || item.status === 'completed') && (
                    <div className="flex flex-col gap-1">
                        {item.topics?.slice(0, 5).map(t => (
                            <div key={t} className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: '#b3a892' }}>
                                <BookOpen size={11} color="var(--primary)" style={{ flexShrink: 0 }} />
                                {t}
                            </div>
                        ))}
                    </div>
                )}

                {item.status === 'upcoming' && (
                    <p style={{ fontSize: '0.78rem', color: '#7d7464', fontStyle: 'italic' }}>
                        {item.topics?.slice(0, 3).join(', ')}…
                    </p>
                )}
            </div>
        </div>
    )
}
