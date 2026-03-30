import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { 
    User, LogOut, ChevronDown, Settings, Mail, UserCircle, Menu, X, 
    Home, FileText, MessageSquare, ShieldCheck, Compass, BarChart3 
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
        <div className="min-h-screen py-10 px-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Hero Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10 md:mb-16"
                >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight leading-tight">
                        <span className="text-light-text dark:text-white">Hello, </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-sm">
                            {user?.name || 'Student'}!
                        </span>
                        <motion.span 
                            animate={{ rotate: [0, 20, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="inline-block ml-2 md:ml-4"
                        >
                            🚀
                        </motion.span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg lg:text-xl font-medium max-w-2xl mx-auto leading-relaxed px-4">
                        Your complete AI placement preparation platform. <br className="hidden md:block"/>
                        <span className="text-accent dark:text-cyan-400/80">Select a module below to start your journey.</span>
                    </p>
                </motion.div>

                {/* Categories */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-16"
                >
                    {categories.map((category) => (
                        <div key={category.name}>
                            <h2 className="section-heading">{category.name}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 items-stretch">
                                {category.modules.map((m) => (
                                    <motion.div key={m.title} variants={itemVariants} className="h-full">
                                        <Link to={m.href} className="block h-full group">
                                            <ThreeDCard className="h-full">
                                                <div className={`glass-card h-full p-8 rounded-[2rem] border border-white/5 dark:border-white/5 group-hover:border-${m.color}-500/50 transition-all duration-500 relative overflow-hidden bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl group-hover:shadow-[0_0_50px_rgba(34,211,238,0.15)]`}>
                                                    {/* Premium Shine Effect */}
                                                    <div className="shine-effect" />

                                                    {/* Magnetic Glow background */}
                                                    <div className={`absolute -inset-px bg-gradient-to-br from-${m.color}-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                                                    
                                                    <div className="relative z-10 h-full flex flex-col">
                                                        <div className="flex items-start justify-between mb-8">
                                                            <div className="float-up text-4xl bg-white dark:bg-slate-950/80 p-5 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 group-hover:border-cyan-500/30 group-hover:shadow-cyan-500/20 transition-all duration-500">
                                                                {m.icon}
                                                            </div>
                                                            <span className={`text-[10px] uppercase tracking-[0.2em] bg-${m.color}-500/10 text-${m.color}-400 px-4 py-1.5 rounded-full border border-${m.color}-500/20 font-black shadow-lg`}>
                                                                {m.badge}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="lift-content flex-grow">
                                                            <h3 className={`text-2xl md:text-3xl font-black text-light-text dark:text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-light-text dark:group-hover:from-white group-hover:to-${m.color}-400 transition-all duration-500`}>
                                                                {m.title}
                                                            </h3>
                                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-base md:text-lg group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-500">
                                                                {m.desc}
                                                            </p>
                                                        </div>

                                                        {/* Animated Footer Link */}
                                                        <div className="mt-10 flex items-center gap-4 text-xs font-black text-slate-500 group-hover:text-white transition-all duration-500 uppercase tracking-[0.3em]">
                                                            <span className="opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
                                                                Launch
                                                            </span>
                                                            <div className="h-px flex-1 bg-slate-800/50 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-transparent transition-all duration-700" />
                                                            <motion.div 
                                                                animate={{ x: [0, 5, 0] }}
                                                                transition={{ repeat: Infinity, duration: 2 }}
                                                                className="group-hover:text-cyan-400"
                                                            >
                                                                →
                                                            </motion.div>
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
        <nav className="glass-panel mx-4 md:mx-6 mt-5 mb-3 px-4 md:px-6 py-3 rounded-full flex justify-between items-center relative z-50 border border-white/5 shadow-2xl">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <Link to="/" className="font-black text-lg md:text-xl tracking-tight text-light-text dark:text-white flex items-center gap-2">
                    <div className="bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg p-1 px-2 md:px-2.5 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-cyan-500/20">AI</div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-light-text dark:from-white to-slate-400">Placement</span>
                </Link>
            </div>


            <div className="flex items-center gap-4">
                <ThemeToggle />
                {currentUser ? (
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 transition-all group"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-xs shadow-inner">
                                {initials}
                            </div>
                            <span className="text-xs font-semibold text-slate-300 group-hover:text-white hidden sm:block">
                                {currentUser.displayName || currentUser.email.split('@')[0]}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-64 glass-panel rounded-2xl border border-white/10 shadow-2xl p-2 z-[100]"
                                >
                                    <div className="px-4 py-3 border-b border-white/5 mb-1 text-left">
                                        <p className="text-sm font-bold text-white truncate">{currentUser.displayName || 'Placement User'}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                                    </div>
                                    
                                    <Link to="/profile" onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                                        <User className="w-4 h-4 text-cyan-400" />
                                        <span>My Profile</span>
                                    </Link>

                                    <Link to="/resume-builder" onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                                        <div className="w-4 h-4 flex items-center justify-center text-cyan-400">🚀</div>
                                        <span>Resume Builder</span>
                                    </Link>
                                    
                                    <Link to="/analytics" onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                                        <div className="w-4 h-4 flex items-center justify-center text-purple-400">📊</div>
                                        <span>Performance</span>
                                    </Link>

                                    <div className="h-px bg-white/5 my-1 mx-2" />
                                    
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all cursor-pointer relative z-[110]"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <Link to="/login" className="text-sm font-semibold text-slate-400 hover:text-white px-3 py-2 transition-colors">
                            Login
                        </Link>
                        <Link to="/register" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 px-5 py-2 rounded-full font-bold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 text-xs">
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
