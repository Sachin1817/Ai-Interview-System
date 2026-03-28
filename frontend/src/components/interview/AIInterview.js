import React, { useState, useEffect, useRef } from 'react';
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
        const i = setInterval(() => setMsgIdx(p => (p + 1) % statuses.length), 1000);
        return () => clearInterval(i);
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl">
            <div className="relative w-48 h-48 mb-12">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent opacity-40 shadow-[0_0_50px_rgba(59,130,246,0.3)]" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 rounded-full border-4 border-t-cyan-500 border-r-transparent border-b-indigo-500 border-l-transparent opacity-40" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                    <span className="text-4xl">🤖</span>
                </motion.div>
                {[...Array(8)].map((_, i) => (
                    <motion.div key={i}
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        style={{ transform: `rotate(${i * 45}deg) translateY(-85px)` }}
                        className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]" />
                ))}
            </div>
            <motion.h3 key={msgIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 text-center px-6">
                {statuses[msgIdx]}
            </motion.h3>
            <p className="text-slate-500 mt-4 text-sm animate-pulse uppercase tracking-[0.2em]">Neural Interviewer Active</p>
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

    // Auto-select first role when branch changes
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
            className="glass-panel p-10 rounded-3xl max-w-2xl mx-auto">
            <h2 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                AI Mock Interview
            </h2>
            <p className="text-slate-400 mb-8">Select your branch, target role, and difficulty. Questions adapt to your choice.</p>

            <div className="space-y-6">
                {/* Branch selector */}
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-widest">
                        Engineering Branch
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {BRANCHES.map(b => (
                            <button key={b} onClick={() => handleBranchChange(b)}
                                className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border ${branch === b
                                    ? 'bg-blue-500 text-slate-900 border-blue-400 shadow-lg shadow-blue-500/30'
                                    : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:border-blue-500/50'
                                    }`}>{b}</button>
                        ))}
                    </div>
                </div>

                {/* Role selector — fully clickable, auto-resets when branch changes */}
                <AnimatePresence mode="wait">
                    <motion.div key={branch}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                            🎯 Select Target Role — <span className="text-blue-400">{branch}</span>
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {branchInfo.roles.map(r => (
                                <button key={r} onClick={() => setRole(r)}
                                    className={`text-xs px-3 py-2 rounded-full font-semibold border transition-all ${role === r
                                            ? `bg-blue-500/30 text-blue-200 border-blue-400 shadow shadow-blue-500/20`
                                            : `bg-slate-700/50 text-slate-400 border-slate-600 hover:border-blue-500/40 hover:text-slate-200`
                                        }`}>
                                    {role === r ? '✓ ' : ''}{r}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">📚 Topics in This Interview</p>
                        <div className="flex flex-wrap gap-2">
                            {branchInfo.topics.map(t => (
                                <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-slate-700/60 text-slate-300 border border-slate-600">
                                    {t}
                                </span>
                            ))}
                        </div>
                        {role && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                                <p className="text-xs text-slate-500">
                                    Preparing for: <span className="text-blue-400 font-bold">{role}</span> · Questions tailored to this role
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Difficulty */}
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-widest">
                        Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {DIFFICULTIES.map(d => (
                            <button key={d} onClick={() => setDifficulty(d)}
                                className={`py-3 rounded-xl font-bold transition-all border ${difficulty === d
                                    ? d === 'Beginner' ? 'bg-emerald-500 text-slate-900 border-emerald-400'
                                        : d === 'Intermediate' ? 'bg-yellow-500 text-slate-900 border-yellow-400'
                                            : 'bg-red-500 text-slate-900 border-red-400'
                                    : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:border-slate-500'
                                    }`}>{d}</button>
                        ))}
                    </div>
                </div>

                <button onClick={handleStart} disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-black py-4 rounded-2xl text-lg hover:from-blue-400 hover:to-purple-500 active:scale-95 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-3">
                    {loading ? 'Synthesizing Interview... 🤖' : <>Start as {role} <ChevronRight /></>}
                </button>
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
    const color = pct > 50 ? '#22c55e' : pct > 20 ? '#eab308' : '#ef4444';

    return (
        <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#1e293b" strokeWidth="5" />
                <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.5s' }} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black" style={{ color }}>
                {remaining}s
            </span>
        </div>
    );
};

// ─────── Interview Screen ───────
const InterviewScreen = ({ session, onFinish }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answer, setAnswer] = useState('');
    const [recording, setRecording] = useState(false);
    const [evaluations, setEvaluations] = useState([]);
    const [sessionAnswers, setSessionAnswers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [lastEval, setLastEval] = useState(null);
    const textareaRef = useRef(null);

    const questions = session.questions;
    const currentQ = questions[currentIdx];
    const totalQ = questions.length;
    const isLast = currentIdx === totalQ - 1;

    const submitAnswer = async (ans = answer) => {
        if (submitting) return;
        setSubmitting(true);
        try {
            // Save the answer to backend (deferred evaluation)
            await api.post('/interview/evaluate', {
                session_id: session.session_id,
                question_id: currentQ.id,
                question: currentQ.question,
                answer: ans,
                topic: currentQ.topic,
            });
            
            setAnswer('');

            if (!isLast) {
                // Transition to next question immediately
                setCurrentIdx(i => i + 1);
                setSubmitting(false);
            } else {
                // Submit final - this will trigger full NLP evaluation on backend
                const result = await api.post('/interview/submit', {
                    session_id: session.session_id,
                    branch: session.branch,
                    difficulty: session.difficulty,
                });
                onFinish(result.data, []); // Evaluation data will be in the final result object now
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
            setAnswer(prev => prev + ' ' + transcript);
        };
        recognition.start();
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Progress Bar */}
            <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        animate={{ width: `${((currentIdx) / totalQ) * 100}%` }} />
                </div>
                <span className="text-sm text-slate-400 font-bold whitespace-nowrap">Q {currentIdx + 1} / {totalQ}</span>
            </div>

            {/* Chat-Style Question */}
            <AnimatePresence mode="wait">
                <motion.div key={currentIdx} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
                    className="glass-panel rounded-3xl overflow-hidden">
                    {/* AI interviewer header */}
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-lg">AI</div>
                            <div>
                                <p className="font-bold text-white text-sm">AI Interviewer</p>
                                <p className="text-xs text-slate-400">Topic: {currentQ.topic}</p>
                            </div>
                        </div>
                        <Timer key={currentIdx} duration={60} onExpire={() => submitAnswer(answer || '(No answer — time expired)')} />
                    </div>

                    <div className="p-6">
                        <p className="text-lg text-slate-100 font-medium leading-relaxed mb-6">{currentQ.question}</p>

                        <textarea ref={textareaRef} value={answer} onChange={e => setAnswer(e.target.value)}
                            placeholder="Type your answer here, or use the microphone button..."
                            rows={5}
                            className="w-full bg-slate-900/60 border border-slate-700 rounded-2xl px-5 py-4 text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-4 text-sm leading-relaxed" />

                        <div className="flex items-center gap-3">
                            <button onClick={handleVoice}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all font-semibold text-sm ${recording ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-blue-500/50'}`}>
                                {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                {recording ? 'Listening...' : 'Voice Input'}
                            </button>
                            <button onClick={() => submitAnswer()} disabled={submitting}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:from-blue-400 hover:to-purple-500 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                <Send className="w-4 h-4" />
                                {submitting ? (isLast ? 'Evaluating Full Interview...' : 'Saving...') : isLast ? 'Submit & Get Results' : 'Next Question'}
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
    const scoreColor = result.overall_score >= 7 ? 'emerald' : result.overall_score >= 5 ? 'yellow' : 'red';

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
            <div className="glass-panel p-10 rounded-3xl text-center">
                <div className={`inline-block text-7xl font-black mb-4 text-${scoreColor}-400`}>
                    {result.overall_score}<span className="text-3xl text-slate-500">/10</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Interview Complete!</h2>
                <p className={`text-${scoreColor}-400 text-lg font-bold`}>{result.job_readiness}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Domain Score</p>
                    <p className="text-4xl font-black text-blue-400">{result.domain_score}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Communication</p>
                    <p className="text-4xl font-black text-purple-400">{result.communication_score}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Branch</p>
                    <p className="text-2xl font-black text-cyan-400">{result.branch}</p>
                    <p className="text-slate-500 text-sm">{result.difficulty}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.strengths?.length > 0 && (
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="font-bold text-emerald-400 flex items-center gap-2 mb-4"><CheckCircle className="w-5 h-5" />Strengths</h3>
                        <ul className="space-y-2">{result.strengths.map((s, i) => <li key={i} className="text-slate-300 text-sm">✅ {s}</li>)}</ul>
                    </div>
                )}
                {result.weak_topics?.length > 0 && (
                    <div className="glass-card p-6 rounded-2xl">
                        <h3 className="font-bold text-red-400 flex items-center gap-2 mb-4"><AlertCircle className="w-5 h-5" />Areas to Improve</h3>
                        <ul className="space-y-2">{result.weak_topics.map((w, i) => <li key={i} className="text-slate-300 text-sm">📌 {w}</li>)}</ul>
                    </div>
                )}
            </div>

            <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-bold text-purple-400 flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5" />Your Improvement Roadmap</h3>
                <div className="space-y-3">
                    {result.improvement_roadmap?.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-400 flex-shrink-0 mt-0.5">{i + 1}</div>
                            <p className="text-slate-300 text-sm leading-relaxed">{step}</p>
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-2xl hover:from-blue-400 hover:to-purple-500 transition-all">
                Take Another Interview
            </button>
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
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-3">
                        Unified AI Interview System
                    </h1>
                    <p className="text-slate-400">Branch-adaptive · Real-time evaluation · Voice-enabled · 60s per question</p>
                </div>

                {!session && !result && <SetupScreen onStart={handleStart} />}
                {session && !result && <InterviewScreen session={session} onFinish={handleFinish} />}
                {result && <ResultsScreen result={result} answers={answers} />}
            </div>
        </div>
    );
};

export default AIInterview;
