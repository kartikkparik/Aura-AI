import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, FileText, Mic, Map, MessagesSquare } from 'lucide-react'
import { useSession } from '../context/SessionContext.jsx'

const QUICK_PROMPTS = [
    'How do I become an AI/ML Engineer?',
    'Build me a 6-month Full-Stack roadmap',
    'Prepare me for a frontend interview',
    'Compare Data Scientist vs Data Engineer',
]

const TOOLS = [
    {
        index: '01',
        accent: '#e8892f',
        title: 'Career Mentor',
        description: 'A conversational advisor that knows your profile, your semester, and your goal — in plain language.',
        link: '/chat',
        actionText: 'Start a conversation',
    },
    {
        index: '02',
        accent: '#7fa8c9',
        title: 'Resume Studio',
        description: 'ATS scoring, keyword gaps, and a builder that writes bullets in your voice — not a template\'s.',
        link: '/resume',
        actionText: 'Analyze a resume',
    },
    {
        index: '03',
        accent: '#cfa44e',
        title: 'Mock Interviews',
        description: 'Role- and level-matched questions with scored answers and a final grade card.',
        link: '/interview',
        actionText: 'Run a mock interview',
    },
    {
        index: '04',
        accent: '#63b57a',
        title: 'Roadmaps & Skill Gaps',
        description: 'Semester-wise paths built from a curated knowledge base — prioritized by what you\'re missing.',
        link: '/roadmaps',
        actionText: 'See the roadmaps',
    },
]

export default function HomePage() {
    const [promptText, setPromptText] = useState('')
    const navigate = useNavigate()
    const { send } = useSession()

    const goWithPrompt = (query) => {
        navigate('/chat')
        setTimeout(() => send(query), 300)
    }

    const handlePromptSubmit = (e) => {
        e.preventDefault()
        const query = promptText.trim()
        if (!query) return
        setPromptText('')
        goWithPrompt(query)
    }

    return (
        <div className="min-h-[calc(100vh-64px)] flex flex-col max-w-5xl mx-auto px-6 pt-14 sm:pt-20 pb-16">
            {/* Hero */}
            <div className="max-w-3xl mb-16 sm:mb-24">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ember-400 mb-6">
                    Free · Private · No login
                </p>

                <h1 className="font-serif text-[2.75rem] sm:text-7xl leading-[1.04] tracking-[-0.01em] text-cream-100 mb-7">
                    Career guidance that<br />
                    <em className="text-ember-400">actually knows you.</em>
                </h1>

                <p className="text-[15px] sm:text-lg text-cream-500 leading-relaxed max-w-xl mb-10">
                    One short profile powers your AI mentor, resume studio, mock interviews,
                    and semester roadmaps. Everything runs in your browser — nothing to sign up for.
                </p>

                {/* Prompt console */}
                <form onSubmit={handlePromptSubmit} className="mb-5">
                    <div className="flex items-center gap-3 rounded-2xl border border-[rgba(244,239,228,0.14)] bg-[#1c1813]/90 px-4 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.4)] focus-within:border-ember-400/60 transition-colors">
                        <MessagesSquare size={17} className="text-cream-500 flex-shrink-0" />
                        <input
                            type="text"
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                            placeholder="Ask about a career, a role, or your next step…"
                            className="w-full bg-transparent py-2 text-[15px] text-cream-100 placeholder:text-cream-500/70 focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!promptText.trim()}
                            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-ember-400 px-4 py-2 text-[13px] font-semibold text-[#1c1206] hover:bg-ember-300 disabled:opacity-40 disabled:hover:bg-ember-400 transition-colors"
                        >
                            Ask
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </form>

                <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((q) => (
                        <button
                            key={q}
                            onClick={() => goWithPrompt(q)}
                            className="rounded-full border border-[rgba(244,239,228,0.12)] px-3.5 py-1.5 text-[12.5px] text-cream-500 hover:text-cream-100 hover:border-ember-400/50 hover:bg-ember-400/[0.06] transition-colors"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tool index */}
            <div className="border-t border-[rgba(244,239,228,0.12)] mb-20">
                <div className="flex items-baseline justify-between py-5">
                    <h2 className="font-serif text-2xl text-cream-100">The toolkit</h2>
                    <NavLink
                        to="/careers"
                        className="text-[12px] text-cream-500 hover:text-cream-100 inline-flex items-center gap-1 transition-colors"
                    >
                        50+ career paths <ArrowUpRight size={13} />
                    </NavLink>
                </div>

                <div>
                    {TOOLS.map((tool) => (
                        <NavLink
                            key={tool.index}
                            to={tool.link}
                            className="group grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[3rem_1fr_1fr_auto] items-baseline gap-x-4 gap-y-1 border-t border-[rgba(244,239,228,0.08)] py-6 sm:py-7 transition-colors hover:bg-[rgba(244,239,228,0.02)]"
                            style={{ '--tool-accent': tool.accent }}
                        >
                            <span className="font-serif italic text-lg" style={{ color: tool.accent }}>{tool.index}</span>
                            <h3 className="font-serif text-xl sm:text-2xl text-cream-100 transition-colors">
                                <span className="group-hover:text-[var(--tool-accent)] transition-colors inline-block">{tool.title}</span>
                            </h3>
                            <p className="col-span-2 sm:col-span-1 text-[13px] sm:text-sm text-cream-500 leading-relaxed max-w-md">
                                {tool.description}
                            </p>
                            <span className="col-start-3 sm:col-start-4 row-start-1 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-cream-500 group-hover:text-[var(--tool-accent)] transition-colors whitespace-nowrap">
                                {tool.actionText}
                                <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </span>
                        </NavLink>
                    ))}
                </div>
            </div>

            <footer className="mt-auto pt-8 border-t border-[rgba(244,239,228,0.12)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[12.5px] text-cream-500">
                <div className="flex items-center gap-2">
                    <span className="font-serif text-base text-cream-100">Aura</span>
                    <span>·</span>
                    <span>Built by Kartik Pareek for CS50x</span>
                </div>
                <div className="flex items-center gap-6">
                    <NavLink to="/chat" className="hover:text-cream-100 transition-colors">Mentor</NavLink>
                    <NavLink to="/resume" className="hover:text-cream-100 transition-colors">Resume</NavLink>
                    <NavLink to="/interview" className="hover:text-cream-100 transition-colors">Interview</NavLink>
                    <NavLink to="/about" className="hover:text-cream-100 transition-colors">About</NavLink>
                </div>
            </footer>
        </div>
    )
}
