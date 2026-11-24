import { Heart, Sparkles, Code2, Cpu, Database, Layout, ShieldCheck, ArrowRight, Github, ExternalLink } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const ARCHITECTURE_HIGHLIGHTS = [
    {
        icon: <Cpu size={24} className="text-ember-400" />,
        title: 'LLM Orchestration Engine',
        desc: 'Engineered high-throughput context streaming with Groq LLaMA 3.3 70B, custom multi-role system prompting, and natural Hindi/Hinglish multilingual intelligence.'
    },
    {
        icon: <Database size={24} className="text-[#7fa8c9]" />,
        title: 'Cloud-Ready Persistent Storage',
        desc: 'Designed SQLAlchemy schemas supporting multi-thread conversation tracking, SHA-256 hashed authentication, and automated data retention policies.'
    },
    {
        icon: <Layout size={24} className="text-[#d96c3f]" />,
        title: 'Reactive Full-Stack Frontend',
        desc: 'Built with React 18 & Vite, featuring modular context state management, responsive ChatGPT-style sidebar navigation, and glassmorphic UI design.'
    },
    {
        icon: <ShieldCheck size={24} className="text-emerald-400" />,
        title: 'Enterprise Document & ATS Analysis',
        desc: 'Implemented multipart binary parsing (PDF/DOCX) combined with heuristic keyword scoring to evaluate ATS compatibility across 50+ career verticals.'
    }
]

const TECH_STACK = [
    { name: 'React 18', category: 'Frontend', icon: '⚛️' },
    { name: 'Vite 5', category: 'Build Tool', icon: '⚡' },
    { name: 'Tailwind CSS', category: 'Styling', icon: '🎨' },
    { name: 'Python Flask', category: 'Backend API', icon: '🐍' },
    { name: 'Groq LLaMA 3.3', category: 'AI Inference', icon: '🧠' },
    { name: 'SQLAlchemy', category: 'Database ORM', icon: '🗄️' },
    { name: 'REST APIs', category: 'Architecture', icon: '🔌' },
    { name: 'Werkzeug Auth', category: 'Security', icon: '🔒' }
]

export default function AboutPage() {
    return (
        <div className="page-enter max-w-5xl mx-auto px-5 py-12">
            
            {/* Hero Section */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
                    style={{ background: 'rgba(232,137,47,0.12)', border: '1px solid rgba(232,137,47,0.3)', color: 'var(--primary)' }}>
                    <Sparkles size={13} />
                    Personal Portfolio Project
                </div>
                <h1 className="font-serif text-5xl sm:text-6xl mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    About Aura <em className="text-ember-400">AI</em>
                </h1>
                <p className="text-lg max-w-2xl mx-auto text-zinc-400 leading-relaxed">
                    An advanced, multilingual AI career mentorship and intelligence platform designed and engineered from scratch.
                </p>
            </div>

            {/* Developer Spotlight Card */}
            <div className="glass-card p-8 sm:p-10 mb-14 border border-[rgba(232,137,47,0.25)]"
                style={{ borderRadius: '24px' }}>
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center text-5xl flex-shrink-0"
                        style={{
                            background: 'var(--primary)',
                            boxShadow: '0 12px 30px rgba(232,137,47,0.3)'
                        }}>
                        👨‍💻
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-ember-300 bg-ember-400/10 border border-ember-400/25 mb-2">
                            Creator & Lead Engineer
                        </div>
                        <h2 className="font-serif text-4xl mb-2 text-cream-100">Kartik Pareek</h2>
                        <p className="text-sm font-semibold text-ember-300 mb-3">
                            Full-Stack Engineer & AI Systems Developer
                        </p>
                        <p className="text-sm text-zinc-300 leading-relaxed mb-5">
                            Built the entirety of Aura AI — architecting the Flask REST API backend, designing the responsive React frontend, integrating Groq LLaMA 3.3 70B inference pipelines, and engineering secure authentication and document parsing systems.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            {['Full-Stack Architecture', 'LLM Integration', 'System Design', 'React / Vite', 'Python / Flask', 'Database Modeling'].map(s => (
                                <span key={s} className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800/80 text-zinc-200 border border-zinc-700/60">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* System Architecture Highlights */}
            <div className="mb-16">
                <h2 className="text-2xl font-black text-center text-white mb-2">
                    🛠️ Engineering & Architecture
                </h2>
                <p className="text-center text-sm text-zinc-400 mb-8 max-w-lg mx-auto">
                    Built for performance, scalability, and seamless recruiter demonstrations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {ARCHITECTURE_HIGHLIGHTS.map(item => (
                        <div key={item.title} className="glass-card p-6 rounded-2xl border border-[rgba(244,239,228,0.08)] hover:border-[rgba(232,137,47,0.35)] transition-all">
                            <div className="mb-4 w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-900 border border-zinc-800">
                                {item.icon}
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tech Stack Grid */}
            <div className="mb-16">
                <h2 className="text-2xl font-black text-center text-white mb-6">
                    ⚡ Technology Stack
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {TECH_STACK.map(tech => (
                        <div key={tech.name} className="glass-card p-4 rounded-xl text-center border border-zinc-800/80">
                            <div className="text-2xl mb-1.5">{tech.icon}</div>
                            <div className="font-bold text-sm text-white">{tech.name}</div>
                            <div className="text-[11px] text-zinc-400">{tech.category}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="glass-card p-8 sm:p-10 text-center rounded-3xl border border-[rgba(232,137,47,0.3)]"
                style={{ background: 'rgba(232,137,47,0.05)' }}>
                <h3 className="text-2xl font-bold text-white mb-2">Experience Aura AI in Action</h3>
                <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">
                    Try the interactive AI chat, analyze a resume, or practice a mock interview session.
                </p>
                <NavLink to="/chat">
                    <button className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl shadow-lg">
                        Launch Chat Console
                        <ArrowRight size={16} />
                    </button>
                </NavLink>
            </div>

            {/* Footer */}
            <div className="text-center mt-12 text-xs text-zinc-500">
                Aura AI v2.0 • Designed & Engineered by Kartik Pareek • 2025
            </div>
        </div>
    )
}
