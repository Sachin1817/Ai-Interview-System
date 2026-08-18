import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, HelpCircle, Trophy, BarChart2, Star, Clock, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

const InterviewSummaryReport = ({ summaryData, onReset }) => {
    if (!summaryData) {
        return (
            <div className="max-w-3xl mx-auto p-8 text-center text-slate-400">
                Loading AI Interview evaluation report...
            </div>
        );
    }

    const { summary_text, signal_bucket, per_question_scores = [], highlight_clips = [], flags = [] } = summaryData;

    const signalColors = {
        strong: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'STRONG FIT' },
        worth_a_look: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'WORTH A LOOK' },
        weak: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', badge: 'NEEDS IMPROVEMENT' }
    };

    const style = signalColors[signal_bucket] || signalColors.worth_a_look;

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6"
            >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest mb-2">
                            <Trophy className="w-4 h-4 text-cyan-400" /> AI Interview Assessment
                        </div>
                        <h2 className="text-3xl font-black text-white">Performance Summary</h2>
                    </div>

                    <div className={`px-4 py-2 rounded-2xl border ${style.bg} ${style.border} ${style.text} text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg`}>
                        <Star className="w-4 h-4 fill-current" />
                        <span>Signal: {style.badge}</span>
                    </div>
                </div>

                {/* AI Executive Summary Card */}
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" /> Executive Overview
                    </h3>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                        {summary_text}
                    </p>
                </div>

                {/* Flags / Recommendations */}
                {flags && flags.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-2">
                        <div className="font-bold uppercase tracking-wider flex items-center gap-2 text-amber-400">
                            <AlertTriangle className="w-4 h-4" /> Observations & Flags
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                            {flags.map((f, i) => (
                                <li key={i}>
                                    {typeof f === 'object' && f !== null
                                        ? (f.description || f.topic || JSON.stringify(f))
                                        : String(f)}
                                </li>
                            ))}
                        </ul>

                    </div>
                )}

                {/* Question Breakdown */}
                {per_question_scores && per_question_scores.length > 0 && (
                    <div className="space-y-4 pt-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <BarChart2 className="w-4 h-4 text-cyan-400" /> Question-by-Question Evaluation
                        </h3>

                        <div className="space-y-3">
                            {per_question_scores.map((qs, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs font-bold text-cyan-400">Q{i + 1}: {qs.question}</span>
                                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                                            Score: {qs.score}/10
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300 italic">"{qs.answer}"</p>
                                    <p className="text-xs text-slate-400 pt-1 border-t border-white/5">
                                        <strong className="text-slate-200">Feedback:</strong> {qs.feedback}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Highlight Clips */}
                {highlight_clips && highlight_clips.length > 0 && (
                    <div className="space-y-3 pt-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-cyan-400" /> Key Highlight Moments
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {highlight_clips.map((clip, i) => (
                                <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-xs space-y-1">
                                    <div className="font-bold text-white flex items-center justify-between">
                                        <span>{clip.topic}</span>
                                        <span className="text-[10px] text-cyan-400 font-mono">@{Math.round(clip.timestamp_ms / 1000)}s</span>
                                    </div>
                                    <p className="text-slate-400">{clip.note}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Return Action Button */}
                <div className="pt-4 flex justify-end">
                    <button
                        onClick={onReset}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
                    >
                        <span>Start Another Session</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default InterviewSummaryReport;
