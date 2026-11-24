export default function SkillBadge({ name, variant = 'default' }) {
    const colors = {
        default: { bg: 'rgba(232,137,47,0.12)', border: 'rgba(232,137,47,0.3)', color: '#f0b878' },
        green: { bg: 'rgba(99,181,122,0.1)', border: 'rgba(99,181,122,0.25)', color: '#8fd0a0' },
        red: { bg: 'rgba(224,123,106,0.1)', border: 'rgba(224,123,106,0.25)', color: '#eda894' },
        cyan: { bg: 'rgba(127,168,201,0.1)', border: 'rgba(127,168,201,0.25)', color: '#a8c8e0' },
    }
    const c = colors[variant] || colors.default
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center',
            background: c.bg, border: `1px solid ${c.border}`,
            color: c.color, borderRadius: '20px',
            padding: '0.2rem 0.6rem', fontSize: '0.74rem', fontWeight: 500,
            whiteSpace: 'nowrap',
        }}>
            {name}
        </span>
    )
}
