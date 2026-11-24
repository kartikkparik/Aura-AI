import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X, ArrowUpRight, ChevronDown } from 'lucide-react'

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [moreOpen, setMoreOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 bg-[#14110d]/85 backdrop-blur-xl border-b border-[rgba(244,239,228,0.08)]">
            <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Brand */}
                <NavLink to="/" className="flex items-baseline gap-1.5 text-decoration-none group">
                    <span className="font-serif text-[1.45rem] leading-none text-cream-100 group-hover:text-ember-300 transition-colors">
                        Aura
                    </span>
                    <span className="font-serif italic text-[1.05rem] text-ember-400">AI</span>
                </NavLink>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1 text-[13px] font-medium">
                    <NavLink
                        to="/chat"
                        className={({ isActive }) =>
                            `px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-ember-300 bg-ember-400/10' : 'text-cream-500 hover:text-cream-100'}`
                        }
                    >
                        Mentor
                    </NavLink>
                    <NavLink
                        to="/resume"
                        className={({ isActive }) =>
                            `px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-ember-300 bg-ember-400/10' : 'text-cream-500 hover:text-cream-100'}`
                        }
                    >
                        Resume Studio
                    </NavLink>
                    <NavLink
                        to="/interview"
                        className={({ isActive }) =>
                            `px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-ember-300 bg-ember-400/10' : 'text-cream-500 hover:text-cream-100'}`
                        }
                    >
                        Mock Interview
                    </NavLink>
                    <NavLink
                        to="/roadmaps"
                        className={({ isActive }) =>
                            `px-3 py-1.5 rounded-lg transition-colors ${isActive ? 'text-ember-300 bg-ember-400/10' : 'text-cream-500 hover:text-cream-100'}`
                        }
                    >
                        Roadmaps
                    </NavLink>

                    {/* More popover */}
                    <div className="relative ml-1"
                        onKeyDown={(e) => { if (e.key === 'Escape') setMoreOpen(false) }}>
                        <button
                            onClick={() => setMoreOpen(!moreOpen)}
                            onBlur={() => setTimeout(() => setMoreOpen(false), 200)}
                            aria-expanded={moreOpen}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-cream-500 hover:text-cream-100 transition-colors"
                        >
                            <span>Explore</span>
                            <ChevronDown size={13} className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {moreOpen && (
                            <div className="absolute top-full right-0 mt-2 w-52 py-2 bg-[#1c1813] border border-[rgba(244,239,228,0.12)] rounded-xl shadow-2xl z-50 animate-[scaleIn_0.15s_ease-out]">
                                <NavLink
                                    to="/resume/build"
                                    onClick={() => setMoreOpen(false)}
                                    className="block px-4 py-2 text-[13px] text-cream-300 hover:bg-[rgba(244,239,228,0.05)] hover:text-cream-100"
                                >
                                    Resume Builder
                                </NavLink>
                                <NavLink
                                    to="/doc-editor"
                                    onClick={() => setMoreOpen(false)}
                                    className="block px-4 py-2 text-[13px] text-cream-300 hover:bg-[rgba(244,239,228,0.05)] hover:text-cream-100"
                                >
                                    Document Corrector
                                </NavLink>
                                <NavLink
                                    to="/careers"
                                    onClick={() => setMoreOpen(false)}
                                    className="block px-4 py-2 text-[13px] text-cream-300 hover:bg-[rgba(244,239,228,0.05)] hover:text-cream-100"
                                >
                                    Career Database
                                </NavLink>
                                <div className="my-1.5 border-t border-[rgba(244,239,228,0.08)]" />
                                <NavLink
                                    to="/about"
                                    onClick={() => setMoreOpen(false)}
                                    className="block px-4 py-2 text-[13px] text-cream-500 hover:bg-[rgba(244,239,228,0.05)] hover:text-cream-100"
                                >
                                    About & Engineering
                                </NavLink>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right CTA + mobile toggle */}
                <div className="flex items-center gap-3">
                    <NavLink to="/chat">
                        <button className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold bg-ember-400 text-[#1c1206] hover:bg-ember-300 transition-colors active:scale-[0.98]">
                            <span>Open the Mentor</span>
                            <ArrowUpRight size={14} />
                        </button>
                    </NavLink>

                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 text-cream-500 hover:text-cream-100 rounded-lg"
                        aria-label="Toggle Navigation"
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav>

            {/* Mobile drawer */}
            {menuOpen && (
                <div className="md:hidden border-b border-[rgba(244,239,228,0.1)] bg-[#14110d] px-6 py-6 space-y-1 animate-[slideDown_0.2s_ease-out]">
                    {[
                        ['/chat', 'Career Mentor'],
                        ['/resume', 'Resume Studio'],
                        ['/interview', 'Mock Interview'],
                        ['/roadmaps', 'Learning Roadmaps'],
                        ['/doc-editor', 'Document Corrector'],
                        ['/careers', 'Career Database'],
                    ].map(([to, label]) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setMenuOpen(false)}
                            className="block py-2.5 text-[15px] text-cream-300 hover:text-cream-100 border-b border-[rgba(244,239,228,0.05)] last:border-0"
                        >
                            {label}
                        </NavLink>
                    ))}

                    <div className="pt-4">
                        <NavLink to="/chat" onClick={() => setMenuOpen(false)}>
                            <button className="w-full py-2.5 rounded-full text-[13px] font-semibold bg-ember-400 text-[#1c1206] flex items-center justify-center gap-2">
                                Launch Mentor <ArrowUpRight size={14} />
                            </button>
                        </NavLink>
                    </div>
                </div>
            )}
        </header>
    )
}
