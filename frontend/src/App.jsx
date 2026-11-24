import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { SessionProvider } from './context/SessionContext.jsx'
import Navbar from './components/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import CareersPage from './pages/CareersPage.jsx'
import RoadmapsPage from './pages/RoadmapsPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ResumePage from './pages/ResumePage.jsx'
import ResumeBuilderPage from './pages/ResumeBuilderPage.jsx'
import DocEditorPage from './pages/DocCorrectorPage.jsx'
import InterviewPage from './pages/InterviewPage.jsx'

export default function App() {
    return (
        <SessionProvider>
            <BrowserRouter>
                <div className="bg-orb bg-orb-1" />
                <div className="bg-orb bg-orb-2" />
                <div className="bg-orb bg-orb-3" />

                <div className="relative z-10 min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-1">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/chat" element={<ChatPage />} />
                            <Route path="/resume" element={<ResumePage />} />
                            <Route path="/resume/build" element={<ResumeBuilderPage />} />
                            <Route path="/doc-editor" element={<DocEditorPage />} />
                            <Route path="/doc-corrector" element={<DocEditorPage />} />
                            <Route path="/interview" element={<InterviewPage />} />
                            <Route path="/careers" element={<CareersPage />} />
                            <Route path="/roadmaps" element={<RoadmapsPage />} />
                            <Route path="/about" element={<AboutPage />} />
                        </Routes>
                    </main>
                </div>

                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '12px',
                            fontFamily: 'Figtree, sans-serif',
                            fontSize: '0.88rem',
                            boxShadow: 'var(--shadow-md)'
                        },
                    }}
                />
            </BrowserRouter>
        </SessionProvider>
    )
}
