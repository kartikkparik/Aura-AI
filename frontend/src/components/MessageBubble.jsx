import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot, User, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MessageBubble({ message }) {
    const isUser = message.role === 'user'
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content)
        setCopied(true)
        toast.success('Copied to clipboard', { duration: 1800 })
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={`group relative flex gap-3 items-start ${isUser ? 'flex-row-reverse' : ''} animate-[slideUp_0.25s_ease-out]`}>
            <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5"
                style={{
                    background: isUser ? 'var(--primary)' : 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                {isUser
                    ? <User size={14} color="var(--primary-ink)" />
                    : <Bot size={14} color="var(--primary)" />
                }
            </div>

            <div className={`relative ${isUser ? 'chat-bubble-user' : 'chat-bubble-bot'}`} style={{ maxWidth: '82%' }}>
                {isUser ? (
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--primary-ink)', margin: 0 }}>
                        {message.content}
                    </p>
                ) : (
                    <>
                        <div className="markdown-content" style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                            </ReactMarkdown>
                        </div>
                        <div className="flex justify-end mt-2 pt-1.5 border-t border-[rgba(244,239,228,0.08)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                            <button
                                onClick={handleCopy}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                                style={{ background: 'rgba(255,255,255,0.04)' }}
                                title="Copy response"
                            >
                                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                <span>{copied ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
