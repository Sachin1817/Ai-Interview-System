import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronDown, ChevronUp, CheckCircle, AlertCircle,
    BrainCircuit, BookOpen, TrendingUp, Zap, RefreshCw, Award
} from 'lucide-react';
import api from '../../services/api';

const ScoreRing = ({ score, max = 10, size = 48 }) => {
    const pct = Math.min(score / max, 1);
    const r = size / 2 - 5;
    const circ = 2 * Math.PI * r;
    const dash = pct * circ;
    const color = score >= 7 ? '#10b981' : score >= 5 ? '#06b6d4' : '#ef4444';
    return (
        <svg width={size} height={size} className="shrink-0">
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                transform={`rotate(-90 ${size/2} ${size/2})`} />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
                fill={color} fontSize="11" fontWeight="800">{score}</text>
        </svg>
    );
};

const QACard = ({ qa, index, onRetry }) => {
    const [open, setOpen] = useState(false);
    const scoreColor = qa.score >= 7
        ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
        : qa.score >= 5
        ? 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10'
        : 'text-rose-400 border-rose-500/20 bg-rose-500/10';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden"
        >
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/5 transition-colors"
            >
                <span className="text-xs font-black text-slate-500 w-7 shrink-0">Q{index+1}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shrink-0 ${scoreColor}`}>
                    {qa.topic}
                </span>
                <span className="flex-1 text-sm text-white font-medium truncate">{qa.question}</span>
                <ScoreRing score={qa.score} />
                {open ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                       : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                            {/* Your Answer */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                                    <BookOpen className="w-3.5 h-3.5" /> Your Answer
                                </p>
                                <p className="text-sm text-slate-300 leading-relaxed bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                                    {qa.answer || <em className="text-slate-500">No answer provided.</em>}
                                </p>
                            </div>

                            {/* AI Feedback */}
                            {qa.feedback && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                                        <BrainCircuit className="w-3.5 h-3.5 text-purple-400" /> AI Feedback
                                    </p>
                                    <p className="text-sm text-purple-200 leading-relaxed bg-purple-500/5 rounded-xl px-4 py-3 border border-purple-500/20">
                                        {qa.feedback}
                                    </p>
                                </div>
                            )}

                            {/* Ideal Answer */}
                            {qa.ideal_answer && (
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                                        <Award className="w-3.5 h-3.5 text-amber-400" /> Ideal Answer
                                    </p>
                                    <p className="text-sm text-amber-200 leading-relaxed bg-amber-500/5 rounded-xl px-4 py-3 border border-amber-500/20">
                                        {qa.ideal_answer}
                                    </p>
                                </div>
                            )}

                            {/* Strengths & Improvements */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {qa.strengths?.length > 0 && (
                                    <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-1.5">
                                            <CheckCircle className="w-3 h-3" /> Strengths
                                        </p>
                                        <ul className="space-y-1">
                                            {qa.strengths.map((s, i) => <li key={i} className="text-xs text-emerald-300">• {s}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {qa.improvements?.length > 0 && (
                                    <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-2 flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3" /> Improve
                                        </p>
                                        <ul className="space-y-1">
                                            {qa.improvements.map((s, i) => <li key={i} className="text-xs text-rose-300">• {s}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => onRetry(qa.topic)}
                                className="flex items-center gap-2 text-xs font-black text-cyan-400 hover:text-cyan-300 transition-colors mt-1"
                            >
                                <RefreshCw className="w-3.5 h-3.5" /> Retry This Topic
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const InterviewDetailModal = ({ sessionId, onClose, onRetryTopic }) => {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!sessionId) return;
        setLoading(true);
        setError('');
        api.get(`/interview/session/${sessionId}/detail`)
            .then(r => setDetail(r.data))
            .catch(() => setError('Could not load session details. The session may not have stored answers.'))
            .finally(() => setLoading(false));
    }, [sessionId]);

    if (!sessionId) return null;

    const overallPct = detail ? Math.min((detail.overall_score / 10) * 100, 100) : 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/85 backdrop-blur-md overflow-y-auto py-10 px-4"
                onClick={e => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 40, opacity: 0 }}
                    transition={{ type: 'spring', damping: 22 }}
                    className="w-full max-w-3xl bg-slate-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-gradient-to-r from-slate-900 to-slate-950">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <h2 className="text-white font-black text-base">Interview Review</h2>
                                {detail && (
                                    <p className="text-slate-400 text-xs">
                                        {detail.branch} · {detail.difficulty} · {detail.total_questions} Questions
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-4 max-h-[76vh] overflow-y-auto">
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Loading Session…</p>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                                <AlertCircle className="w-10 h-10 text-rose-400" />
                                <p className="text-rose-300 text-sm font-bold">{error}</p>
                            </div>
                        )}

                        {detail && !loading && (
                            <>
                                {/* Score Summary */}
                                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-cyan-400" /> Overall Score
                                        </p>
                                        <span className={`text-xl font-black ${detail.overall_score >= 7 ? 'text-emerald-400' : detail.overall_score >= 5 ? 'text-cyan-400' : 'text-rose-400'}`}>
                                            {detail.overall_score}/10
                                        </span>
                                    </div>
                                    <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${overallPct}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className={`h-full rounded-full ${detail.overall_score >= 7 ? 'bg-emerald-500' : detail.overall_score >= 5 ? 'bg-cyan-500' : 'bg-rose-500'}`}
                                        />
                                    </div>
                                    <div className="flex items-center gap-5 mt-3 text-xs text-slate-500">
                                        <span>Technical: <b className="text-slate-300">{detail.domain_score}/10</b></span>
                                        <span>Communication: <b className="text-slate-300">{detail.communication_score}/10</b></span>
                                    </div>
                                </div>

                                {/* Q&A Cards */}
                                <div className="space-y-3">
                                    {detail.qa_pairs.length > 0
                                        ? detail.qa_pairs.map((qa, i) => (
                                            <QACard
                                                key={i}
                                                qa={qa}
                                                index={i}
                                                onRetry={topic => {
                                                    onClose();
                                                    onRetryTopic && onRetryTopic(detail.branch, topic);
                                                }}
                                            />
                                          ))
                                        : <p className="text-slate-500 text-sm text-center py-10 italic">No answer data found for this session.</p>
                                    }
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InterviewDetailModal;
