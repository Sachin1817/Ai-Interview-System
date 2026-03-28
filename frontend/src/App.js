// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ResumeUpload from './components/resume/ResumeUpload';
import AIInterview from './components/interview/AIInterview';
import AssessmentHub from './components/assessment/AssessmentHub';
import CareerAdvisor from './components/career/CareerAdvisor';
import Analytics from './components/analytics/Analytics';

// New 3D Components
import ThreeDCard from './components/layout/ThreeDCard';
import FloatingBackground from './components/layout/FloatingBackground';

// ─── Dashboard ───
const Dashboard = () => {
    const { currentUser } = useAuth();
    const user = currentUser ? {
        name: currentUser.displayName || currentUser.email.split('@')[0],
        email: currentUser.email
    } : null;

    const modules = [
        { title: 'Resume Analyzer', desc: 'Upload PDF → AI detects skill gaps and builds your roadmap.', color: 'cyan', href: '/analyze', icon: '📄', badge: 'AI-Powered' },
        { title: 'AI Mock Interview', desc: '8 branches · 3 difficulty levels · 60s timer · Voice input.', color: 'blue', href: '/interview', icon: '🤖', badge: 'Live' },
        { title: 'Assessment Hub', desc: 'MCQs: Python, Java, DBMS, Aptitude, Grammar · 30s timer.', color: 'purple', href: '/assessment', icon: '📝', badge: '70+ Questions' },
        { title: 'Career Advisor', desc: 'Role match analysis, internship targets, certifications & roadmap.', color: 'emerald', href: '/career', icon: '🎯', badge: 'Personalized' },
        { title: 'Analytics', desc: 'Track score trends across interviews with Chart.js visualizations.', color: 'indigo', href: '/analytics', icon: '📊', badge: 'Charts' },
    ];

    return (
        <div className="min-h-screen p-6 flex flex-col items-center justify-center perspective-1000">
            <motion.div initial={{ opacity: 0, rotateX: -10, y: 50 }} animate={{ opacity: 1, rotateX: 0, y: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="glass-panel p-10 rounded-3xl max-w-5xl w-full relative z-10 preserve-3d">
                
                <div className="text-center mb-10 translate-z-10">
                    <motion.h1 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 mb-3 drop-shadow-2xl">
                        Hello, {user?.name || 'Student'}! 🚀
                    </motion.h1>
                    <p className="text-slate-400 text-lg">Your complete AI placement preparation platform. Let's get placed!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((m, i) => (
                        <Link key={m.title} to={m.href} className="flex">
                            <ThreeDCard className="w-full">
                                <div className={`glass-card h-full p-6 rounded-2xl cursor-pointer group border border-slate-700/50 hover:border-${m.color}-500/40 transition-all duration-300 transform-gpu`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-3xl floating-3d">{m.icon}</span>
                                        <span className={`text-xs bg-${m.color}-500/10 text-${m.color}-400 px-2 py-0.5 rounded-full border border-${m.color}-500/20 font-semibold`}>
                                            {m.badge}
                                        </span>
                                    </div>
                                    <h3 className={`text-lg font-bold text-${m.color}-400 mb-1.5 group-hover:text-${m.color}-300 transition-colors`}>{m.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{m.desc}</p>
                                </div>
                            </ThreeDCard>
                        </Link>
                    ))}
                </div>

                {!currentUser && (
                    <div className="mt-8 text-center pt-8 border-t border-slate-700/50">
                        <p className="text-slate-400 mb-4">Create a free account to save your progress and track improvements.</p>
                        <div className="flex gap-4 justify-center">
                            <Link to="/login" className="bg-slate-800 border border-slate-600 text-slate-300 px-8 py-3 rounded-xl hover:border-cyan-500/50 transition-all font-semibold">
                                Login
                            </Link>
                            <Link to="/register" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 px-8 py-3 rounded-xl font-black hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20">
                                Get Started Free →
                            </Link>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// ─── Nav ───
const Nav = () => {
    const { currentUser, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/analyze', label: 'Resume' },
        { to: '/interview', label: 'Interview' },
        { to: '/assessment', label: 'Assess' },
        { to: '/career', label: 'Career' },
        { to: '/analytics', label: 'Analytics' },
    ];

    return (
        <nav className="glass-panel mx-6 mt-5 mb-3 px-5 py-3 rounded-full flex justify-between items-center relative z-50">
            <Link to="/" className="font-black text-xl tracking-tight text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg p-1 px-2.5 text-slate-900 font-black text-sm shadow-md">AI</span>
                Placement
            </Link>
            <div className="flex gap-1 font-medium text-sm text-slate-400 items-center">
                {navLinks.map(link => (
                    <Link key={link.to} to={link.to}
                        className={`px-3 py-1.5 rounded-full transition-all ${isActive(link.to) ? 'bg-slate-700 text-white shadow-lg' : 'hover:text-white hover:bg-slate-800'}`}>
                        {link.label}
                    </Link>
                ))}
                {currentUser ? (
                    <button onClick={handleLogout}
                        className="ml-2 bg-red-500/10 text-red-400 px-3 py-1.5 rounded-full border border-red-500/20 hover:bg-red-500/20 transition-all text-xs">
                        Logout
                    </button>
                ) : (
                    <Link to="/register"
                        className="ml-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 px-4 py-1.5 rounded-full font-bold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md text-xs">
                        Get Started
                    </Link>
                )}
            </div>
        </nav>
    );
};

// ─── App ───
function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="bg-[#0f172a] min-h-screen text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
                    
                    {/* 3D Background */}
                    <FloatingBackground />

                    <div className="relative z-10 hidden sm:block">
                        <Nav />
                    </div>

                    <div className="relative z-10">
                        <AnimatePresence mode="wait">
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                
                                <Route path="/analyze" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
                                <Route path="/interview" element={<ProtectedRoute><AIInterview /></ProtectedRoute>} />
                                <Route path="/assessment" element={<ProtectedRoute><AssessmentHub /></ProtectedRoute>} />
                                <Route path="/career" element={<ProtectedRoute><CareerAdvisor /></ProtectedRoute>} />
                                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                            </Routes>
                        </AnimatePresence>
                    </div>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
