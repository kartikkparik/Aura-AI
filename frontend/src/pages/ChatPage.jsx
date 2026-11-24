import { useEffect, useState } from 'react'
import ChatWindow from '../components/ChatWindow.jsx'
import ChatInput from '../components/ChatInput.jsx'
import { useSession } from '../context/SessionContext.jsx'
import {
    Plus, MessageSquare, Trash2, Target, ChevronLeft, Menu, Shield, User
} from 'lucide-react'

const ROLE_DISPLAY = {
    data_scientist: 'Data Scientist',
    ml_engineer: 'ML Engineer',
    ai_engineer: 'AI Engineer',
    full_stack_developer: 'Full Stack Developer',
    cyber_security_analyst: 'Cyber Security Analyst',
}

export default function ChatPage() {
    const {
        initSession,
        sessionInfo,
        sessionId,
        sessionsList,
        createNewChat,
        switchSession,
        deleteChatSession,
        clearAllChats,
        isConnected,
        isLoadingHistory
    } = useSession()

    const [sidebarOpen, setSidebarOpen] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
    )

    useEffect(() => {
        initSession()
    }, [initSession])

    const profile = sessionInfo?.profiling_complete ? sessionInfo : null
    const goalLabel = profile ? (ROLE_DISPLAY[profile.career_goal] || profile.career_goal) : null
    const firstName = profile?.name ? profile.name.split(' ')[0] : null

    return (
        <div className="flex relative overflow-hidden bg-[#14110d]" style={{ height: 'calc(100vh - 64px)' }}>
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden absolute top-3 left-3 z-30 p-2.5 rounded-xl text-cream-300 shadow-md bg-[#1c1813] border border-[rgba(244,239,228,0.14)]"
                    title="Open chat history"
                    aria-label="Open chat history"
                >
                    <Menu size={18} />
                </button>
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-40
                    flex flex-col w-72 flex-shrink-0 transition-transform duration-300 ease-in-out
                    bg-[#171410] border-r border-[rgba(244,239,228,0.08)] p-4
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-ember-400 flex items-center justify-center">
                            <span className="font-serif italic text-[#1c1206] text-sm leading-none pt-0.5">A</span>
                        </div>
                        <div>
                            <div className="font-serif text-[15px] text-cream-100 leading-tight">Aura</div>
                            <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#63b57a]' : 'bg-[#d96c3f]'}`} />
                                <span className="text-[10.5px] text-cream-500">
                                    {isConnected ? 'Online' : 'Reconnecting…'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 -mr-1 text-cream-500 hover:text-cream-100"
                        aria-label="Close chat history"
                    >
                        <ChevronLeft size={18} />
                    </button>
                </div>

                {/* New chat */}
                <button
                    onClick={createNewChat}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[13px] font-semibold bg-ember-400 text-[#1c1206] hover:bg-ember-300 transition-colors mb-5"
                >
                    <Plus size={15} />
                    <span>New conversation</span>
                </button>

                {/* History */}
                <div className="flex-1 overflow-y-auto space-y-1 mb-3 pr-1" style={{ minHeight: 0 }}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cream-500 px-2 py-1.5">
                        Recent chats
                    </div>

                    {sessionsList.length === 0 ? (
                        <div className="text-center py-8 px-2 text-xs text-cream-500 leading-relaxed">
                            No conversations yet. They stay private in this browser.
                        </div>
                    ) : (
                        sessionsList.map(s => {
                            const isActive = s.session_id === sessionId
                            return (
                                <div
                                    key={s.session_id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => switchSession(s.session_id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            switchSession(s.session_id)
                                        }
                                    }}
                                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] cursor-pointer transition-colors ${
                                        isActive
                                            ? 'bg-[rgba(232,137,47,0.12)] text-cream-100 font-medium border border-[rgba(232,137,47,0.25)]'
                                            : 'text-cream-500 hover:bg-[rgba(244,239,228,0.04)] hover:text-cream-100 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <MessageSquare size={13} className={`flex-shrink-0 ${isActive ? 'text-ember-300' : 'text-cream-500'}`} />
                                        <span className="truncate">{s.title || 'Conversation'}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteChatSession(s.session_id)
                                        }}
                                        className="sm:opacity-0 sm:group-hover:opacity-100 p-1.5 -mr-1 hover:text-[#e07b6a] text-cream-500 rounded transition-opacity"
                                        title="Delete chat"
                                        aria-label="Delete chat"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            )
                        })
                    )}

                    {/* Profile card — the workspace's memory */}
                    {profile && (
                        <div className="mt-4 rounded-xl border border-[rgba(244,239,228,0.1)] bg-[rgba(244,239,228,0.03)] p-3.5">
                            <div className="flex items-center gap-2.5 mb-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#2a241c] border border-[rgba(232,137,47,0.35)] flex items-center justify-center flex-shrink-0">
                                    <span className="font-serif italic text-ember-300 text-sm">
                                        {(firstName || 'Y').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[13px] font-semibold text-cream-100 truncate">
                                        {profile.name || 'You'}
                                    </div>
                                    <div className="text-[11px] text-cream-500">
                                        Sem {profile.current_semester} · {profile.weekly_study_hours}h/week
                                    </div>
                                </div>
                            </div>
                            {goalLabel && (
                                <div className="flex items-center gap-1.5 text-[12px] text-ember-300 font-medium">
                                    <Target size={12} className="flex-shrink-0" />
                                    <span className="truncate">Goal: {goalLabel}</span>
                                </div>
                            )}
                            <p className="mt-2 text-[10.5px] leading-relaxed text-cream-500">
                                This profile personalizes every answer and tool in Aura.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-[rgba(244,239,228,0.08)]">
                    <div className="flex items-center gap-1.5 text-[11px] text-cream-500 px-1">
                        <Shield size={12} className="text-cream-500" />
                        <span>Stored privately in this browser</span>
                    </div>
                    {sessionsList.length > 0 && (
                        <button
                            onClick={() => {
                                if (window.confirm('Clear all local chat history from this browser?')) {
                                    clearAllChats()
                                }
                            }}
                            className="w-full mt-1.5 py-1.5 text-[11px] text-cream-500 hover:text-[#e07b6a] transition-colors text-center"
                        >
                            Clear all history
                        </button>
                    )}
                </div>
            </aside>

            {/* Main chat area */}
            <div className="flex-1 flex flex-col relative" style={{ minWidth: 0 }}>
                {isLoadingHistory ? (
                    <div className="flex-1 flex items-center justify-center text-cream-500 text-sm">
                        <div className="text-center">
                            <span className="font-serif italic text-2xl text-cream-100 block mb-2">Aura</span>
                            Opening your conversation…
                        </div>
                    </div>
                ) : (
                    <>
                        {profile && (
                            <div className="flex items-center gap-2 px-5 sm:px-8 py-2.5 border-b border-[rgba(244,239,228,0.07)] bg-[rgba(232,137,47,0.04)]">
                                <User size={12} className="text-ember-400 flex-shrink-0" />
                                <p className="text-[11.5px] text-cream-500 truncate">
                                    Mentoring <span className="text-cream-100 font-medium">{firstName}</span>
                                    {goalLabel && <> toward <span className="text-ember-300 font-medium">{goalLabel}</span></>}
                                    {' '}· Sem {profile.current_semester} · {profile.weekly_study_hours}h/week available
                                </p>
                            </div>
                        )}
                        <ChatWindow />
                        <ChatInput />
                    </>
                )}
            </div>
        </div>
    )
}
