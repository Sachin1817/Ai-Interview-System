import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertCircle, BrainCircuit, Zap, ArrowRight, Star, RefreshCw, Layers, Terminal, Activity, ChevronRight } from 'lucide-react';
import { MCQ_BANK } from '../../data/mcqBank';
import api from '../../services/api';

const CATEGORY_MAP = {
    Technical: { icon: <Terminal className="w-5 h-5" />, color: 'cyan', label: 'Technical Accuracy', branches: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'Civil'] },
    Aptitude: { icon: <BrainCircuit className="w-5 h-5" />, color: 'purple', label: 'Logical Reasoning', topics: ['Quantitative', 'Logical'] },
    Communication: { icon: <Star className="w-5 h-5" />, color: 'emerald', label: 'Verbal Efficiency', topics: ['Grammar'] },
};

// ── Timer ──
const QuizTimer = ({ duration, onExpire }) => {
    const [t, setT] = useState(duration);
    useEffect(() => {
        const i = setInterval(() => setT(p => { 
            if (p <= 1) { 
                clearInterval(i); 
                onExpire(); 
                return 0; 
            } 
            return p - 1; 
        }), 1000);
        return () => clearInterval(i);
    }, [onExpire]);
    
    const pct = (t / duration) * 100;
    return (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 ${pct < 25 ? 'text-rose-400 animate-pulse border-rose-500/30' : 'text-slate-300'}`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-black text-sm tracking-tighter">
                {Math.floor(t / 60)}:{String(t % 60).padStart(2, '0')}
            </span>
        </div>
    );
};

// ── AI Loading Overlay ──
const AILoadingOverlay = () => {
    const statuses = [
        "Initializing Neural Pathways...",
        "Accessing Knowledge Base...",
        "Simulating Test Scenarios...",
        "Synthesizing Assessment Questions...",
        "Optimizing Difficulty Curves..."
    ];
    const [msgIdx, setMsgIdx] = useState(0);

    useEffect(() => {
        const i = setInterval(() => setMsgIdx(p => (p + 1) % statuses.length), 1500);
        return () => clearInterval(i);
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-2xl">
            <div className="relative w-64 h-64 mb-16">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" />
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-[3px] border-t-cyan-500 border-r-transparent border-b-purple-500 border-l-transparent opacity-60 shadow-glow-cyan" 
                />
                <motion.div 
                    animate={{ rotate: -360 }} 
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-6 rounded-full border-[2px] border-t-rose-500 border-r-transparent border-b-blue-500 border-l-transparent opacity-40" 
                />
                <motion.div 
                    animate={{ scale: [1, 1.15, 1] }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-20 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-glow-primary"
                >
                    <div className="w-12 h-12 bg-white/20 rounded-full backdrop-blur-md flex items-center justify-center">
                        <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                </motion.div>
                
                {[...Array(12)].map((_, i) => (
                    <motion.div key={i}
                        animate={{ opacity: [0, 1, 0], scale: [0.3, 1, 0.3], y: [0, -20, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
                        style={{ transform: `rotate(${i * 30}deg) translateY(-110px)` }}
                        className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full" 
                    />
                ))}
            </div>
            <div className="text-center max-w-sm px-8">
                <AnimatePresence mode="wait">
                    <motion.h3 
                        key={msgIdx} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-2xl font-black text-white mb-4 tracking-tight"
                    >
                        {statuses[msgIdx]}
                    </motion.h3>
                </AnimatePresence>
                <div className="flex items-center justify-center gap-3">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <p className="text-slate-500 mt-8 text-[10px] uppercase font-black tracking-[0.4em] opacity-60">
                    Quantized Engine V3.5 Active
                </p>
            </div>
        </motion.div>
    );
};

// ── Setup Screen ──
const AssessmentSetup = ({ onStart }) => {
    const [cat, setCat] = useState('Technical');
    const [branch, setBranch] = useState('CSE');
    const [topic, setTopic] = useState('Python');
    const [diff, setDiff] = useState('Beginner');
    const [loading, setLoading] = useState(false);

    const availableTopics = cat === 'Technical' 
        ? Object.keys(MCQ_BANK.Technical[branch] || {}) 
        : CATEGORY_MAP[cat].topics;

    useEffect(() => {
        if (cat === 'Technical') {
            const firstTopic = Object.keys(MCQ_BANK.Technical[branch] || {})[0];
            setTopic(firstTopic || '');
        } else {
            setTopic(CATEGORY_MAP[cat].topics[0]);
        }
    }, [cat, branch]);

    const getQuestions = () => {
        let bank = [];
        let raw;
        if (cat === 'Technical') {
            raw = MCQ_BANK.Technical[branch]?.[topic]?.[diff];
        } else {
            raw = MCQ_BANK[cat]?.[topic];
        }

        if (typeof raw === 'function') {
            bank = raw();
        } else {
            bank = [...(raw || [])];
        }
        
        if (bank.length < 10) {
            const needed = 10 - bank.length;
            const genericPrompts = [
                `Which aspect of ${topic} is considered most critical in advanced ${branch} systems?`,
                `In a professional ${branch} environment, how would you best implement ${topic}?`,
                `What is the primary trade-off when optimizing ${topic} for high-performance ${branch} applications?`,
                `Which design pattern is most commonly associated with ${topic} in ${branch}?`,
                `Identify the core vulnerability or bottleneck often found in standard ${topic} implementations.`,
                `How does ${topic} interact with other core ${branch} modules during peak load?`,
                `What is the industry standard approach for testing ${topic} components?`,
                `Which version or evolution of ${topic} introduced the most significant shift in ${branch} methodology?`,
                `In terms of scalability, what is the biggest challenge with ${topic}?`,
                `What is the recommended best practice for securing ${topic} data in ${branch}?`
            ];
            
            for (let i = 0; i < needed; i++) {
                const seed = i + bank.length;
                const questionText = genericPrompts[i % genericPrompts.length];
                if (cat === 'Technical') {
                    bank.push({
                        id: `gen_${seed}`,
                        q: `[Fallback] ${questionText}`,
                        options: [
                            `Scalability and efficiency`,
                            `Legacy compatibility`,
                            `Standard protocol compliance`,
                            `Complexity isolation`
                        ].sort(()=>Math.random()-0.5),
                        answer: `Scalability and efficiency`,
                        topic: topic
                    });
                } else {
                     bank.push({
                        id: `gen_${seed}`,
                        q: `[Fallback] Define a core principle of effective ${topic} management.`,
                        options: [`Resource optimization`, `Ad-hoc implementation`, `Minimal documentation`, `Strict isolation`].sort(()=>Math.random() - 0.5),
                        answer: `Resource optimization`,
                        topic: topic
                    });
                }
            }
        }

        
        let shuffled = [...bank];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        return shuffled.slice(0, 10);
    };

    const handleStart = async () => {
        setLoading(true);
        try {
            const res = await api.post('/assessment/generate', {
                category: cat, branch, topic, difficulty: diff
            });
            const data = res.data;
            if (data.status === 'success' && data.questions?.length > 0) {
                // Add isAI flag to questions
                const aiQs = data.questions.map(q => ({ ...q, isAI: true }));
                onStart(aiQs, cat, topic, diff, branch);
            } else {
                console.warn("AI generation returned success but no questions. Falling back to static bank.");
                const fallbackQs = getQuestions().map(q => ({ ...q, isAI: false }));
                onStart(fallbackQs, cat, topic, diff, branch);
            }
        } catch (err) {
            console.error("AI Generation Failed:", err);
            const fallbackQs = getQuestions().map(q => ({ ...q, isAI: false }));
            onStart(fallbackQs, cat, topic, diff, branch);
        } finally {
            setLoading(false);
        }
    };



    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-12 rounded-[4rem] max-w-2xl mx-auto border-white/5 shadow-2xl relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-premium-gradient" />
            <header className="mb-12">
                <h2 className="text-4xl font-black mb-4 text-slate-900 dark:text-white tracking-tighter">
                    Practice <span className="hero-gradient">Quizzes</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-xl">
                    Sharpen your technical skills with our comprehensive question bank.
                </p>
            </header>
            
            <div className="space-y-10">
                <div>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 block">Evaluation Category</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {Object.entries(CATEGORY_MAP).map(([c, cfg]) => (
                            <button 
                                key={c} 
                                onClick={() => setCat(c)}
                                className={`group p-6 rounded-[2rem] border transition-all relative overflow-hidden ${
                                    cat === c 
                                    ? `bg-${cfg.color}-500/10 border-${cfg.color}-500/40 text-slate-900 dark:text-white shadow-glow-${cfg.color}` 
                                    : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                                }`}
                            >
                                <div className={`flex flex-col items-center gap-3 relative z-10 transition-transform group-hover:scale-110`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-current opacity-20`} />
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 scale-125 opacity-100">{cfg.icon}</div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{c}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {cat === 'Technical' && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 block">Specialization</label>
                            <select 
                                value={branch} 
                                onChange={(e) => setBranch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 text-slate-900 dark:text-slate-300 p-4 rounded-3xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold appearance-none cursor-pointer"
                            >
                                {CATEGORY_MAP.Technical.branches.map(b => (
                                    <option key={b} value={b} className="bg-slate-900">{b}</option>
                                ))}
                            </select>
                        </motion.div>
                    )}

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 block">Topic</label>
                        <select 
                            value={topic} 
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-slate-900 dark:text-slate-300 p-4 rounded-3xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold appearance-none cursor-pointer"
                        >
                            {availableTopics.map(t => (
                                <option key={t} value={t} className="bg-slate-900">{t}</option>
                            ))}
                        </select>
                    </motion.div>
                </div>

                {cat === 'Technical' && (
                    <div className="pt-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 block">Difficulty Level</label>
                        <div className="grid grid-cols-3 gap-4">
                            {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                                <button 
                                    key={d} 
                                    onClick={() => setDiff(d)}
                                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                                        diff === d 
                                        ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-glow-purple' 
                                        : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-400'
                                    }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <button 
                    onClick={handleStart} 
                    disabled={loading}
                    className="premium-button w-full !py-6 !text-sm group flex items-center justify-center"
                >
                    START QUIZ <ChevronRight className="w-5 h-5 ms-2 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
            
            <AnimatePresence>
                {loading && <AILoadingOverlay />}
            </AnimatePresence>
        </motion.div>
    );
};

