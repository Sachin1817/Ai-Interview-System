import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code2, Play, Send, Timer, Terminal, ChevronRight,
    CheckCircle2, AlertCircle, RefreshCcw, Cpu, Zap, Trophy
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import CodingReport from './CodingReport';

const CodingInterview = () => {
    const { currentUser } = useAuth();
    const [step, setStep] = useState('select-role'); // 'select-role', 'interview', 'report'
    const [selectedRole, setSelectedRole] = useState('');
    const [difficulty, setDifficulty] = useState('Medium'); // 'Easy', 'Medium', 'Hard'
    const [challenge, setChallenge] = useState(null);
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState('');
    const [output, setOutput] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
    const [report, setReport] = useState(null);
    const [performance, setPerformance] = useState({ time: 0, memory: '8 MB' });
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [saveStatus, setSaveStatus] = useState('Saved.');

    const roles = [
        "Frontend Developer", "Backend Developer", "Full Stack Developer",
        "Data Scientist", "Java Developer", "Python Developer", "DevOps Engineer"
    ];

    const languageOptions = {
        'Frontend Developer': ['html', 'javascript', 'Css'],
        'Backend Developer': ['javascript', 'python', 'java'],
        'Full Stack Developer': ['javascript', 'python'],
        'Data Scientist': ['python'],
        'Java Developer': ['java'],
        'Python Developer': ['python'],
        'DevOps Engineer': ['bash', 'python']
    };

    // Timer logic
    useEffect(() => {
        if (step === 'interview' && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [step, timeLeft]);

    // Autosave logic
    useEffect(() => {
        if (step !== 'interview' || !code) return;
        setSaveStatus('Saving...');
        const timer = setTimeout(() => {
            try {
                localStorage.setItem(`coding_code_${selectedRole}`, code);
                setSaveStatus('Saved.');
            } catch (e) {
                setSaveStatus('Save failed.');
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [code, step, selectedRole]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startInterview = async (role) => {
        setSelectedRole(role);
        try {
            const res = await api.post('/coding/generate', { role, difficulty });
            setChallenge(res.data.challenge);
            setLanguage(res.data.challenge.language || 'python');

            const savedCode = localStorage.getItem(`coding_code_${role}`);
            if (savedCode) {
                setCode(savedCode);
            } else {
                setCode(getDefaultCode(res.data.challenge.language || 'python'));
            }
            setStep('interview');
        } catch (err) {
            console.error("Error generating challenge", err);
        }
    };

    const getDefaultCode = (lang) => {
        const templates = {
            python: "# Write your Python code here\ndef solution():\n    print('Hello World')\n\nsolution()",
            javascript: "// Write your JavaScript code here\nconsole.log('Hello World');",
            java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World\");\n    }\n}",
            bash: "#!/bin/bash\necho 'Hello World'",
            html: "<!-- Write your HTML/CSS/JS here -->\n<div id='root'>\n  <h1>Hello World</h1>\n</div>"
        };
        return templates[lang] || "";
    };

    const parseInstructions = (instructionsText) => {
        if (!instructionsText) return { description: '', examples: '', constraints: '', hints: '' };

        const sections = {
            description: '',
            examples: '',
            constraints: '',
            hints: ''
        };

        const text = instructionsText;
        const examplesIndex = text.search(/(example|examples|sample|input\/output)/i);
        const constraintsIndex = text.search(/(constraint|constraints|rules)/i);
        const hintsIndex = text.search(/(hint|hints|tips)/i);

        const indices = [
            { name: 'examples', index: examplesIndex },
            { name: 'constraints', index: constraintsIndex },
            { name: 'hints', index: hintsIndex }
        ].filter(i => i.index !== -1).sort((a, b) => a.index - b.index);

        if (indices.length > 0) {
            sections.description = text.substring(0, indices[0].index).trim();

            for (let i = 0; i < indices.length; i++) {
                const start = indices[i].index;
                const end = (i + 1 < indices.length) ? indices[i + 1].index : text.length;
                let content = text.substring(start, end).trim();

                // Clean the title from content
                if (indices[i].name === 'examples') {
                    content = content.replace(/^(examples|example|sample|input\/output):?\s*/i, '');
                } else if (indices[i].name === 'constraints') {
                    content = content.replace(/^(constraints|constraint|rules):?\s*/i, '');
                } else if (indices[i].name === 'hints') {
                    content = content.replace(/^(hints|hint|tips):?\s*/i, '');
                }

                sections[indices[i].name] = content;
            }
        } else {
            sections.description = text;
        }

        if (!sections.examples) {
            sections.examples = `Use standard test cases for ${selectedRole}.\nRefer to Validation Criteria.`;
        }
        if (!sections.constraints) {
            sections.constraints = `• Time complexity should be optimized for production.\n• Handle edge cases like empty inputs, null, or out-of-bound ranges.`;
        }
        if (!sections.hints) {
            sections.hints = `• Think about using standard libraries for ${language}.\n• Keep code modular and readable.`;
        }

        return sections;
    };

    const runCode = async () => {
        setIsRunning(true);
        setOutput(prev => [...prev, { type: 'info', content: `> Initializing ${language} runtime...` }]);
        try {
            const res = await api.post('/coding/run', { language, code });

            if (res.data.error) {
                setOutput(prev => [...prev, { type: 'error', content: res.data.error }]);
            } else {
                if (res.data.stdout) setOutput(prev => [...prev, { type: 'stdout', content: res.data.stdout }]);
                if (res.data.stderr) setOutput(prev => [...prev, { type: 'stderr', content: res.data.stderr }]);
                setPerformance({ time: res.data.execution_time, memory: res.data.memory });
            }
        } catch (err) {
            setOutput(prev => [...prev, { type: 'error', content: "Network error during execution." }]);
        }
        setIsRunning(false);
    };

    const submitInterview = async () => {
        setIsSubmitting(true);
        try {
            const res = await api.post('/coding/submit', {
                role: selectedRole,
                language,
                code,
                output: output.map(o => o.content).join('\n'),
                execution_time: performance.time,
                memory: performance.memory
            });
            setReport(res.data.report);
            setStep('report');
        } catch (err) {
            console.error("Submission failed", err);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen pt-36 md:pt-40 pb-20 px-6 relative">
            <div className="max-w-7xl mx-auto relative z-10">
                <AnimatePresence mode="wait">
                    {step === 'select-role' && (
                        <motion.div
                            key="select-role"
                            initial={{ opacity: 0, scale: 0.98, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="glass-panel p-12 lg:p-16 rounded-[4rem] border-white/5 text-center mb-12 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-16 opacity-[0.03] rotate-12 pointer-events-none">
                                    <Terminal className="w-64 h-64" />
                                </div>

                                <div className="w-24 h-24 bg-premium-gradient rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-glow-primary">
                                    <Code2 className="w-12 h-12 text-slate-900" />
                                </div>
                                <header className="mb-12">
                                    <h2 className="text-5xl font-black mb-4 text-slate-900 dark:text-white tracking-tighter uppercase">
                                        Coding <span className="hero-gradient">Challenges</span>
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-xl mx-auto">
                                        AI-generated algorithms tailored for your specific role and skills.
                                    </p>
                                </header>

                                {/* Difficulty Selector */}
                                <div className="flex justify-center gap-4 mb-14">
                                    {['Easy', 'Medium', 'Hard'].map((lvl) => (
                                        <button
                                            key={lvl}
                                            onClick={() => setDifficulty(lvl)}
                                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${difficulty === lvl
                                                    ? (lvl === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-glow-cyan' :
                                                        lvl === 'Medium' ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20 shadow-glow-cyan' :
                                                            'bg-purple-500/10 text-purple-500 border-purple-500/20 shadow-glow-primary')
                                                    : 'bg-white/50 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10 hover:border-cyan-500/30'
                                                }`}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {roles.map(role => (
                                        <motion.button
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            key={role}
                                            onClick={() => startInterview(role)}
                                            className="group flex items-center justify-between p-8 rounded-[2.5rem] bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-left shadow-sm hover:shadow-glow-cyan"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-900 transition-colors">
                                                    <Cpu className="w-6 h-6" />
                                                </div>
                                                <span className="text-slate-800 dark:text-white font-black text-xl tracking-tight">{role}</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-cyan-500/50 transition-all">
                                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'interview' && (
                        <motion.div
                            key="interview"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col h-[calc(100vh-14rem)]"
                        >
                            {/* Header Panel */}
                            <div className="glass-panel p-6 rounded-[2.5rem] border-white/5 mb-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                                        <Code2 className="w-7 h-7 text-cyan-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-slate-900 dark:text-white font-black text-xl tracking-tight leading-tight">{challenge?.title || 'Coding Task'}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">{selectedRole}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">| {difficulty} Level</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    {/* Autosave Status */}
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5">
                                        <span className={`w-2 h-2 rounded-full ${saveStatus === 'Saving...' ? 'bg-amber-400 animate-pulse' :
                                                saveStatus === 'Saved.' ? 'bg-emerald-400' : 'bg-rose-400'
                                            }`} />
                                        <span>{saveStatus}</span>
                                    </div>

                                    {/* Timer Component with Warning States */}
                                    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-500 ${timeLeft < 60
                                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                            : timeLeft < 300
                                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10'
                                        }`}>
                                        <Timer className={`w-5 h-5 ${timeLeft < 60 ? 'animate-pulse text-rose-500' : timeLeft < 300 ? 'text-amber-500' : 'text-slate-400'}`} />
                                        <span className="font-mono text-lg font-black">{formatTime(timeLeft)}</span>
                                    </div>

                                    <div className="h-10 w-px bg-slate-200 dark:bg-white/10 hidden md:block" />

                                    <div className="flex items-center gap-4">
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white text-xs font-black uppercase tracking-widest rounded-xl px-4 py-3 focus:border-cyan-500 outline-none transition-all shadow-sm"
                                        >
                                            {languageOptions[selectedRole]?.map(lang => (
                                                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={submitInterview}
                                            disabled={isSubmitting}
                                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-cyan-500 dark:hover:bg-cyan-500 hover:text-slate-900 shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {isSubmitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            Finalize submission
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Split */}
                            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 relative">
                                {/* Left: Problem Statement Panel (Collapsible) */}
                                <AnimatePresence initial={false}>
                                    {!isPanelCollapsed && (
                                        <motion.div
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: "33.333333%", opacity: 1 }}
                                            exit={{ width: 0, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            className="w-full lg:w-1/3 glass-panel rounded-[2.5rem] border-white/5 p-8 lg:p-10 flex flex-col overflow-hidden shadow-lg h-full"
                                        >
                                            {/* Tabs Header */}
                                            <div className="flex border-b border-slate-200 dark:border-white/5 mb-6 gap-4 overflow-x-auto custom-scrollbar whitespace-nowrap">
                                                {['description', 'examples', 'constraints', 'hints'].map((tab) => (
                                                    <button
                                                        key={tab}
                                                        onClick={() => setActiveTab(tab)}
                                                        className={`pb-3 text-[10px] font-black uppercase tracking-wider relative transition-colors ${activeTab === tab ? 'text-cyan-500' : 'text-slate-400 hover:text-slate-300'}`}
                                                    >
                                                        {tab}
                                                        {activeTab === tab && (
                                                            <motion.div
                                                                layoutId="activeTabUnderline"
                                                                className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-500"
                                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                                            />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Tab Content Panels */}
                                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={activeTab}
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -5 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="text-slate-600 dark:text-slate-300 space-y-5 text-sm leading-relaxed whitespace-pre-wrap font-medium h-full"
                                                    >
                                                        {activeTab === 'description' && (
                                                            <div>
                                                                <h3 className="text-cyan-500 font-black mb-4 flex items-center gap-3 uppercase tracking-[0.3em] text-[10px]">
                                                                    <Zap className="w-4 h-4" /> Description
                                                                </h3>
                                                                <p className="whitespace-pre-line leading-relaxed">{parseInstructions(challenge?.instructions).description}</p>
                                                            </div>
                                                        )}
                                                        {activeTab === 'examples' && (
                                                            <div>
                                                                <h3 className="text-cyan-500 font-black mb-4 flex items-center gap-3 uppercase tracking-[0.3em] text-[10px]">
                                                                    <Cpu className="w-4 h-4" /> Sample Run Cases
                                                                </h3>
                                                                <p className="whitespace-pre-line leading-relaxed font-mono text-xs bg-slate-900/50 p-4 rounded-xl border border-white/5">{parseInstructions(challenge?.instructions).examples}</p>
                                                            </div>
                                                        )}
                                                        {activeTab === 'constraints' && (
                                                            <div>
                                                                <h3 className="text-cyan-500 font-black mb-4 flex items-center gap-3 uppercase tracking-[0.3em] text-[10px]">
                                                                    <Zap className="w-4 h-4" /> Complexity Constraints
                                                                </h3>
                                                                <p className="whitespace-pre-line leading-relaxed">{parseInstructions(challenge?.instructions).constraints}</p>
                                                            </div>
                                                        )}
                                                        {activeTab === 'hints' && (
                                                            <div>
                                                                <h3 className="text-cyan-500 font-black mb-4 flex items-center gap-3 uppercase tracking-[0.3em] text-[10px]">
                                                                    <Trophy className="w-4 h-4" /> Optimization Hints
                                                                </h3>
                                                                <p className="whitespace-pre-line leading-relaxed">{parseInstructions(challenge?.instructions).hints}</p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                </AnimatePresence>
                                            </div>

                                            {/* Validation Criteria */}
                                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/5">
                                                <h3 className="text-purple-500 font-black mb-3 flex items-center gap-3 uppercase tracking-[0.3em] text-[10px]">
                                                    <CheckCircle2 className="w-4 h-4" /> Expected Behavior
                                                </h3>
                                                <div className="bg-slate-100 dark:bg-slate-950/50 p-4 rounded-xl font-mono text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 leading-relaxed shadow-inner">
                                                    {challenge?.expected_output || "AI Evaluation based on algorithmic efficiency and edge-case resilience."}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Toggle Collapse Split Handle Button */}
                                <div className="hidden lg:flex items-center justify-center">
                                    <button
                                        onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                                        className="w-4 h-24 bg-slate-900/80 hover:bg-cyan-500 hover:text-slate-900 border border-white/10 rounded-full flex items-center justify-center text-slate-400 transition-colors shadow-md z-10 cursor-pointer"
                                        title={isPanelCollapsed ? "Expand problem statement panel" : "Collapse problem statement panel"}
                                    >
                                        <span className="text-[10px] font-black">{isPanelCollapsed ? "→" : "←"}</span>
                                    </button>
                                </div>

                                {/* Mobile Overlay Toggle */}
                                <div className="lg:hidden flex justify-end">
                                    <button
                                        onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                                        className="px-4 py-2 bg-slate-800 rounded-xl text-xs text-cyan-400 font-bold"
                                    >
                                        {isPanelCollapsed ? "Show Instructions" : "Hide Instructions"}
                                    </button>
                                </div>

                                {/* Right: Editor & Console */}
                                <div className="flex-1 flex flex-col min-h-0 gap-6 h-full">
                                    {/* Editor */}
                                    <div className="flex-[2] glass-panel rounded-[2.5rem] border-white/5 flex flex-col overflow-hidden relative group shadow-2xl">
                                        <div className="bg-white/50 dark:bg-white/5 px-8 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                                <span className="ml-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">Main.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language}</span>
                                            </div>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={runCode}
                                                disabled={isRunning}
                                                className="bg-cyan-500 text-slate-900 hover:shadow-glow-cyan px-6 py-2 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isRunning ? (
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                                                        className="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full"
                                                    />
                                                ) : <Play className="w-3 h-3" />}
                                                {isRunning ? 'Executing...' : 'Execute Code'}
                                            </motion.button>
                                        </div>
                                        <textarea
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            spellCheck={false}
                                            autoComplete='off'
                                            className="flex-1 bg-transparent text-slate-800 dark:text-slate-200 font-mono text-[13px] p-8 lg:p-10 resize-none focus:outline-none custom-scrollbar w-full h-full leading-relaxed"
                                        />

                                        {/* Performance Bar Overlay */}
                                        <div className="absolute bottom-10 right-10 flex gap-4 pointer-events-none">
                                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3 text-[10px] shadow-lg">
                                                <Cpu className="w-4 h-4 text-cyan-500" />
                                                <span className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">{performance.time}s Latency</span>
                                            </div>
                                            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3 text-[10px] shadow-lg">
                                                <Zap className="w-4 h-4 text-purple-500" />
                                                <span className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">{performance.memory} Heap</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Console */}
                                    <div className="flex-1 glass-panel rounded-[2.5rem] border-white/5 flex flex-col overflow-hidden shadow-lg bg-slate-950/90">
                                        <div className="bg-white/5 px-8 py-3 border-b border-white/5 flex items-center gap-3">
                                            <Terminal className="w-4 h-4 text-slate-500" />
                                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Compiler Feedback</span>
                                            <button onClick={() => setOutput([])} className="ml-auto text-[10px] text-slate-500 hover:text-white transition-colors uppercase font-black tracking-widest underline decoration-dotted underline-offset-4">Reset Log</button>
                                        </div>
                                        <div className="flex-1 p-8 font-mono text-xs overflow-y-auto custom-scrollbar">
                                            {output.length === 0 && <span className="text-slate-600 italic font-medium">Click "Execute Code" to see results...</span>}
                                            <AnimatePresence>
                                                {output.map((line, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.2, delay: i * 0.05 }}
                                                        className={`mb-2 last:mb-0 break-all leading-relaxed ${line.type === 'error' ? 'text-rose-400' : line.type === 'info' ? 'text-cyan-400/70' : line.type === 'stderr' ? 'text-orange-400' : 'text-slate-300'}`}
                                                    >
                                                        <span className="opacity-30 mr-3">[{i + 1}]</span>{line.content}
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            {isRunning && (
                                                <motion.div
                                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                                    className="w-2 h-4 bg-cyan-500 inline-block align-middle ml-2 shadow-glow-cyan"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'report' && report && (
                        <motion.div
                            key="report"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto"
                        >
                            <CodingReport report={report} onRestart={() => setStep('select-role')} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CodingInterview;
