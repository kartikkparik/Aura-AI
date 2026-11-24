import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { auraApi } from '../api/auraApi.js'
import toast from 'react-hot-toast'

const SessionContext = createContext(null)

const CHATS_STORAGE_KEY = 'aura_chats_v1'
const ACTIVE_CHAT_KEY = 'aura_active_chat_id'
const MAX_CONVERSATIONS = 10
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function getInitialConversations() {
    try {
        const raw = localStorage.getItem(CHATS_STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        const now = Date.now()
        // Auto-purge conversations older than 7 days
        return parsed
            .filter(conv => conv && conv.id && (now - (conv.updatedAt || now) < RETENTION_MS))
            .slice(0, MAX_CONVERSATIONS)
    } catch (err) {
        console.warn('Recovered from corrupted localStorage chat data:', err)
        try { localStorage.removeItem(CHATS_STORAGE_KEY) } catch (_) {}
        return []
    }
}

function persistConversations(convList) {
    try {
        const bounded = convList.slice(0, MAX_CONVERSATIONS)
        localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(bounded))
    } catch (err) {
        console.warn('Failed to write chats to localStorage:', err)
    }
}

const DEFAULT_WELCOME = `Hi, I'm **Aura** — your personal career mentor. No login needed; just ask.

I can help across many fields:
• **Tech & AI** (Full-Stack, Data Science, DevOps, Cybersecurity)
• **Healthcare** (MBBS, Nursing, Pharmacy, Biotech)
• **Law & Civil Services** (UPSC, Judiciary, Corporate Law)
• **Business & Finance** (CA, CFA, Investment Banking)

Ask me about your career goal in English — or tell me a bit about yourself and I'll build a plan around it.`