// ── Quiz Screen ──
const QuizScreen = ({ questions, cat, topic, diff, onFinish }) => {
    const [idx, setIdx] = useState(0);
    const [selected, setSelected] = useState(null);
    const [answered, setAnswered] = useState([]);
    const TIMER_SECS = 45;

    if (!questions || questions.length === 0) return null;

    const q = questions[idx];
    const progress = ((idx + 1) / questions.length) * 100;

    const handleAnswer = (opt) => {
        if (selected) return;
        setSelected(opt);
        const rec = { question: q.q, topic: q.topic, userAnswer: opt, correct: opt === q.answer, correctAnswer: q.answer };
        const newAnswered = [...answered, rec];
        setAnswered(newAnswered);
        const last = idx === questions.length - 1;
        setTimeout(() => {
            if (last) onFinish(newAnswered);
            else { 
                setIdx(i => i + 1); 
                setSelected(null); 
            }
        }, 800);
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header Stats */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                        <Terminal className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            {topic}
                            {q.isAI && (
                                <span className="bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded-md text-[8px] animate-pulse">AI POWERED (GROQ)</span>
                            )}
                        </p>
                        <p className="text-slate-900 dark:text-white font-black">Question {idx + 1}<span className="text-slate-500 text-xs"> / {questions.length}</span></p>
                    </div>
                </div>
                <QuizTimer key={idx} duration={TIMER_SECS} onExpire={() => handleAnswer('(Time expired)')} />
            </div>

            {/* Question Card */}
            <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="glass-panel rounded-[3.5rem] border-white/5 overflow-hidden shadow-2xl bg-white/[0.02]"
            >
                <div className="h-1.5 w-full bg-white/5">
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-premium-gradient shadow-glow-cyan" 
                    />
                </div>
                
                <div className="p-12 sm:p-16">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-12 leading-tight tracking-tight">
                        {q.q}
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                        {q.options.map((opt, i) => {
                            const isCorrect = opt === q.answer;
                            const isSelected = selected === opt;
                            const showResult = !!selected;

                            let btnStyle = "bg-white/5 border-white/5 text-slate-600 dark:text-slate-400 hover:border-white/20 hover:bg-white/10";
                            if (showResult) {
                                if (isSelected && isCorrect) btnStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-glow-emerald";
                                else if (isSelected && !isCorrect) btnStyle = "bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-glow-rose";
                                else if (isCorrect) btnStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-500";
                            }

                            return (
                                <motion.button 
                                    key={opt} 
                                    whileHover={{ x: showResult ? 0 : 8 }}
                                    onClick={() => handleAnswer(opt)} 
                                    disabled={showResult}
                                    className={`w-full text-left p-6 sm:p-8 rounded-[2rem] font-bold text-base border transition-all flex items-center justify-between ${btnStyle}`}
                                >
                                    <span className="flex items-center gap-6">
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase tracking-widest border border-current opacity-40`}>
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        {opt}
                                    </span>
                                    {showResult && isCorrect && <CheckCircle className="w-6 h-6 text-emerald-400" />}
                                    {showResult && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-400" />}
                                </motion.button>
                            );
                        })}
                    </div>
                    {!q.isAI && (
                        <p className="mt-8 text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center opacity-60">
                            Offline Mode Active • Dynamic AI generation failed or was bypassed
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );

};

// ── Results Screen ──
const AssessmentResult = ({ answers, cat, topic, diff, onRetry }) => {
    const correct = answers.filter(a => a.correct).length;
    const score = Math.round((correct / answers.length) * 100);
    const weakTopics = [...new Set(answers.filter(a => !a.correct).map(a => a.topic))];

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-10">
            <div className="glass-panel p-16 rounded-[4rem] text-center border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-premium-gradient" />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Results</span>
                    </div>
                    
                    <div className="relative w-48 h-48 mx-auto mb-10 flex items-center justify-center">
                        <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl" />
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="50%" cy="50%" r="45%" className="fill-none stroke-white/5 stroke-[10px]" />
                            <motion.circle 
                                cx="50%" cy="50%" r="45%" 
                                initial={{ strokeDasharray: "0 1000" }}
                                animate={{ strokeDasharray: `${score * 2.83} 1000` }}
                                className={`fill-none stroke-[10px] stroke-current ${score >= 70 ? 'text-emerald-400 shadow-glow-emerald' : score >= 40 ? 'text-cyan-400' : 'text-rose-400'}`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute">
                            <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{score}%</span>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Quiz Complete</h2>
                    <p className="text-slate-500 font-bold mb-10">{correct} of {answers.length} questions correct</p>
                    
                    <div className="flex flex-wrap justify-center gap-3">
                        <span className="bg-white/5 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5">{cat}</span>
                        <span className="bg-white/5 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5">{topic}</span>
                        <span className="bg-white/5 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5">{diff}</span>
                    </div>
                </div>
            </div>

            {weakTopics.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-panel p-10 rounded-[3rem] border border-rose-500/20 shadow-xl bg-rose-500/[0.02]">
                    <h3 className="text-rose-500 font-black mb-8 flex items-center gap-4 uppercase tracking-[0.2em] text-xs">
                        <AlertCircle className="w-5 h-5" /> Areas for Review
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {weakTopics.map(t => (
                            <span key={t} className="bg-rose-500/10 text-rose-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
                                {t}
                            </span>
                        ))}
                    </div>
                </motion.div>
            )}

            <div className="glass-panel p-8 rounded-[3rem] border-white/5 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 px-4">Detailed Log</h3>
                {answers.map((a, i) => (
                    <div key={i} className={`flex items-start gap-6 p-6 rounded-[2rem] border transition-all ${a.correct ? 'bg-emerald-500/[0.03] border-emerald-500/10' : 'bg-rose-500/[0.03] border-rose-500/10'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${a.correct ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {a.correct ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="text-slate-900 dark:text-slate-200 font-bold mb-3 leading-snug">{a.question}</p>
                            {!a.correct && (
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-rose-400/60">Correct Answer:</span>
                                    <span className="text-emerald-500 font-black text-sm">{a.correctAnswer}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={onRetry}
                className="w-full relative group p-6 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 overflow-hidden shadow-2xl"
            >
                <div className="absolute inset-0 bg-premium-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex items-center justify-center gap-4">
                    <span className="text-[11px] font-black uppercase tracking-[0.4em]">Retake Quiz</span>
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                </div>
            </button>
        </motion.div>
    );
};

// ── Main Component ──
const AssessmentHub = () => {
    const [phase, setPhase] = useState('setup');
    const [questions, setQuestions] = useState([]);
    const [meta, setMeta] = useState({});
    const [answers, setAnswers] = useState([]);

    const handleStart = (qs, cat, topic, diff, branch) => { 
        setQuestions(qs); 
        setMeta({ cat, topic, diff, branch }); 
        setPhase('quiz'); 
    };
    
    const handleFinish = (ans) => { 
        setAnswers(ans); 
        setPhase('result'); 
    };
    
    const handleRetry = () => { 
        setPhase('setup'); 
        setAnswers([]); 
    };

    return (
        <div className="min-h-screen pt-60 pb-20 px-6 relative overflow-visible">
            {/* Ambient Background */}
            <div className="blob blob-1 opacity-20"></div>
            <div className="blob blob-2 opacity-20"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/5 border border-purple-500/10 mb-6 group hover:border-purple-500/30 transition-all cursor-default">
                        <Layers className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500">Skill Assessment</span>
                    </div>
                </div>
                
                <AnimatePresence mode="wait">
                    {phase === 'setup' && <AssessmentSetup onStart={handleStart} key="setup" />}
                    {phase === 'quiz' && <QuizScreen questions={questions} {...meta} onFinish={handleFinish} key="quiz" />}
                    {phase === 'result' && <AssessmentResult answers={answers} {...meta} onRetry={handleRetry} key="result" />}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AssessmentHub;
