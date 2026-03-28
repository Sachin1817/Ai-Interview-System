import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { MCQ_BANK } from '../../data/mcqBank';

// ── Comprehensive MCQ Question Bank ──
// Using external MCQ_BANK from src/data/mcqBank.js

const CATEGORY_MAP = {
    Technical: { icon: '💻', color: 'cyan', branches: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'Civil'] },
    Aptitude: { icon: '🧮', color: 'purple', topics: ['Quantitative', 'Logical'] },
    Communication: { icon: '💬', color: 'emerald', topics: ['Grammar'] },
};

// ── Timer ──
const QuizTimer = ({ duration, onExpire }) => {
    const [t, setT] = useState(duration);
    useEffect(() => {
        const i = setInterval(() => setT(p => { if (p <= 1) { clearInterval(i); onExpire(); return 0; } return p - 1; }), 1000);
        return () => clearInterval(i);
    }, []);
    const pct = (t / duration) * 100;
    return (
        <div className={`flex items-center gap-2 ${pct < 25 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">{Math.floor(t / 60)}:{String(t % 60).padStart(2, '0')}</span>
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
        const i = setInterval(() => setMsgIdx(p => (p + 1) % statuses.length), 1000);
        return () => clearInterval(i);
    }, []);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl">
            <div className="relative w-48 h-48 mb-12">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-cyan-500 border-l-transparent opacity-40 shadow-[0_0_50px_rgba(168,85,247,0.3)]" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 rounded-full border-4 border-t-pink-500 border-r-transparent border-b-blue-500 border-l-transparent opacity-40" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.6)]">
                    <span className="text-4xl">🧠</span>
                </motion.div>
                {[...Array(8)].map((_, i) => (
                    <motion.div key={i}
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        style={{ transform: `rotate(${i * 45}deg) translateY(-85px)` }}
                        className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
                ))}
            </div>
            <motion.h3 key={msgIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300 text-center px-6">
                {statuses[msgIdx]}
            </motion.h3>
            <p className="text-slate-500 mt-4 text-sm animate-pulse uppercase tracking-[0.2em]">Large Language Model Active</p>
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

        // Support infinite procedural generators from mcqBank
        if (typeof raw === 'function') {
            bank = raw();
        } else {
            bank = [...(raw || [])];
        }
        
        // Infinite Combinatoric Generator for any remaining padded questions
        if (bank.length < 10) {
            const needed = 10 - bank.length;
            for (let i = 0; i < needed; i++) {
                const seed = i + bank.length;
                if (cat === 'Technical') {
                    const concepts = ["architecture", "optimization", "error handling", "fundamental principles", "scaling", "security", "data boundaries"];
                    const actions = ["analyzing", "implementing", "debugging", "designing", "testing", "deploying", "maintaining"];
                    const tools = ["frameworks", "algorithms", "components", "protocols", "methodologies", "standards", "interfaces"];
                    
                    const concept = concepts[seed % concepts.length];
                    const action = actions[seed % actions.length];
                    const tool = tools[seed % tools.length];
                    
                    const qId = `gen_tech_${branch}_${topic}_${diff}_${seed}_${Date.now()}`;
                    bank.push({
                        id: qId,
                        q: `[Q${seed+1}] When ${action} a system involving ${topic} at the ${diff} level, which ${concept} aspect is most critical?`,
                        options: [
                            `Proper utilization of ${topic} ${tool}`,
                            `Ignoring context-specific constraints`,
                            `Bypassing standard ${concept} protocols`,
                            `Using deprecated ${tool} for backward compatibility`
                        ].sort(()=>Math.random()-0.5),
                        answer: `Proper utilization of ${topic} ${tool}`,
                        topic: topic
                    });
                } else if (cat === 'Communication') {
                    const subjects = ["The manager", "Our team", "She", "The developer", "Someone"];
                    const verbs = ["completed", "reviewed", "analyzed", "submitted", "presented"];
                    const objects = ["the report", "the codebase", "the assignment", "the project", "the task"];
                    
                    const s = subjects[seed % subjects.length];
                    const v = verbs[seed % verbs.length];
                    const o = objects[seed % objects.length];
                    
                    bank.push({
                        id: `gen_com_${topic}_${seed}_${Date.now()}`,
                        q: `[Q${seed+1}] Grammar Check: Choose the correct phrasing for this sentence.`,
                        options: [
                            `${s} correctly ${v} ${o} yesterday.`,
                            `${s} is correctly ${v} ${o} yesterday.`,
                            `${s} has correctly ${v} ${o} tomorrow.`,
                            `${s} correctly ${v} ${o} in next week.`
                        ].sort(()=>Math.random()-0.5),
                        answer: `${s} correctly ${v} ${o} yesterday.`,
                        topic: topic
                    });
                } else {
                     bank.push({
                        id: `gen_${cat}_${topic}_${seed}_${Date.now()}`,
                        q: `[Q${seed+1}] What is a key principle of ${topic}?`,
                        options: [`Correct Option A`, `Option B`, `Option C`, `Option D`].sort(()=>Math.random() - 0.5),
                        answer: `Correct Option A`,
                        topic: topic
                    });
                }
            }
        }
        
        // Proper Fisher-Yates shuffle to guarantee completely random tests
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
            const res = await fetch('http://localhost:5000/api/assessment/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: cat, branch, topic, difficulty: diff })
            });
            const data = await res.json();
            if (data.status === 'success' && data.questions?.length === 10) {
                const qs = data.questions.map(q => {
                    let shuffledOpt = [...q.options];
                    for (let i = shuffledOpt.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffledOpt[i], shuffledOpt[j]] = [shuffledOpt[j], shuffledOpt[i]];
                    }
                    return {...q, options: shuffledOpt};
                });
                onStart(qs, cat, topic, diff, branch);
            } else {
                console.warn("AI generation rejected format, falling back to procedural.", data);
                onStart(getQuestions(), cat, topic, diff, branch);
            }
        } catch (err) {
            console.error("API error", err);
            onStart(getQuestions(), cat, topic, diff, branch);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-10 rounded-3xl max-w-2xl mx-auto">
            <h2 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Assessment Hub
            </h2>
            <p className="text-slate-400 mb-8">Timed MCQ tests with instant scoring and branch-specific topics.</p>
            <div className="space-y-6">
                <div>
                    <label className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3 block">Category</label>
                    <div className="grid grid-cols-3 gap-3">
                        {Object.entries(CATEGORY_MAP).map(([c, cfg]) => (
                            <button key={c} onClick={() => setCat(c)}
                                className={`py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border ${cat === c ? `bg-${cfg.color}-500/20 border-${cfg.color}-500 text-${cfg.color}-300` : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                <span>{cfg.icon}</span>{c}
                            </button>
                        ))}
                    </div>
                </div>

                {cat === 'Technical' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3 block">Engineering Branch</label>
                        <select value={branch} onChange={(e) => setBranch(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 text-slate-300 p-3 rounded-xl focus:outline-none focus:border-purple-500">
                            {CATEGORY_MAP.Technical.branches.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </motion.div>
                )}

                <div>
                    <label className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3 block">Topic</label>
                    <select value={topic} onChange={(e) => setTopic(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-slate-300 p-3 rounded-xl focus:outline-none focus:border-purple-500">
                        {availableTopics.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {cat === 'Technical' && (
                    <div>
                        <label className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3 block">Difficulty</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                                <button key={d} onClick={() => setDiff(d)}
                                    className={`py-2.5 rounded-lg text-sm font-semibold transition-all border ${diff === d ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>{d}</button>
                            ))}
                        </div>
                    </div>
                )}
                <button onClick={handleStart} disabled={loading}
                    className={`w-full text-white font-black py-4 rounded-2xl transition-all shadow-xl ${loading ? 'bg-slate-700 animate-pulse text-slate-300' : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 shadow-purple-500/20'}`}>
                    {loading ? 'Synthesizing AI Engine... 🧠' : 'Start Assessment 🚀'}
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
    const TIMER_SECS = 30;

    if (!questions || questions.length === 0) {
        return (
            <div className="max-w-2xl mx-auto glass-panel rounded-3xl p-10 text-center">
                <p className="text-red-400 font-bold text-xl mb-4">Questions coming soon!</p>
                <button onClick={() => window.location.reload()} className="bg-slate-800 text-white px-6 py-2 rounded-xl">Go Back</button>
            </div>
        );
    }

    const q = questions[idx];
    const isLast = idx === questions.length - 1;

    const handleAnswer = (opt) => {
        if (selected) return;
        setSelected(opt);
        const rec = { question: q.q, topic: q.topic, userAnswer: opt, correct: opt === q.answer, correctAnswer: q.answer };
        const newAnswered = [...answered, rec];
        setAnswered(newAnswered);
        const last = idx === questions.length - 1;
        setTimeout(() => {
            if (last) onFinish(newAnswered);
            else { setIdx(i => i + 1); setSelected(null); }
        }, 1200);
    };

    return (
        <motion.div key={idx} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl mx-auto glass-panel rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                <span className="font-bold text-slate-300">Q {idx + 1}/{questions.length} · {q.topic}</span>
                <QuizTimer key={idx} duration={TIMER_SECS} onExpire={() => handleAnswer('(Time expired)')} />
            </div>
            <div className="p-8">
                <p className="text-lg font-semibold text-slate-100 mb-8 leading-relaxed">{q.q}</p>
                <div className="space-y-3">
                    {q.options.map(opt => (
                        <button key={opt} onClick={() => handleAnswer(opt)} disabled={!!selected}
                            className={`w-full text-left p-4 rounded-xl font-medium text-sm border transition-all ${selected === opt && opt === q.answer ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                : selected === opt && opt !== q.answer ? 'bg-red-500/20 border-red-500 text-red-300'
                                    : selected && opt === q.answer ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-purple-500/50 hover:bg-purple-500/5'
                                }`}>
                            <span className="flex items-center gap-3">
                                {selected && opt === q.answer && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                                {selected === opt && opt !== q.answer && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                                {opt}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

// ── Results Screen ──
const AssessmentResult = ({ answers, cat, topic, diff, onRetry }) => {
    const correct = answers.filter(a => a.correct).length;
    const score = Math.round((correct / answers.length) * 100);
    const weakTopics = [...new Set(answers.filter(a => !a.correct).map(a => a.topic))];

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
            <div className="glass-panel p-10 rounded-3xl text-center">
                <div className={`text-7xl font-black mb-3 ${score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{score}%</div>
                <p className="text-xl text-white font-bold">{correct}/{answers.length} Correct</p>
                <p className="text-slate-400 mt-1">{cat} · {topic} · {diff}</p>
            </div>

            {weakTopics.length > 0 && (
                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="font-bold text-red-400 mb-3 flex items-center gap-2"><AlertCircle className="w-5 h-5" />Topics to Revise</h3>
                    <div className="flex flex-wrap gap-2">{weakTopics.map(t => <span key={t} className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-sm border border-red-500/20">{t}</span>)}</div>
                </div>
            )}

            <div className="glass-card p-6 rounded-2xl space-y-3 max-h-72 overflow-y-auto">
                {answers.map((a, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${a.correct ? 'bg-emerald-500/5' : 'bg-red-500/5'}`}>
                        {a.correct ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                        <div>
                            <p className="text-xs text-slate-300">{a.question}</p>
                            {!a.correct && <p className="text-xs text-emerald-400 mt-1">Correct: {a.correctAnswer}</p>}
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={onRetry}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-4 rounded-2xl hover:from-purple-400 hover:to-pink-500 transition-all">
                Try Another Test
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

    const handleStart = (qs, cat, topic, diff, branch) => { setQuestions(qs); setMeta({ cat, topic, diff, branch }); setPhase('quiz'); };
    const handleFinish = (ans) => { setAnswers(ans); setPhase('result'); };
    const handleRetry = () => { setPhase('setup'); setAnswers([]); };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-3">
                        Placement Assessment Hub
                    </h1>
                    <p className="text-slate-400">Technical · Aptitude · Communication — with instant weak-topic analysis</p>
                </div>
                <AnimatePresence mode="wait">
                    {phase === 'setup' && <AssessmentSetup onStart={handleStart} />}
                    {phase === 'quiz' && <QuizScreen questions={questions} {...meta} onFinish={handleFinish} />}
                    {phase === 'result' && <AssessmentResult answers={answers} {...meta} onRetry={handleRetry} />}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AssessmentHub;