export function SessionProvider({ children }) {
    const [conversations, setConversations] = useState(getInitialConversations)
    const [activeId, setActiveId] = useState(() => {
        try {
            return localStorage.getItem(ACTIVE_CHAT_KEY) || null
        } catch (_) {
            return null
        }
    })
    const [isTyping, setIsTyping] = useState(false)
    const [isConnected, setIsConnected] = useState(true)
    const initializedRef = useRef(false)

    // Find the currently active conversation
    const currentConv = conversations.find(c => c.id === activeId) || null
    const messages = currentConv?.messages || []
    const sessionInfo = currentConv?.session_data || null

    // Helper to generate a new clean conversation object
    const makeNewConversation = (customId = null, initialMessage = null) => {
        const id = customId || 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
        const welcome = initialMessage || DEFAULT_WELCOME
        return {
            id,
            title: 'New Conversation',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: [{
                id: 'welcome-' + Date.now(),
                role: 'assistant',
                content: welcome,
                timestamp: new Date().toISOString()
            }],
            session_data: {
                name: null,
                current_semester: 1,
                career_goal: null,
                known_languages: [],
                weekly_study_hours: 10,
                profiling_step: 0,
                profiling_complete: false
            }
        }
    }

    // Create a new conversation
    const createNewChat = useCallback(async () => {
        let newConv
        try {
            const data = await auraApi.newSession()
            newConv = makeNewConversation(data.session_id, data.message)
            if (data.session) {
                newConv.session_data = { ...newConv.session_data, ...data.session }
            }
        } catch (_) {
            newConv = makeNewConversation()
        }

        setConversations(prev => {
            const updated = [newConv, ...prev.filter(c => c.id !== newConv.id)].slice(0, MAX_CONVERSATIONS)
            persistConversations(updated)
            return updated
        })

        setActiveId(newConv.id)
        try {
            localStorage.setItem(ACTIVE_CHAT_KEY, newConv.id)
        } catch (_) {}

        return newConv
    }, [])

    // Initialize session on mount
    const initSession = useCallback(async () => {
        if (initializedRef.current) return
        initializedRef.current = true

        if (conversations.length > 0) {
            const match = conversations.find(c => c.id === activeId)
            if (match) {
                return
            }
            // Fall back to the first available conversation
            setActiveId(conversations[0].id)
            try {
                localStorage.setItem(ACTIVE_CHAT_KEY, conversations[0].id)
            } catch (_) {}
        } else {
            await createNewChat()
        }
    }, [conversations, activeId, createNewChat])

    // Switch active conversation
    const switchSession = (targetId) => {
        if (targetId === activeId) return
        setActiveId(targetId)
        try {
            localStorage.setItem(ACTIVE_CHAT_KEY, targetId)
        } catch (_) {}
    }

    // Delete single conversation
    const deleteChatSession = (targetId) => {
        setConversations(prev => {
            const remaining = prev.filter(c => c.id !== targetId)
            persistConversations(remaining)

            if (targetId === activeId) {
                if (remaining.length > 0) {
                    setActiveId(remaining[0].id)
                    try { localStorage.setItem(ACTIVE_CHAT_KEY, remaining[0].id) } catch (_) {}
                } else {
                    // Create a fresh conversation if all were deleted
                    const fresh = makeNewConversation()
                    persistConversations([fresh])
                    setActiveId(fresh.id)
                    try { localStorage.setItem(ACTIVE_CHAT_KEY, fresh.id) } catch (_) {}
                    return [fresh]
                }
            }
            return remaining
        })
        toast.success('Conversation removed')
    }

    // Clear all history immediately
    const clearAllChats = () => {
        try {
            localStorage.removeItem(CHATS_STORAGE_KEY)
            localStorage.removeItem(ACTIVE_CHAT_KEY)
        } catch (_) {}

        const fresh = makeNewConversation()
        setConversations([fresh])
        setActiveId(fresh.id)
        persistConversations([fresh])
        try {
            localStorage.setItem(ACTIVE_CHAT_KEY, fresh.id)
        } catch (_) {}
        toast.success('All conversation history cleared')
    }

    // Send a message
    const send = useCallback(async (text) => {
        const trimmed = (text || '').trim()
        if (!trimmed || isTyping) return

        let currentId = activeId
        let conv = conversations.find(c => c.id === currentId)

        if (!conv) {
            conv = makeNewConversation()
            currentId = conv.id
            setActiveId(currentId)
            try { localStorage.setItem(ACTIVE_CHAT_KEY, currentId) } catch (_) {}
        }

        const userMsg = {
            id: 'user-' + Date.now(),
            role: 'user',
            content: trimmed,
            timestamp: new Date().toISOString()
        }

        // Build title if conversation is brand new
        const newTitle = (conv.title === 'New Conversation' || !conv.title)
            ? (trimmed.length > 32 ? trimmed.slice(0, 32) + '…' : trimmed)
            : conv.title

        const optimisticMessages = [...(conv.messages || []), userMsg]

        // Update conversation state optimistically
        setConversations(prev => {
            const other = prev.filter(c => c.id !== currentId)
            const updatedConv = {
                ...conv,
                title: newTitle,
                updatedAt: Date.now(),
                messages: optimisticMessages
            }
            const updatedList = [updatedConv, ...other].slice(0, MAX_CONVERSATIONS)
            persistConversations(updatedList)
            return updatedList
        })

        setIsTyping(true)

        try {
            // Send recent history (last 10 messages) and session_data to stateless backend
            const historyForApi = optimisticMessages.slice(-10).map(m => ({
                role: m.role,
                content: m.content
            }))

            const data = await auraApi.sendMessage(currentId, trimmed, historyForApi, conv.session_data || {})

            const botMsg = {
                id: 'bot-' + Date.now(),
                role: 'assistant',
                content: data.message || 'I could not generate a response. Please try again.',
                timestamp: data.timestamp || new Date().toISOString()
            }

            setConversations(prev => {
                const target = prev.find(c => c.id === currentId)
                if (!target) return prev
                const other = prev.filter(c => c.id !== currentId)
                const finalConv = {
                    ...target,
                    updatedAt: Date.now(),
                    messages: [...target.messages, botMsg],
                    session_data: data.session ? { ...target.session_data, ...data.session } : target.session_data
                }
                const updatedList = [finalConv, ...other].slice(0, MAX_CONVERSATIONS)
                persistConversations(updatedList)
                return updatedList
            })
            setIsConnected(true)
        } catch (err) {
            setIsConnected(false)
            const errMsg = err.message?.includes('429')
                ? 'Rate limit reached — wait a moment, then try again.'
                : 'Connection problem — check your internet and try again.'

            const errorMsg = {
                id: 'err-' + Date.now(),
                role: 'assistant',
                content: errMsg,
                timestamp: new Date().toISOString()
            }

            setConversations(prev => {
                const target = prev.find(c => c.id === currentId)
                if (!target) return prev
                const other = prev.filter(c => c.id !== currentId)
                const finalConv = {
                    ...target,
                    messages: [...target.messages, errorMsg]
                }
                const updatedList = [finalConv, ...other].slice(0, MAX_CONVERSATIONS)
                persistConversations(updatedList)
                return updatedList
            })
        } finally {
            setIsTyping(false)
        }
    }, [activeId, conversations, isTyping])

    // Adapt for components expecting `sessionsList`
    const sessionsList = conversations.map(c => ({
        session_id: c.id,
        title: c.title,
        updated_at: c.updatedAt,
        last_message: c.messages?.[c.messages.length - 1]?.content || ''
    }))

    return (
        <SessionContext.Provider value={{
            sessionId: activeId,
            sessionInfo,
            sessionsList,
            messages,
            isTyping,
            isConnected,
            isLoadingHistory: false,
            initSession,
            createNewChat,
            switchSession,
            deleteChatSession,
            clearAllChats,
            send
        }}>
            {children}
        </SessionContext.Provider>
    )
}

export const useSession = () => {
    const ctx = useContext(SessionContext)
    if (!ctx) throw new Error('useSession must be used within SessionProvider')
    return ctx
}
