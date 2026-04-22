import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Clock, ChevronRight, Send, Trophy, Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical', 'Aerospace'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

// Branch → Job roles + topics covered
const BRANCH_ROLES = {
    CSE: {
        roles: ['Software Engineer', 'Full Stack Developer', 'Data Scientist', 'Backend Engineer', 'DevOps Engineer', 'ML Engineer'],
        topics: ['Data Structures', 'OOP', 'DBMS', 'OS', 'Networking', 'System Design'],
        color: 'blue',
    },
    IT: {
        roles: ['Cloud Engineer', 'Network Engineer', 'Cybersecurity Analyst', 'IT Consultant', 'System Admin'],
        topics: ['Networking', 'Cloud (AWS/Azure)', 'Security', 'Linux', 'IT Infrastructure'],
        color: 'cyan',
    },
    ECE: {
        roles: ['Embedded Engineer', 'VLSI Designer', 'IoT Engineer', 'Signal Processing Engineer', 'RF Engineer'],
        topics: ['Embedded C', 'Microcontrollers', 'Digital Electronics', 'VLSI', 'Signal Processing'],
        color: 'orange',
    },
    EEE: {
        roles: ['Power Systems Engineer', 'Control Engineer', 'Electrical Design Engineer', 'PLC Programmer'],
        topics: ['Power Systems', 'Electrical Machines', 'Control Systems', 'MATLAB/Simulink', 'Smart Grid'],
        color: 'yellow',
    },
    Mechanical: {
        roles: ['Design Engineer', 'Manufacturing Engineer', 'Automotive Engineer', 'Thermal Engineer', 'CAD Engineer'],
        topics: ['Engineering Drawing', 'Thermodynamics', 'SolidWorks/CATIA', 'FEA', 'Manufacturing Processes'],
        color: 'red',
    },
    Civil: {
        roles: ['Structural Engineer', 'Site Engineer', 'BIM Engineer', 'Urban Planner', 'Construction Manager'],
        topics: ['Structural Analysis', 'AutoCAD', 'STAAD Pro', 'RCC Design', 'Survey'],
        color: 'emerald',
    },
    Chemical: {
        roles: ['Process Engineer', 'Chemical Plant Engineer', 'Safety Engineer', 'R&D Chemist'],
        topics: ['Process Design', 'Thermodynamics', 'Mass Transfer', 'ASPEN/HYSYS', 'Reaction Engineering'],
        color: 'purple',
    },
    Aerospace: {
        roles: ['Aerospace Engineer', 'Avionics Engineer', 'CFD Analyst', 'Propulsion Engineer', 'Structures Engineer'],
        topics: ['Aerodynamics', 'Flight Mechanics', 'CFD', 'Propulsion', 'Composite Materials'],
        color: 'indigo',
    },
};

