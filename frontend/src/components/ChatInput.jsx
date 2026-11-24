import { useState, useRef } from 'react'
import { Send, Compass, Map, BookOpen, Gauge } from 'lucide-react'
import { useSession } from '../context/SessionContext.jsx'

const QUICK_ACTIONS = [
    { label: 'Set up my profile', value: 'start', icon: <Compass size={12} /> },
    { label: 'Show my roadmap', value: 'show roadmap', icon: <Map size={12} /> },
    { label: 'Free courses', value: 'free courses', icon: <BookOpen size={12} /> },
    { label: 'Skill gap check', value: 'skill gap check', icon: <Gauge size={12} /> },
]

export default function ChatInput() {
    const [text, setText] = useState('')
    const { send, isTyping } = useSession()
    const textareaRef = useRef(null)

    const handleSend = () => {
        const trimmed = text.trim()
        if (!trimmed || isTyping) return
        send(trimmed)
        setText('')
        textareaRef.current?.focus()
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="border-t border-[rgba(244,239,228,0.08)] px-4 py-3 sm:px-8 bg-[#14110d]/90 backdrop-blur-xl">
            <div className="flex gap-2 mb-2.5 overflow-x-auto pb-1 max-w-4xl mx-auto scrollbar-none">
                {QUICK_ACTIONS.map(a => (
                    <button
                        key={a.value}
                        onClick={() => { if (!isTyping) send(a.value) }}
                        disabled={isTyping}
                        className="px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap bg-[rgba(244,239,228,0.04)] border border-[rgba(244,239,228,0.1)] text-cream-500 hover:text-cream-100 hover:border-[rgba(232,137,47,0.45)] hover:bg-[rgba(232,137,47,0.07)] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                        <span className="text-ember-300">{a.icon}</span>
                        {a.label}
                    </button>
                ))}
            </div>

            <div className="max-w-4xl mx-auto flex items-end gap-2.5 rounded-2xl border border-[rgba(244,239,228,0.12)] bg-[#1c1813] p-1.5 focus-within:border-ember-400/60 transition-colors">
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about a career, roadmap, resume, or interview…"
                    disabled={isTyping}
                    rows={1}
                    className="flex-1 bg-transparent text-[14px] text-cream-100 placeholder:text-cream-500/70 px-3 py-2 outline-none resize-none max-h-32 leading-relaxed"
                />
                <button
                    onClick={handleSend}
                    disabled={!text.trim() || isTyping}
                    aria-label="Send message"
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                        text.trim() && !isTyping
                            ? 'bg-ember-400 text-[#1c1206] hover:bg-ember-300 active:scale-95'
                            : 'bg-[rgba(244,239,228,0.06)] text-cream-500/50 cursor-not-allowed'
                    }`}
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    )
}
