import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { 
    User, LogOut, ChevronDown, Settings, Mail, UserCircle, Menu, X, 
    Home, FileText, MessageSquare, ShieldCheck, Compass, BarChart3, Code2
} from 'lucide-react';

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
import ResumeBuilder from './components/resume/ResumeBuilder';
import CodingInterview from './components/interview/CodingInterview';

// New 3D Components
import ThreeDCard from './components/layout/ThreeDCard';
import FloatingBackground from './components/layout/FloatingBackground';
import ThemeToggle from './components/layout/ThemeToggle';

import ProfilePage from './pages/ProfilePage';
import CareerChatbot from './components/career/CareerChatbot';

// ─── Dashboard ───
const Dashboard = () => {
    const { currentUser } = useAuth();
    const user = currentUser ? {
        name: currentUser.displayName || currentUser.email.split('@')[0],
        email: currentUser.email
    } : null;

    const categories = [
        {
            name: "Resume & Career Center",
            modules: [
                { title: 'ATS Resume Builder', desc: '8-step professional wizard with real-time AI optimization.', color: 'blue', href: '/resume-builder', icon: '🚀', badge: 'New Module' },
                { title: 'Resume Analyzer', desc: 'Upload PDF → AI detects skill gaps and builds your roadmap.', color: 'cyan', href: '/analyze', icon: '📄', badge: 'AI-Powered' },
                { title: 'Career Advisor', desc: 'Role match analysis, internship targets, certifications & roadmap.', color: 'emerald', href: '/career', icon: '🎯', badge: 'Personalized' },
            ]
        },
        {
            name: "Interactive AI Practice",
            modules: [
                { title: 'AI Mock Interview', desc: '8 branches · 3 difficulty levels · 60s timer · Voice input.', color: 'blue', href: '/interview', icon: '🤖', badge: 'Live' },
                { title: 'AI Coding Interview', desc: 'Real-time multi-language execution · AI feedback · Role-based.', color: 'cyan', href: '/coding-interview', icon: '💻', badge: 'New Module' },
                { title: 'Assessment Hub', desc: 'MCQs: Python, Java, DBMS, Aptitude, Grammar · 30s timer.', color: 'purple', href: '/assessment', icon: '📝', badge: '70+ Questions' },
            ]
        },
        {
            name: "Growth & Analytics",
            modules: [
                { title: 'Analytics', desc: 'Track score trends across interviews with Chart.js visualizations.', color: 'indigo', href: '/analytics', icon: '📊', badge: 'Charts' },
            ]
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen pt-60 pb-20 px-6 relative overflow-visible">
            {/* Background Decorations */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Hero Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-24"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-block px-4 py-1.5 mb-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-[0.3em]"
                    >
                        Next-Gen AI Platform
                    </motion.div>
                    
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter leading-[1.1]">
                        <span className="text-light-text dark:text-white">Master your </span>
                        <span className="hero-gradient drop-shadow-2xl">
                            Future
                        </span>
                    </h1>
                    
                    <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl lg:text-2xl font-medium max-w-3xl mx-auto leading-relaxed px-4">
                        Harness the power of AI to build world-class resumes, ace technical interviews, and track your career growth in one unified workspace.
                    </p>
                </motion.div>

                {/* Categories */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-32"
                >
                    {categories.map((category) => (
                        <div key={category.name} className="relative">
                            <h2 className="section-heading mb-12">{category.name}</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch">
                                {category.modules.map((m) => (
                                    <motion.div key={m.title} variants={itemVariants} className="group relative">
                                        <Link to={m.href} className="block h-full card-glow">
                                            <ThreeDCard className="h-full">
                                                <div className="glass-card h-full p-10 flex flex-col relative group-hover:bg-white/50 dark:group-hover:bg-white/10 transition-colors duration-500">
                                                    {/* Premium Shine Effect */}
                                                    <div className="shine-effect" />
                                                    
                                                    <div className="flex items-start justify-between mb-10">
                                                        <div className="text-5xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-950 p-6 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/20 transition-all duration-500 float-up">
                                                            {m.icon}
                                                        </div>
                                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 shadow-lg`}>
                                                            {m.badge}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex-grow lift-content">
                                                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                                                            {m.title}
                                                        </h3>
                                                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium text-base group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors duration-500">
                                                            {m.desc}
                                                        </p>
                                                    </div>

                                                    <div className="mt-12 flex items-center justify-between group/btn">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 group-hover:text-cyan-400 transition-colors">
                                                            Explore Module
                                                        </span>
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all duration-300">
                                                            <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </ThreeDCard>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </motion.div>

                {!currentUser && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-24 text-center glass-panel p-12 rounded-[3rem] border-white/5"
                    >
                        <h3 className="text-2xl font-bold text-white mb-2">Ready to secure your dream role?</h3>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">Create a free account to save your progress and track improvements across all modules.</p>
                        <div className="flex gap-4 justify-center">
                            <Link to="/login" className="bg-white/5 border border-white/10 text-white px-10 py-4 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm">
                                Login
                            </Link>
                            <Link to="/register" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 px-10 py-4 rounded-2xl font-black hover:from-cyan-400 hover:to-blue-500 transition-all shadow-2xl shadow-cyan-500/20 text-sm">
                                Get Started Free
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// ─── Nav ───
const Nav = () => {
    const { currentUser, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = React.useRef(null);

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        try {
            await logout();
            setDropdownOpen(false);
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = [
        { to: '/', label: 'Home', icon: <Home className="w-5 h-5" /> },
        { to: '/resume-builder', label: 'Builder', icon: <FileText className="w-5 h-5" /> },
        { to: '/analyze', label: 'Analyzer', icon: <FileText className="w-5 h-5" /> },
        { to: '/interview', label: 'Interview', icon: <MessageSquare className="w-5 h-5" /> },
        { to: '/coding-interview', label: 'Coding', icon: <Code2 className="w-5 h-5" /> },
        { to: '/assessment', label: 'Assess', icon: <ShieldCheck className="w-5 h-5" /> },
        { to: '/career', label: 'Career', icon: <Compass className="w-5 h-5" /> },
        { to: '/analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> }
    ];

    const initials = currentUser?.displayName 
        ? currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase() 
        : currentUser?.email?.substring(0, 1).toUpperCase() || 'U';

    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <>
        <nav className="fixed top-8 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl px-8 py-4 glass-panel rounded-[2rem] flex justify-between items-center z-[100] border-white/5 shadow-2xl">
            <div className="flex items-center gap-6">
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-3 text-slate-500 dark:text-slate-400 hover:text-cyan-500 transition-colors bg-white dark:bg-white/5 rounded-2xl border border-white/10"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </motion.button>
                
                <Link to="/" className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="bg-premium-gradient rounded-xl p-1.5 px-3 text-slate-950 font-black text-sm shadow-glow-cyan">AI</div>
                    <span className="hidden sm:block">Placement</span>
                </Link>
            </div>


            <div className="flex items-center gap-6">
                <ThemeToggle />
                {currentUser ? (
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 hover:shadow-glow-cyan transition-all group"
                        >
                            <div className="w-9 h-9 rounded-xl bg-premium-gradient flex items-center justify-center text-slate-950 font-black text-xs shadow-inner">
                                {initials}
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 group-hover:text-cyan-400 hidden lg:block">
                                {currentUser.displayName || currentUser.email.split('@')[0]}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-500 ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                    className="absolute right-0 mt-4 w-72 glass-panel rounded-3xl border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-3 z-[100]"
                                >
                                    <div className="px-5 py-4 border-b border-white/5 mb-2 text-left bg-white/10 dark:bg-white/5 rounded-2xl">
                                        <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tighter">{currentUser.displayName || 'Placement User'}</p>
                                        <p className="text-[10px] text-slate-500 font-bold truncate mt-0.5">{currentUser.email}</p>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <Link to="/profile" onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-500 hover:bg-cyan-500/10 transition-all">
                                            <UserCircle className="w-5 h-5" />
                                            <span>Profile Settings</span>
                                        </Link>

                                        <Link to="/analytics" onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-purple-500 hover:bg-purple-500/10 transition-all">
                                            <BarChart3 className="w-5 h-5" />
                                            <span>Performance</span>
                                        </Link>
                                    </div>

                                    <div className="h-px bg-white/5 my-2 mx-3" />
                                    
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-black text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>SIGN OUT</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <Link to="/login" className="text-sm font-black uppercase tracking-widest text-slate-500 hover:text-cyan-500 px-4 py-2 transition-colors">
                            Login
                        </Link>
                        <Link to="/register" className="premium-button !py-2.5 !px-6 !text-xs">
                            Get Started
                        </Link>
                    </div>
                )}
            </div>
        </nav>
        
        {/* Side-Drawer Navigation */}
        <AnimatePresence>
            {mobileMenuOpen && (
                <>
                {/* Backdrop Overlay */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm cursor-pointer"
                />
                
                {/* Side Drawer */}
                <motion.div 
                    initial={{ x: -400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -400, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed left-0 top-0 bottom-0 z-50 w-full max-w-[20rem] sm:max-w-[24rem] h-full bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)] p-8 flex flex-col"
                >
                    <div className="flex items-center justify-between mb-12">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="font-black text-xl tracking-tight text-white flex items-center gap-2">
                            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg p-1 px-2.5 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/20">AI</div>
                            <span>Placement</span>
                        </Link>
                        <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        {navLinks.map((link, idx) => (
                            <Link 
                                key={link.to} 
                                to={link.to}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`group flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive(link.to) ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <div className={`p-2 rounded-xl transition-colors duration-300 ${isActive(link.to) ? 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] text-slate-950' : 'bg-slate-800/50 group-hover:bg-cyan-500 group-hover:text-slate-950'}`}>
                                    {link.icon}
                                </div>
                                <span className="text-lg font-bold tracking-wide">
                                    {link.label}
                                </span>
                                {isActive(link.to) && (
                                    <motion.div layoutId="activeNav" className="absolute left-0 w-1 y-full bg-cyan-400 rounded-r-full" style={{ height: '60%', top: '20%' }} />
                                )}
                            </Link>
                        ))}
                    </div>

                    <div className="mt-auto pt-8 border-t border-white/5">
                        <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Current Tier</p>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold text-sm">Professional Plan</span>
                                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-black border border-cyan-500/20">PRO</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
                </>
            )}
        </AnimatePresence>
        </>
    );
};

// ─── App ───
function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <div className="bg-light-bg dark:bg-dark-bg min-h-screen text-light-text dark:text-slate-100 font-sans selection:bg-cyan-500/30 transition-colors duration-300 overflow-x-hidden">
                        
                        {/* 3D Background */}
                        <FloatingBackground />

                        <div className="relative z-[60]">
                            <Nav />
                        </div>

                        <div className="relative z-10">
                            <AnimatePresence mode="wait">
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />
                                    
                                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                                    <Route path="/analyze" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
                                    <Route path="/interview" element={<ProtectedRoute><AIInterview /></ProtectedRoute>} />
                                    <Route path="/coding-interview" element={<ProtectedRoute><CodingInterview /></ProtectedRoute>} />
                                    <Route path="/assessment" element={<ProtectedRoute><AssessmentHub /></ProtectedRoute>} />
                                    <Route path="/career" element={<ProtectedRoute><CareerAdvisor /></ProtectedRoute>} />
                                    <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                                    <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
                                </Routes>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Global Floating AI Assistant (Red Mark Position) */}
                    <CareerChatbot 
                        isInline={false}
                        context={{
                            isGlobal: true,
                            branch: "General"
                        }}
                    />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