// ── AI Loading Overlay ──
const AILoadingOverlay = () => {
    const statuses = [
        "Analyzing Job Role Requirements...",
        "Synthesizing Technical Questions...",
        "Calibrating Difficulty levels...",
        "Preparing AI Interviewer Personality...",
        "Initializing NLP Evaluation Core..."
    ];
    const [msgIdx, setMsgIdx] = useState(0);

    useEffect(() => {
        const i = setInterval(() => setMsgIdx(p => (p + 1) % statuses.length), 1200);
        return () => clearInterval(i);
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-2xl">
            <div className="relative w-64 h-64 mb-16">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-[3rem] border-2 border-cyan-500/20 shadow-[0_0_80px_rgba(34,211,238,0.1)]" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-8 rounded-[2rem] border-2 border-purple-500/20" />
                <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-20 bg-premium-gradient rounded-3xl flex items-center justify-center shadow-glow-primary">
                    <span className="text-5xl drop-shadow-2xl">🤖</span>
                </motion.div>
                
                {/* Orbiting particles */}
                {[...Array(12)].map((_, i) => (
                    <motion.div key={i}
                        animate={{ opacity: [0, 1, 0], scale: [0.3, 1, 0.3], x: [0, Math.cos(i * 30 * Math.PI / 180) * 120], y: [0, Math.sin(i * 30 * Math.PI / 180) * 120] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                        className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-glow-cyan" />
                ))}
            </div>
            
            <div className="text-center space-y-4 max-w-md px-6">
                <AnimatePresence mode="wait">
                    <motion.h3 key={msgIdx} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        className="text-2xl font-black text-white tracking-tight uppercase">
                        {statuses[msgIdx]}
                    </motion.h3>
                </AnimatePresence>
                <div className="flex justify-center gap-1">
                    {statuses.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === msgIdx ? 'w-8 bg-cyan-500 shadow-glow-cyan' : 'w-2 bg-slate-800'}`} />
                    ))}
                </div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] pt-4 animate-pulse">Neural Interviewer Engaged</p>
            </div>
        </motion.div>
    );
};

// ─────── Setup Screen ───────
const SetupScreen = ({ onStart }) => {
    const [branch, setBranch] = useState('CSE');
    const [difficulty, setDifficulty] = useState('Beginner');
    const [role, setRole] = useState(BRANCH_ROLES['CSE'].roles[0]);
    const [loading, setLoading] = useState(false);

    const branchInfo = BRANCH_ROLES[branch];

    const handleBranchChange = (b) => {
        setBranch(b);
        setRole(BRANCH_ROLES[b].roles[0]);
    };

    const handleStart = async () => {
        setLoading(true);
        try {
            const res = await api.post('/interview/start', { branch, difficulty, role });
            onStart(res.data);
        } catch (e) {
            alert('Please login first to start an interview.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-12 rounded-[3rem] max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 pointer-events-none">
                <TrendingUp className="w-64 h-64 text-cyan-500" />
            </div>

            <div className="relative z-10">
                <header className="mb-12">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-6 shadow-glow-cyan">
                        AI INTERVIEWER
                    </div>
                    <h2 className="text-5xl font-black mb-4 text-slate-900 dark:text-white tracking-tighter">
                        Ace Your <span className="hero-gradient">Interview</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-xl">Configure your perfect mock interview. Our AI adapts its questions to your specific background.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-10">
                        {/* Branch selector */}
                        <div>
                            <label className="section-heading mb-6">Select Your Branch</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {BRANCHES.map(b => (
                                    <button key={b} onClick={() => handleBranchChange(b)}
                                        className={`py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${branch === b
                                            ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500 shadow-glow-cyan active:scale-95'
                                            : 'bg-white/50 dark:bg-slate-900/50 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-cyan-500/30'
                                            }`}>{b}</button>
                                ))}
                            </div>
                        </div>

                        {/* Difficulty */}
                        <div>
                            <label className="section-heading mb-6">Difficulty Intensity</label>
                            <div className="grid grid-cols-3 gap-4">
                                {DIFFICULTIES.map(d => {
                                    const isActive = difficulty === d;
                                    const colors = {
                                        Beginner: 'emerald',
                                        Intermediate: 'yellow',
                                        Advanced: 'red'
                                    };
                                    return (
                                        <button key={d} onClick={() => setDifficulty(d)}
                                            className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${isActive
                                                ? `bg-${colors[d]}-500/10 text-${colors[d]}-500 border-${colors[d]}-500 shadow-glow-${colors[d]} scale-[1.02]`
                                                : 'bg-white/50 dark:bg-slate-900/50 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                                                }`}>{d}</button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {/* Role selector */}
                        <AnimatePresence mode="wait">
                            <motion.div key={branch}
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-inner"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em]">
                                        Target Specialization
                                    </p>
                                    <span className="text-[10px] font-black text-slate-400 uppercase bg-white dark:bg-white/5 px-3 py-1 rounded-full">{branch}</span>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-2 mb-10 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
                                    {branchInfo.roles.map(r => (
                                        <button key={r} onClick={() => setRole(r)}
                                            className={`text-left text-xs px-5 py-3.5 rounded-2xl font-black uppercase tracking-wider transition-all border ${role === r
                                                    ? `bg-cyan-500 text-slate-900 border-cyan-400 shadow-glow-cyan`
                                                    : `bg-white dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10`
                                                }`}>
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="pt-8 border-t border-slate-200 dark:border-white/5">
                                    <p className="section-heading !mb-4 !text-[8px]">Curriculum Keywords</p>
                                    <div className="flex flex-wrap gap-2">
                                        {branchInfo.topics.map(t => (
                                            <span key={t} className="text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <button onClick={handleStart} disabled={loading}
                            className="premium-button w-full shadow-glow-primary py-5 !text-sm">
                            {loading ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-5 h-5 border-4 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                                    <span>Synthesizing...</span>
                                </div>
                            ) : (
                                <>START INTERVIEW <ChevronRight className="w-5 h-5 ms-2" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            <AnimatePresence>
                {loading && <AILoadingOverlay />}
            </AnimatePresence>
        </motion.div>
    );
};

// ─────── Live Timer ───────
const Timer = ({ duration, onExpire }) => {
    const [remaining, setRemaining] = useState(duration);

    useEffect(() => {
        setRemaining(duration);
        const interval = setInterval(() => {
            setRemaining(prev => {
                if (prev <= 1) { clearInterval(interval); onExpire(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [duration]);

    const pct = (remaining / duration) * 100;
    const colorClass = pct > 50 ? 'text-cyan-500' : pct > 20 ? 'text-yellow-500' : 'text-red-500';
    const strokeClass = pct > 50 ? 'stroke-cyan-500' : pct > 20 ? 'stroke-yellow-500' : 'stroke-red-500';

    return (
        <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full -rotate-90 drop-shadow-xl" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-200 dark:text-slate-800" />
                <circle cx="32" cy="32" r="28" fill="none" strokeWidth="4"
                    className={`${strokeClass} transition-all duration-1000`}
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
                    strokeLinecap="round" />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${colorClass}`}>
                <span className="text-xl font-black tracking-tighter leading-none">{remaining}</span>
                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">SEC</span>
            </div>
        </div>
    );
};

// ─────── Interview Screen ───────
const InterviewScreen = ({ session, onFinish }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answer, setAnswer] = useState('');
    const [recording, setRecording] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const textareaRef = useRef(null);

    const questions = session.questions;
    const currentQ = questions[currentIdx];
    const totalQ = questions.length;
    const isLast = currentIdx === totalQ - 1;

    const submitAnswer = async (ans = answer) => {
        if (submitting) return;
        setSubmitting(true);
        try {
            await api.post('/interview/evaluate', {
                session_id: session.session_id,
                question_id: currentQ.id,
                question: currentQ.question,
                answer: ans,
                topic: currentQ.topic,
            });
            
            setAnswer('');

            if (!isLast) {
                setCurrentIdx(i => i + 1);
                setSubmitting(false);
            } else {
                const result = await api.post('/interview/submit', {
                    session_id: session.session_id,
                    branch: session.branch,
                    difficulty: session.difficulty,
                });
                onFinish(result.data, []);
            }
        } catch (e) {
            console.error(e);
            setSubmitting(false);
            alert('Failed to submit answer. Please try again.');
        }
    };

    const handleVoice = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert('Voice not supported in this browser. Please use text input.');
            return;
        }
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new Recognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.onstart = () => setRecording(true);
        recognition.onend = () => setRecording(false);
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setAnswer(prev => (prev + ' ' + transcript).trim());
        };
        recognition.start();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            {/* Progress Visualization */}
            <div className="flex items-center gap-6 glass-panel p-4 rounded-3xl">
                <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
                    <motion.div className="h-full bg-premium-gradient rounded-full shadow-glow-primary"
                        animate={{ width: `${((currentIdx + 0.5) / totalQ) * 100}%` }} 
                        transition={{ type: "spring", stiffness: 50 }} />
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-950 dark:text-white leading-none">{currentIdx + 1}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">/ {totalQ}</span>
                </div>
            </div>

            {/* Main Stage */}
            <AnimatePresence mode="wait">
                <motion.div key={currentIdx} 
                    initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }} 
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} 
                    exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                    transition={{ duration: 0.6 }}
                    className="glass-panel rounded-[3.5rem] overflow-hidden shadow-[0_100px_150px_-50px_rgba(0,0,0,0.5)] border-white/5"
                >
                    {/* Console Header */}
                    <div className="px-10 py-6 bg-white/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-premium-gradient flex items-center justify-center text-slate-950 shadow-glow-primary">
                                    <Target className="w-7 h-7" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-emerald-500 border-4 border-white dark:border-slate-950 pulse animate-pulse" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mb-1">AI Interviewer</p>
                                <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Evaluating: {currentQ.topic}</h4>
                            </div>
                        </div>
                        <Timer key={currentIdx} duration={60} onExpire={() => submitAnswer(answer || '(Session terminated by timeout)')} />
                    </div>

                    <div className="p-10 lg:p-14">
                        <div className="relative mb-12">
                            <div className="absolute -top-6 -left-6 text-7xl text-cyan-500/10 font-serif leading-none">“</div>
                            <p className="text-2xl lg:text-3xl text-slate-900 dark:text-white font-bold leading-[1.4] tracking-tight relative z-10">
                                {currentQ.question}
                            </p>
                            <div className="absolute -bottom-10 -right-2 text-7xl text-purple-500/10 font-serif rotate-180 leading-none">“</div>
                        </div>

                        <div className="relative group">
                            <textarea ref={textareaRef} value={answer} onChange={e => setAnswer(e.target.value)}
                                placeholder="Articulation is key. Type your response here..."
                                rows={6}
                                className="premium-input !rounded-[2rem] !p-8 !text-lg !leading-relaxed mb-8 min-h-[220px]" />
                            
                            <div className="absolute top-4 right-4 flex gap-2">
                                <div className="px-3 py-1 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-full text-[8px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-white/10 group-focus-within:border-cyan-500/50 transition-colors">
                                    {answer.split(/\s+/).filter(x => x.length).length} Words
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch gap-4">
                            <button onClick={handleVoice}
                                className={`flex items-center justify-center gap-4 px-8 py-5 rounded-2xl border transition-all font-black text-xs uppercase tracking-[0.2em] ${recording ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse shadow-glow-red' : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-cyan-500 hover:text-cyan-500'}`}>
                                {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                {recording ? 'Capturing Audio...' : 'Voice Dictation'}
                            </button>
                            <button onClick={() => submitAnswer()} disabled={submitting}
                                className="premium-button flex-1 py-5 !text-xs !tracking-[0.3em] shadow-glow-primary">
                                {submitting ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-4 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                                        <span>SYNCHRONIZING...</span>
                                    </div>
                                ) : (
                                    <>{isLast ? 'FINALIZE ASSESSMENT' : 'NEXT STAGE'} <Send className="w-4 h-4 ms-2" /></>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// ─────── Results Screen ───────
const ResultsScreen = ({ result, answers }) => {
    const score = result.overall_score;
    const isSuccess = score >= 7.5;
    const themeColor = isSuccess ? 'cyan' : score >= 5 ? 'yellow' : 'red';
    
    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-10 pb-20">
            {/* Header / Hero Score */}
            <div className="glass-panel p-16 rounded-[4rem] text-center relative overflow-hidden">
                <div className={`absolute -top-20 -left-20 w-80 h-80 bg-${themeColor}-500/10 blur-[100px] rounded-full`} />
                <div className={`absolute -bottom-20 -right-20 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full`} />
                
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", delay: 0.3 }}
                    className="relative z-10 inline-block mb-10"
                >
                    <div className={`text-9xl font-black tracking-tighter text-slate-900 dark:text-white drop-shadow-2xl`}>
                        {score}<span className="text-4xl text-slate-500 opacity-50 ml-2">/10</span>
                    </div>
                    <div className={`h-2 w-full mt-4 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden`}>
                        <motion.div 
                            initial={{ width: 0 }} animate={{ width: `${score * 10}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`h-full bg-${themeColor}-500 shadow-glow-${themeColor}`} 
                        />
                    </div>
                </motion.div>

                <div className="relative z-10 space-y-4">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Interview Results</h2>
                    <p className={`text-2xl font-black uppercase tracking-widest text-${themeColor}-500`}>
                        {result.job_readiness}
                    </p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-10 flex flex-col items-center justify-center space-y-4 border-white/5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Domain Proficiency</p>
                    <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{result.domain_score}</p>
                </div>
                <div className="glass-card p-10 flex flex-col items-center justify-center space-y-4 border-white/5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Communication Flow</p>
                    <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{result.communication_score}</p>
                </div>
                <div className="glass-card p-10 flex flex-col items-center justify-center space-y-4 border-white/5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Clock className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Assessment Level</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest">{result.difficulty}</p>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{result.branch}</p>
                </div>
            </div>

            {/* Detailed Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-10 border-white/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Strategic Strengths</h3>
                    </div>
                    <ul className="space-y-4">
                        {result.strengths?.map((s, i) => (
                            <li key={i} className="flex items-start gap-4 group">
                                <span className="text-emerald-500 mt-1 font-black">✦</span>
                                <span className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed group-hover:text-emerald-400 transition-colors">{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="glass-card p-10 border-white/5">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Critical Gaps</h3>
                    </div>
                    <ul className="space-y-4">
                        {result.weak_topics?.map((w, i) => (
                            <li key={i} className="flex items-start gap-4 group">
                                <span className="text-red-500 mt-1 font-black">✦</span>
                                <span className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed group-hover:text-red-400 transition-colors">{w}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Roadmap */}
            <div className="glass-card p-12 relative overflow-hidden border-white/5">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
                    <TrendingUp className="w-64 h-64 text-purple-500" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <Send className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Your Career Roadmap</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {result.improvement_roadmap?.map((step, i) => (
                            <motion.div 
                                key={i}
                                whileHover={{ x: 10 }}
                                className="flex items-start gap-6 p-6 rounded-[2rem] bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-purple-500/30 transition-all"
                            >
                                <div className="w-10 h-10 rounded-xl bg-premium-gradient flex items-center justify-center text-slate-900 font-black text-xs shadow-glow-primary flex-shrink-0">
                                    {String(i + 1).padStart(2, '0')}
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{step}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => window.location.reload()}
                    className="premium-button flex-1 !py-6 !text-sm">
                    RETAKE TEST <Clock className="w-5 h-5 ms-2" />
                </button>
                <Link to="/" className="flex-1 flex items-center justify-center px-8 py-6 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-black uppercase tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/5">
                    Return Home
                </Link>
            </div>
        </motion.div>
    );
};

// ─────── Main Component ───────
const AIInterview = () => {
    const [session, setSession] = useState(null);
    const [result, setResult] = useState(null);
    const [answers, setAnswers] = useState([]);

    const handleStart = (sessionData) => setSession(sessionData);
    const handleFinish = (resultData, allAnswers) => { setResult(resultData); setAnswers(allAnswers); };

    return (
        <div className="min-h-screen pt-60 pb-20 px-6 relative overflow-visible">
            {/* Background Decorations */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {!session && !result && (
                    <header className="text-center mb-16 space-y-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em]"
                        >
                            Intelligent Simulation
                        </motion.div>
                        <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                            AI Mock <span className="hero-gradient">Interview</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl mx-auto">
                            Experience the industry's most advanced behavioral and technical evaluation engine. Fully adaptive, real-time feedback.
                        </p>
                    </header>
                )}

                {!session && !result && <SetupScreen onStart={handleStart} />}
                {session && !result && <InterviewScreen session={session} onFinish={handleFinish} />}
                {result && <ResultsScreen result={result} answers={answers} />}
            </div>
        </div>
    );
};

export default AIInterview;
