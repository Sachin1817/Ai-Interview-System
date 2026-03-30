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
        return 'text-red-400';
    };

    const stats = [
        { label: 'Quality', val: feedback.quality_score, max: 20, icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
        { label: 'Logic', val: feedback.logic_score, max: 20, icon: <BrainCircuit className="w-4 h-4 text-cyan-400" /> },
        { label: 'Performance', val: feedback.performance_score, max: 10, icon: <Activity className="w-4 h-4 text-purple-400" /> },
        { label: 'Syntax', val: feedback.syntax_score, max: 10, icon: <Zap className="w-4 h-4 text-orange-400" /> }
    ];

    return (
        <div className="space-y-6">
            {/* Hero Result Card */}
            <div className="glass-panel overflow-hidden rounded-[3rem] border-white/5 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600" />
                <div className="p-10 flex flex-col md:flex-row items-center gap-10">
                    {/* Radial Score */}
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                            <circle 
                                cx="50%" cy="50%" r="45%" 
                                className="fill-none stroke-white/5 stroke-[8px]" 
                            />
                            <motion.circle 
                                cx="50%" cy="50%" r="45%" 
                                initial={{ strokeDasharray: "0 1000" }}
                                animate={{ strokeDasharray: `${score * 2.8} 1000` }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                className={`fill-none stroke-[8px] stroke-current ${getScoreColor(score)}`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-5xl font-black text-slate-900 dark:text-white">{score}</span>
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Total Score</span>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${feedback.pass_fail === 'PASS' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                {feedback.pass_fail || 'FAIL'}
                            </span>
                            <span className="text-slate-500 text-sm font-bold tracking-tight">Result for {report.role}</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                            Performance Assessment: <span className={getScoreColor(score)}>{feedback.skill_level || 'Calculating...'}</span>
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl font-medium">
                            Great effort! Based on your code quality and logic efficiency, you've demonstrated strong foundational skills matching a <span className="text-slate-900 dark:text-white font-black">{feedback.skill_level}</span> level.
                        </p>
                    </div>
                </div>

                {/* Score Breakdown Bar */}
                <div className="bg-white/5 px-10 py-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map(stat => (
                        <div key={stat.label}>
                            <div className="flex items-center gap-2 mb-2">
                                {stat.icon}
                                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">{stat.label}</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-black text-slate-900 dark:text-white">{stat.val}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-600 mb-1 font-bold">/ {stat.max}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Insights Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="glass-panel p-8 rounded-3xl border-white/5 bg-gradient-to-br from-emerald-500/[0.03] to-transparent">
                    <h3 className="text-emerald-400 font-black mb-6 flex items-center gap-3 uppercase tracking-[0.2em] text-xs">
                        <Star className="w-4 h-4" /> Core Strengths
                    </h3>
                    <ul className="space-y-4">
                        {feedback.strengths?.map((s, i) => (
                            <li key={i} className="flex items-start gap-4 group">
                                <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-all">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                                <span className="text-slate-700 dark:text-slate-300 font-semibold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Improvements */}
                <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-gradient-to-br from-orange-500/[0.03] to-transparent">
                    <h3 className="text-orange-400 font-black mb-6 flex items-center gap-3 uppercase tracking-[0.2em] text-xs">
                        <Lightbulb className="w-4 h-4" /> Improvement Areas
                    </h3>
                    <ul className="space-y-4">
                        {feedback.suggestions?.map((s, i) => (
                            <li key={i} className="flex items-start gap-4 group">
                                <div className="w-6 h-6 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition-all">
                                    <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                                </div>
                                <span className="text-slate-700 dark:text-slate-300 font-semibold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{s}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Execution Meta */}
            <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 flex flex-wrap gap-12 items-center justify-center md:justify-start">
                <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/5">
                            <Clock className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Execution Time</p>
                            <p className="text-slate-900 dark:text-white font-bold">{report.execution_time} seconds</p>
                        </div>
                    </div>
                <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/5">
                            <Database className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Memory Usage</p>
                            <p className="text-slate-900 dark:text-white font-bold">{report.memory}</p>
                        </div>
                    </div>
                <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/5">
                            <Activity className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Language</p>
                            <p className="text-slate-900 dark:text-white font-bold capitalize">{report.language}</p>
                        </div>
                    </div>
                
                <button 
                    onClick={onRestart}
                    className="ml-auto bg-slate-900 dark:bg-white/5 border border-slate-800 dark:border-white/10 text-white px-8 py-4 rounded-2xl hover:bg-slate-800 dark:hover:bg-white/10 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl"
                >
                    Take Another Test
                </button>
            </div>
        </div>
    );
};

export default CodingReport;
