import { useNavigate, NavLink } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'

const ALL_CAREERS = [
    
    {
        category: '💻 Technology', items: [
            { key: 'ai_engineer', title: 'AI Engineer', desc: 'Build intelligent systems, LLMs, computer vision & NLP.', tags: ['Python', 'PyTorch', 'LLMs'] },
            { key: 'ml_engineer', title: 'ML Engineer', desc: 'Design, train and deploy machine learning models at scale.', tags: ['Scikit-learn', 'MLOps', 'AWS'] },
            { key: 'data_scientist', title: 'Data Scientist', desc: 'Derive insights from data using statistics & visualization.', tags: ['Pandas', 'SQL', 'Tableau'] },
            { key: 'full_stack_developer', title: 'Full Stack Developer', desc: 'Build end-to-end web apps from frontend to backend.', tags: ['React', 'Node.js', 'MongoDB'] },
            { key: 'cyber_security_analyst', title: 'Cyber Security', desc: 'Protect systems and networks from digital threats.', tags: ['Ethical Hacking', 'SIEM', 'Linux'] },
            { key: 'devops_cloud', title: 'DevOps / Cloud', desc: 'Automate deployments, CI/CD pipelines, and cloud infra.', tags: ['Docker', 'Kubernetes', 'AWS'] },
            { key: 'game_developer', title: 'Game Developer', desc: 'Design and develop video games for PC, mobile, or console.', tags: ['Unity', 'Unreal', 'C++'] },
            { key: 'blockchain_developer', title: 'Blockchain Dev', desc: 'Build decentralized apps and smart contracts.', tags: ['Solidity', 'Web3.js', 'Ethereum'] },
        ]
    },
    
    {
        category: '🏛️ Government', items: [
            { key: 'upsc_ias', title: 'UPSC / IAS', desc: 'Civil services — the most prestigious government career in India.', tags: ['UPSC', 'GS', 'CSAT'] },
            { key: 'ssc_banking', title: 'SSC / Banking', desc: 'Government sector: SSC CGL, IBPS PO, SBI Clerk and more.', tags: ['Quant', 'Reasoning', 'English'] },
            { key: 'defence_nda', title: 'Defence (NDA/CDS)', desc: 'Join Indian Army, Navy, or Air Force as an officer.', tags: ['NDA', 'CDS', 'Physical Fitness'] },
        ]
    },
    
    {
        category: '🏥 Healthcare', items: [
            { key: 'mbbs_doctor', title: 'Doctor (MBBS)', desc: 'Medical career — NEET preparation, MBBS, specialization.', tags: ['NEET', 'Biology', 'AIIMS'] },
            { key: 'pharmacy', title: 'Pharmacy', desc: 'Drug development, clinical pharmacy, and pharmaceutical industry.', tags: ['Pharmacology', 'D.Pharm', 'B.Pharm'] },
            { key: 'nursing', title: 'Nursing', desc: 'Patient care, hospital management, global nursing opportunities.', tags: ['GNM', 'B.Sc Nursing', 'NCLEX'] },
        ]
    },
    
    {
        category: '💰 Finance & Business', items: [
            { key: 'ca_finance', title: 'CA / Finance', desc: 'Chartered Accountant — the gold standard in Indian finance.', tags: ['ICAI', 'Taxation', 'Audit'] },
            { key: 'mba', title: 'MBA', desc: 'Management degree — IIM, CAT, marketing, HR, consulting.', tags: ['CAT', 'GMAT', 'Strategy'] },
            { key: 'investment_banking', title: 'Investment Banking', desc: 'CFA, equity research, M&A, and Wall Street tracks.', tags: ['CFA', 'Excel', 'Financial Modeling'] },
        ]
    },
    
    {
        category: '⚖️ Law', items: [
            { key: 'lawyer_llb', title: 'Lawyer (LLB)', desc: 'Corporate law, criminal law, or judiciary preparation.', tags: ['CLAT', 'Bar Exam', 'Moot Court'] },
        ]
    },
    
    {
        category: '🎨 Design & Media', items: [
            { key: 'ux_ui_designer', title: 'UX/UI Designer', desc: 'Design beautiful, user-friendly digital products.', tags: ['Figma', 'Adobe XD', 'Prototyping'] },
            { key: 'content_creator', title: 'Content Creator', desc: 'YouTube, blogs, social media — digital media career paths.', tags: ['SEO', 'Video Editing', 'Social Media'] },
            { key: 'journalist', title: 'Journalism / PR', desc: 'News reporting, digital journalism, public relations.', tags: ['BJMC', 'Reporting', 'PR Tools'] },
        ]
    },
]

const COLORS = ['#e8892f', '#7fa8c9', '#63b57a', '#d96c3f', '#cfa44e', '#b0714f']

export default function CareersPage() {
    const navigate = useNavigate()

    return (
        <div className="page-enter max-w-6xl mx-auto px-6 py-12">
            <div className="mb-10">
                <h1 className="text-4xl font-black mb-3" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    Career <em className="font-serif italic text-ember-300">Paths</em>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Explore 25+ career paths across all fields. Click any card, then chat with Aura for a personalized roadmap.
                </p>
            </div>

            {ALL_CAREERS.map((section, si) => (
                <div key={section.category} style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '1rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border-subtle)' }}>
                        {section.category}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {section.items.map((career, i) => {
                            const color = COLORS[(si + i) % COLORS.length]
                            return (
                                <div
                                    key={career.key}
                                    className="glass-card"
                                    style={{ padding: '1.25rem', cursor: 'pointer', transition: 'all 0.25s', borderColor: 'var(--border-subtle)' }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = color
                                        e.currentTarget.style.transform = 'translateY(-4px)'
                                        e.currentTarget.style.boxShadow = `0 8px 24px ${color}15`
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'var(--border-subtle)'
                                        e.currentTarget.style.transform = 'translateY(0)'
                                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                                    }}
                                    onClick={() => navigate(`/chat`)}
                                >
                                    <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '0.35rem' }}>{career.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: '0.7rem' }}>{career.desc}</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                        {career.tags.map(t => (
                                            <span key={t} style={{
                                                padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem',
                                                background: `${color}10`, color: color, border: `1px solid ${color}30`, fontWeight: 500
                                            }}>{t}</span>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}

            
            <div className="glass-card p-6 flex items-center gap-4" style={{ borderColor: 'var(--primary)', marginTop: '1rem', background: 'var(--bg-secondary)' }}>
                <MessageCircle size={32} color="var(--primary)" style={{ flexShrink: 0 }} />
                <div>
                    <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        Don't see your field? Chat with Aura!
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Aura knows every career field. Just type your goal — in Hindi or English — and get a personalized roadmap.
                    </p>
                </div>
                <NavLink to="/chat" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                    <button className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '0.6rem 1.3rem', fontSize: '0.88rem' }}>
                        Chat Now →
                    </button>
                </NavLink>
            </div>
        </div>
    )
}
