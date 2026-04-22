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

    const roles = [
        "Frontend Developer", "Backend Developer", "Full Stack Developer", 
        "Data Scientist", "Java Developer", "Python Developer", "DevOps Engineer"
    ];

    const languageOptions = {
        'Frontend Developer': ['html', 'javascript'],
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
            setCode(getDefaultCode(res.data.challenge.language || 'python'));
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
        <div className="min-h-screen pt-60 pb-20 px-6 relative">
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
                                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                                                difficulty === lvl 
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
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                            <Timer className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <span className="font-mono text-xl font-black text-slate-700 dark:text-orange-100">{formatTime(timeLeft)}</span>
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
                            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
                                {/* Left: Problem Statement */}
                                <div className="w-full lg:w-1/3 glass-panel rounded-[2.5rem] border-white/5 p-8 lg:p-10 overflow-y-auto custom-scrollbar shadow-lg">
                                    <h3 className="text-cyan-500 font-black mb-6 flex items-center gap-3 uppercase tracking-[0.3em] text-[10px]">
                                        <Zap className="w-4 h-4" /> PROBLEM DETAILS
                                    </h3>
                                    <div className="text-slate-600 dark:text-slate-300 space-y-5 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                        {challenge?.instructions}
                                    </div>
                                    
                                    <div className="mt-10 pt-10 border-t border-slate-200 dark:border-white/5">
                                        <h3 className="text-purple-500 font-black mb-6 flex items-center gap-3 uppercase tracking-[0.3em] text-[10px]">
                                            <CheckCircle2 className="w-4 h-4" /> Validation Criteria
                                        </h3>
                                        <div className="bg-slate-100 dark:bg-slate-950/50 p-6 rounded-2xl font-mono text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5 leading-relaxed shadow-inner">
                                            {challenge?.expected_output || "AI Evaluation based on algorithmic efficiency and edge-case resilience."}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Editor & Console */}
                                <div className="flex-1 flex flex-col min-h-0 gap-6">
                                    {/* Editor */}
                                    <div className="flex-[2] glass-panel rounded-[2.5rem] border-white/5 flex flex-col overflow-hidden relative group shadow-2xl">
                                        <div className="bg-white/50 dark:bg-white/5 px-8 py-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                                <span className="ml-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">Main.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language}</span>
                                            </div>
                                            <button 
                                                onClick={runCode}
                                                disabled={isRunning}
                                                className="bg-cyan-500 text-slate-900 hover:shadow-glow-cyan px-6 py-2 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                            >
                                                {isRunning ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                                Execute Code
                                            </button>
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
                                            {output.map((line, i) => (
                                                <div key={i} className={`mb-2 last:mb-0 break-all leading-relaxed ${line.type === 'error' ? 'text-rose-400' : line.type === 'info' ? 'text-cyan-400/70' : line.type === 'stderr' ? 'text-orange-400' : 'text-slate-300'}`}>
                                                    <span className="opacity-30 mr-3">[{i+1}]</span>{line.content}
                                                </div>
                                            ))}
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
