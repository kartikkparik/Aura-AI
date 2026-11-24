import { Bot } from 'lucide-react'

export default function TypingIndicator() {
    return (
        <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border border-[rgba(232,137,47,0.25)] bg-[rgba(232,137,47,0.07)]">
                <Bot size={14} className="text-ember-300" />
            </div>
            <div className="chat-bubble-bot flex items-center gap-1.5" style={{ padding: '0.8rem 1.1rem' }}>
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
            </div>
        </div>
    )
}
