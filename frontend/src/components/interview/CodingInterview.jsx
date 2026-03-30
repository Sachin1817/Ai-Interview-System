import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Code2, Play, Send, Timer, Terminal, ChevronRight, 
    CheckCircle2, AlertCircle, RefreshCcw, Cpu, Zap, Trophy 
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import CodingReport from './CodingReport';

const CodingInterview = () => {
    const { currentUser } = useAuth();
    const API_BASE_URL = 'http://localhost:5000/api/coding';
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
            const token = await currentUser.getIdToken();
            const res = await axios.post(`${API_BASE_URL}/generate`, { role, difficulty }, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
        setOutput(prev => [...prev, { type: 'info', content: `> Running ${language} code...` }]);
        try {
            const token = await currentUser.getIdToken();
            const res = await axios.post(`${API_BASE_URL}/run`, { language, code }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
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
            const token = await currentUser.getIdToken();
            const res = await axios.post(`${API_BASE_URL}/submit`, { 
                role: selectedRole,
                language,
                code,
                output: output.map(o => o.content).join('\n'),
                execution_time: performance.time,
                memory: performance.memory
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReport(res.data.report);
            setStep('report');
        } catch (err) {
            console.error("Submission failed", err);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-light-bg dark:bg-slate-950 pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    {step === 'select-role' && (
                        <motion.div 
                            key="select-role"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="max-w-3xl mx-auto"
                        >
                            <div className="glass-panel p-10 rounded-[3rem] border-white/5 text-center mb-12">
                                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/20">
                                    <Code2 className="w-10 h-10 text-white dark:text-slate-950" />
                                </div>
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">AI Coding Interview</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-lg mb-8">Select your target role and difficulty to generate a dynamic coding challenge.</p>
                                
                                {/* Difficulty Selector */}
                                <div className="flex justify-center gap-3 mb-10">
                                    {['Easy', 'Medium', 'Hard'].map((lvl) => (
                                        <button
                                            key={lvl}
                                            onClick={() => setDifficulty(lvl)}
                                            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                                                difficulty === lvl 
                                                ? (lvl === 'Easy' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                                                   lvl === 'Medium' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 
                                                   'bg-purple-600 text-white shadow-lg shadow-purple-600/20')
                                                : 'bg-slate-100 dark:bg-white/5 text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-white/10'
                                            }`}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {roles.map(role => (
                                        <button 
                                            key={role}
                                            onClick={() => startInterview(role)}
                                            className="group flex items-center justify-between p-6 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all text-left shadow-sm hover:shadow-md"
                                        >
                                            <span className="text-slate-700 dark:text-white font-bold text-lg">{role}</span>
                                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'interview' && (
                        <motion.div 
                            key="interview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col h-[calc(100vh-10rem)]"
                        >
                            {/* Header Panel */}
                            <div className="glass-panel p-4 rounded-2xl border-white/5 mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-cyan-500/10 p-2 rounded-lg">
                                        <Code2 className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-slate-900 dark:text-white font-bold leading-none">{challenge?.title}</h2>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">{selectedRole}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Timer className="w-4 h-4 text-orange-400" />
                                        <span className="font-mono text-sm">{formatTime(timeLeft)}</span>
                                    </div>
                                    <div className="h-4 w-px bg-white/10" />
                                    <select 
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 focus:border-cyan-500/50 outline-none"
                                    >
                                        {languageOptions[selectedRole]?.map(lang => (
                                            <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={submitInterview}
                                        disabled={isSubmitting}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 px-5 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        Submit Solution
                                    </button>
                                </div>
                            </div>

                            {/* Main Content Split */}
                            <div className="flex-1 flex gap-4 min-h-0">
                                {/* Left: Problem Statement */}
                                <div className="w-1/3 glass-panel rounded-2xl border-white/5 p-6 overflow-y-auto custom-scrollbar">
                                    <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                                        <Zap className="w-4 h-4" /> Problem Statement
                                    </h3>
                                    <div className="text-slate-300 space-y-4 text-sm leading-relaxed whitespace-pre-wrap">
                                        {challenge?.instructions}
                                    </div>
                                    
                                    <div className="mt-8 pt-8 border-t border-white/5">
                                        <h3 className="text-purple-400 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                                            <CheckCircle2 className="w-4 h-4" /> Expected Output
                                        </h3>
                                        <div className="bg-slate-950/50 p-4 rounded-xl font-mono text-xs text-slate-400 border border-white/5">
                                            {challenge?.expected_output || "Verified via behavioral criteria."}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Editor & Console */}
                                <div className="flex-1 flex flex-col min-h-0 gap-4">
                                    {/* Editor */}
                                    <div className="flex-1 glass-panel rounded-2xl border-white/5 flex flex-col overflow-hidden relative group">
                                        <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Main.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : language}</span>
                                            <button 
                                                onClick={runCode}
                                                disabled={isRunning}
                                                className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 px-3 py-1 rounded flex items-center gap-2 text-xs font-bold transition-all"
                                            >
                                                {isRunning ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                                Run Code
                                            </button>
                                        </div>
                                        <textarea 
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            spellCheck={false}
                                            autoComplete='off'
                                            className="flex-1 bg-transparent text-slate-200 font-mono text-sm p-6 resize-none focus:outline-none custom-scrollbar w-full h-full leading-relaxed"
                                        />
                                        
                                        {/* Performance Bar Overlay */}
                                        <div className="absolute bottom-4 right-4 flex gap-3 pointer-events-none">
                                            <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 px-3 py-1 rounded-full flex items-center gap-2 text-[10px]">
                                                <Cpu className="w-3 h-3 text-cyan-400" />
                                                <span className="text-slate-400 font-bold uppercase tracking-tight">{performance.time}s</span>
                                            </div>
                                            <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 px-3 py-1 rounded-full flex items-center gap-2 text-[10px]">
                                                <Zap className="w-3 h-3 text-purple-400" />
                                                <span className="text-slate-400 font-bold uppercase tracking-tight">{performance.memory}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Console */}
                                    <div className="h-1/3 glass-panel rounded-2xl border-white/5 flex flex-col overflow-hidden">
                                        <div className="bg-slate-950/20 px-4 py-2 border-b border-white/5 flex items-center gap-2">
                                            <Terminal className="w-4 h-4 text-slate-500" />
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Console Output</span>
                                            <button onClick={() => setOutput([])} className="ml-auto text-[10px] text-slate-600 hover:text-slate-400 transition-colors uppercase font-bold">Clear</button>
                                        </div>
                                        <div className="flex-1 bg-slate-950/40 p-4 font-mono text-xs overflow-y-auto custom-scrollbar">
                                            {output.length === 0 && <span className="text-slate-700 italic">No output yet. Click 'Run Code' to execute.</span>}
                                            {output.map((line, i) => (
                                                <div key={i} className={`mb-1 break-all ${line.type === 'error' ? 'text-red-400' : line.type === 'info' ? 'text-cyan-500/60' : line.type === 'stderr' ? 'text-orange-400' : 'text-slate-300'}`}>
                                                    {line.content}
                                                </div>
                                            ))}
                                            {isRunning && (
                                                <motion.div 
                                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                                    className="w-2 h-4 bg-cyan-500 inline-block align-middle ml-1"
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
