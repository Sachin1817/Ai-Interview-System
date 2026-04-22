import React from 'react';
import { motion } from 'framer-motion';
import { 
    Trophy, Target, Zap, Lightbulb, CheckCircle2, 
    XCircle, ArrowRight, Star, BarChart3, Clock, 
    Database, Activity, BrainCircuit 
} from 'lucide-react';

const CodingReport = ({ report, onRestart }) => {
    const feedback = report.feedback || {};
    const score = feedback.overall_score || 0;
    
    const getScoreColor = (s) => {
        if (s >= 80) return 'text-emerald-400';
        if (s >= 60) return 'text-cyan-400';
        if (s >= 40) return 'text-orange-400';
        return 'text-rose-400';
    };

    const stats = [
        { label: 'Quality', val: feedback.quality_score, max: 20, icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
        { label: 'Logic', val: feedback.logic_score, max: 20, icon: <BrainCircuit className="w-4 h-4 text-cyan-400" /> },
        { label: 'Performance', val: feedback.performance_score, max: 10, icon: <Activity className="w-4 h-4 text-purple-400" /> },
        { label: 'Syntax', val: feedback.syntax_score, max: 10, icon: <Zap className="w-4 h-4 text-orange-400" /> }
    ];

    return (
        <div className="space-y-8">
            {/* Hero Result Card */}
            <div className="glass-panel overflow-hidden rounded-[4rem] border-white/5 relative shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-premium-gradient" />
                <div className="p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-16">
                    {/* Radial Score */}
                    <div className="relative w-56 h-56 flex items-center justify-center">
                        <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl" />
                        <svg className="w-full h-full -rotate-90 relative z-10">
                            <circle 
                                cx="50%" cy="50%" r="45%" 
                                className="fill-none stroke-slate-200 dark:stroke-white/5 stroke-[12px]" 
                            />
                            <motion.circle 
                                cx="50%" cy="50%" r="45%" 
                                initial={{ strokeDasharray: "0 1000" }}
                                animate={{ strokeDasharray: `${score * 2.8} 1000` }}
                                transition={{ duration: 2.5, ease: "easeOut" }}
                                className={`fill-none stroke-[12px] stroke-current ${getScoreColor(score)}`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center z-20">
                            <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{score}</span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mt-2">Aggregate</span>
                        </div>
                    </div>

                    <div className="flex-1 text-center lg:text-left">
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                            <span className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${feedback.pass_fail === 'PASS' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                STATUS: {feedback.pass_fail || 'ANALYZING'}
                            </span>
                            <span className="text-slate-400 text-xs font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5">
                                Role: {report.role}
                            </span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight">
                            Assessment Level: <span className={getScoreColor(score)}>{feedback.skill_level || 'Calculating...'}</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl font-medium leading-relaxed">
                            Our analysis indicates you have a <span className="text-slate-900 dark:text-white font-black">{feedback.skill_level}</span>-level command of the subject. 
                            The following metrics represent your performance across key engineering dimensions.
                        </p>
                    </div>
                </div>

                {/* Score Breakdown Bar */}
                <div className="bg-slate-50 dark:bg-white/5 px-12 py-10 grid grid-cols-2 lg:grid-cols-4 gap-12 border-t border-slate-200 dark:border-white/5 shadow-inner">
                    {stats.map(stat => (
                        <div key={stat.label} className="group">
                            <div className="flex items-center gap-3 mb-4 transition-transform group-hover:translate-x-1">
                                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-white/5">
                                    {stat.icon}
                                </div>
                                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">{stat.label}</span>
                            </div>
                            <div className="flex items-end gap-3 px-1">
                                <span className="text-3xl font-black text-slate-800 dark:text-white">{stat.val}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-600 mb-2 font-black">/ {stat.max}</span>
                            </div>
                            <div className="mt-4 h-1 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stat.val / stat.max) * 100}%` }}
                                    className={`h-full bg-current ${getScoreColor(score)} opacity-50`}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Insights Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Strengths */}
                <div className="glass-panel p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-emerald-500/[0.04] via-transparent to-transparent shadow-xl group">
                    <h3 className="text-emerald-500 font-black mb-10 flex items-center gap-4 uppercase tracking-[0.3em] text-[10px]">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:rotate-12 transition-transform">
                            <Star className="w-4 h-4" />
                        </div>
                        Strategic Strengths
                    </h3>
                    <ul className="space-y-6">
                        {feedback.strengths?.map((s, i) => (
                            <li key={i} className="flex items-start gap-5 group/item">
                                <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-all border border-emerald-500/10 shadow-sm">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </div>
                                <span className="text-slate-600 dark:text-slate-300 font-bold text-base leading-snug pt-1">{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Improvements */}
                <div className="glass-panel p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 bg-gradient-to-br from-orange-500/[0.04] via-transparent to-transparent shadow-xl group">
                    <h3 className="text-orange-500 font-black mb-10 flex items-center gap-4 uppercase tracking-[0.3em] text-[10px]">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:-rotate-12 transition-transform">
                            <Lightbulb className="w-4 h-4" />
                        </div>
                        Optimization Paths
                    </h3>
                    <ul className="space-y-6">
                        {feedback.suggestions?.map((s, i) => (
                            <li key={i} className="flex items-start gap-5 group/item">
                                <div className="w-8 h-8 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-all border border-orange-500/10 shadow-sm">
                                    <ArrowRight className="w-4 h-4 text-orange-500" />
                                </div>
                                <span className="text-slate-600 dark:text-slate-300 font-bold text-base leading-snug pt-1">{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Execution Meta */}
            <div className="glass-panel p-10 rounded-[3rem] border-white/5 flex flex-wrap gap-12 items-center justify-between shadow-2xl">
                <div className="flex flex-wrap gap-12">
                    <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/5 shadow-sm">
                                <Clock className="w-6 h-6 text-cyan-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Compute Time</p>
                                <p className="text-slate-900 dark:text-white font-black text-lg tracking-tight">{report.execution_time} <span className="text-xs font-medium text-slate-400">sec</span></p>
                            </div>
                        </div>
                    <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/5 shadow-sm">
                                <Database className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Heap Allocation</p>
                                <p className="text-slate-900 dark:text-white font-black text-lg tracking-tight">{report.memory}</p>
                            </div>
                        </div>
                    <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/5 shadow-sm">
                                <Activity className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Runtime Env</p>
                                <p className="text-slate-900 dark:text-white font-black text-lg tracking-tight capitalize">{report.language}</p>
                            </div>
                        </div>
                </div>
                
                <button 
                    onClick={onRestart}
                    className="w-full lg:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-5 rounded-[1.5rem] hover:shadow-glow-primary transition-all font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 group"
                >
                    Initialize New Session
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default CodingReport;
