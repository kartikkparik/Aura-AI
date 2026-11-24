import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import { useSession } from '../context/SessionContext.jsx'
import { Compass, FileCheck, Mic, Route } from 'lucide-react'

const ROLE_DISPLAY = {
    data_scientist: 'Data Scientist',
    ml_engineer: 'ML Engineer',
    ai_engineer: 'AI Engineer',
    full_stack_developer: 'Full Stack Developer',
    cyber_security_analyst: 'Cyber Security Analyst',
}

const STARTER_PROMPTS = [
    {
        icon: <Route size={16} />,
        title: 'Tech & AI Roadmap',
        desc: 'A step-by-step path to become an AI/ML engineer',
        prompt: 'I want to become an AI/ML Engineer. Give me a step-by-step roadmap and timeline.'
    },
    {
        icon: <FileCheck size={16} />,
        title: 'Resume Review',
        desc: 'Keywords and high-impact phrasing for ATS',
        prompt: 'How do I make my resume ATS-friendly? Suggest keywords and strong action verbs.'
    },
    {
        icon: <Mic size={16} />,
        title: 'Mock Interview',
        desc: 'Technical and behavioral practice for your role',
        prompt: 'Start a mock interview for a Software Engineer fresher role. Ask me the first question.'
    },
    {
        icon: <Compass size={16} />,
        title: 'Compare Careers',
        desc: 'Salary, demand, and learning curve side by side',
        prompt: 'Compare Data Scientist vs Data Engineer on salary, demand, and scope.'
    }
]

export default function ChatWindow() {
    const { messages, isTyping, send, sessionInfo } = useSession()
    const endRef = useRef(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    const hasProfile = sessionInfo?.profiling_complete
    const firstName = hasProfile && sessionInfo.name ? sessionInfo.name.split(' ')[0] : null
    const goalLabel = hasProfile ? (ROLE_DISPLAY[sessionInfo.career_goal] || sessionInfo.career_goal) : null

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 flex flex-col gap-5" style={{ minHeight: 0 }}>
            {messages.length <= 1 && (
                <div className="max-w-3xl mx-auto w-full my-auto py-6 animate-slide-up">
                    <div className="text-center mb-9">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 border border-[rgba(232,137,47,0.3)] bg-[rgba(232,137,47,0.08)]">
                            <span className="font-serif italic text-3xl text-ember-300 leading-none pt-1">A</span>
                        </div>
                        <h2 className="font-serif text-[1.9rem] sm:text-[2.6rem] leading-[1.12] text-cream-100 mb-3">
                            {firstName ? (
                                <>
                                    {firstName}, your path to{' '}
                                    <em className="text-ember-300">{goalLabel || 'your goal'}</em>{' '}
                                    starts here.
                                </>
                            ) : (
                                <>
                                    Where do you want your career to go?
                                </>
                            )}
                        </h2>
                        <p className="text-[13.5px] text-cream-500 max-w-md mx-auto leading-relaxed">
                            {hasProfile
                                ? `I've noted your profile — ${sessionInfo.current_semester ? `semester ${sessionInfo.current_semester}, ` : ''}${sessionInfo.weekly_study_hours}h/week. Every answer below will be shaped by it.`
                                : 'Ask anything below or type your own question. Tell me your goal and I\'ll build the plan around it.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {STARTER_PROMPTS.map((item) => (
                            <button
                                key={item.title}
                                onClick={() => send(item.prompt)}
                                disabled={isTyping}
                                className="group glass-card p-4 rounded-xl text-left flex items-start gap-3.5 hover:border-[rgba(232,137,47,0.4)] disabled:opacity-50 transition-colors"
                            >
                                <div className="p-2 rounded-lg bg-[rgba(232,137,47,0.1)] border border-[rgba(232,137,47,0.2)] text-ember-300 flex-shrink-0">
                                    {item.icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[13px] font-semibold text-cream-100 group-hover:text-ember-300 transition-colors">
                                        {item.title}
                                    </div>
                                    <div className="text-[11.5px] text-cream-500 line-clamp-2 mt-0.5 leading-relaxed">
                                        {item.desc}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
            ))}

            {isTyping && <TypingIndicator />}

            <div ref={endRef} />
        </div>
    )
}
