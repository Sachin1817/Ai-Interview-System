import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Check, Copy, MessageSquare, Award, Clock, Search,
    Sparkles, BookOpen, ChevronDown, ChevronUp, User, ShieldCheck,
    CheckCircle2, AlertCircle, HelpCircle, FileText, Download, Share2
} from 'lucide-react';

const CandidateAnswersModal = ({ sessionData, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('All');
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [copiedAll, setCopiedAll] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null);

    if (!sessionData) return null;

    const answers = sessionData.answers || [];
    const candidateName = sessionData.candidate_name || 'Candidate';
    const candidateEmail = sessionData.candidate_email || '';
    const role = sessionData.role || 'Software Engineer';
    const roundType = sessionData.round_type || sessionData.interview_type || 'Technical';
    const overallScore = sessionData.result?.overall_score ?? sessionData.result?.score ?? 0;

    // Extract unique topics for filter
    const uniqueTopics = ['All', ...new Set(answers.map(a => a.topic).filter(Boolean))];

    // Filter answers based on search and topic
    const filteredAnswers = answers.filter(a => {
        const matchesTopic = selectedTopic === 'All' || a.topic === selectedTopic;
        const qText = (a.question || '').toLowerCase();
        const aText = (a.answer || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || qText.includes(searchLower) || aText.includes(searchLower);
        return matchesTopic && matchesSearch;
    });

    // Total words across candidate answers
    const totalWords = answers.reduce((acc, curr) => {
        const text = curr.answer || '';
        return acc + text.trim().split(/\s+/).filter(Boolean).length;
    }, 0);

    const handleCopyAnswer = (text, idx) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleCopyTranscript = () => {
        const lines = [
            `INTERVIEW TRANSCRIPT — ${candidateName.toUpperCase()}`,
            `Email: ${candidateEmail}`,
            `Role: ${role} | Round: ${roundType}`,
            `Overall Score: ${overallScore}/100`,
            `Date: ${sessionData.started_at ? new Date(sessionData.started_at).toLocaleString() : 'N/A'}`,
            `------------------------------------------------------------\n`
        ];

        answers.forEach((a, i) => {
            lines.push(`Q${i + 1}: ${a.question || 'No question recorded'}`);
            lines.push(`Topic: ${a.topic || 'General'}`);
            lines.push(`Candidate Answer:`);
            lines.push(a.answer ? a.answer : '[No answer provided]');
            if (a.evaluation) {
                const score = a.evaluation.score ?? a.evaluation.overall_score ?? 'N/A';
                lines.push(`Score: ${score}/10`);
                if (a.evaluation.feedback) lines.push(`Feedback: ${a.evaluation.feedback}`);
            }
            lines.push(`\n------------------------------------------------------------\n`);
        });

        navigator.clipboard.writeText(lines.join('\n'));
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2500);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-[#0B1120] border border-[#1E293B] max-w-4xl w-full max-h-[92vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden text-slate-100"
                >
                    {/* MODAL HEADER */}
                    <div className="p-6 md:p-8 border-b border-[#1E293B] bg-gradient-to-r from-slate-900/90 via-[#0B1120] to-slate-900/90 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                            title="Close Window"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pr-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xl shrink-0 shadow-lg shadow-cyan-500/20">
                                    {candidateName.split(' ').map(n => n[0]).join('').toUpperCase() || 'C'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                                            {candidateName}
                                        </h2>
                                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                                            {role}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                            {roundType}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                        <span>{candidateEmail}</span>
                                        <span className="text-slate-600">•</span>
                                        <span>{sessionData.started_at ? new Date(sessionData.started_at).toLocaleDateString() : 'Recent Session'}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">Overall Score</div>
                                    <div className={`text-2xl md:text-3xl font-black mt-0.5 ${
                                        overallScore >= 70 ? 'text-emerald-400' :
                                        overallScore >= 50 ? 'text-cyan-400' :
                                        overallScore >= 35 ? 'text-amber-400' : 'text-rose-400'
                                    }`}>
                                        {overallScore}<span className="text-sm text-slate-500">/100</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* STATS STRIP */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/5">
                            <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Questions Answered</span>
                                <span className="text-base font-bold text-white mt-0.5 block">{answers.length} Questions</span>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Total Word Count</span>
                                <span className="text-base font-bold text-cyan-400 mt-0.5 block">{totalWords} Words</span>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Session Status</span>
                                <span className="text-base font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed
                                </span>
                            </div>
                            <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">Evaluation Mode</span>
                                <span className="text-base font-bold text-purple-400 mt-0.5 block">AI Grading</span>
                            </div>
                        </div>
                    </div>

                    {/* SEARCH & FILTER CONTROLS */}
                    <div className="p-4 md:px-8 border-b border-[#1E293B] bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="relative w-full sm:w-72">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search questions or candidate answers..."
                                className="w-full bg-[#060B16] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 shrink-0">Topic:</span>
                            {uniqueTopics.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setSelectedTopic(t)}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                                        selectedTopic === t
                                            ? 'bg-cyan-500 text-slate-950 font-black'
                                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* MAIN SCROLLABLE Q&A LIST */}
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 custom-scrollbar bg-[#060B16]/30">
                        {filteredAnswers.length > 0 ? (
                            filteredAnswers.map((item, idx) => {
                                const qNum = idx + 1;
                                const hasAnswer = Boolean(item.answer && item.answer.trim());
                                const answerWords = hasAnswer ? item.answer.trim().split(/\s+/).filter(Boolean).length : 0;
                                const evalData = item.evaluation || {};
                                const qScore = evalData.score ?? evalData.overall_score ?? null;

                                return (
                                    <div
                                        key={item._id || idx}
                                        className="bg-[#0A1222] border border-[#1E293B] rounded-2xl p-6 transition-all hover:border-cyan-500/30"
                                    >
                                        {/* QUESTION TOP BAR */}
                                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black flex items-center justify-center">
                                                    Q{qNum}
                                                </span>
                                                {item.topic && (
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-white/5 border border-white/5 text-slate-400">
                                                        {item.topic}
                                                    </span>
                                                )}
                                                {item.round_type && (
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400">
                                                        {item.round_type}
                                                    </span>
                                                )}
                                            </div>

                                            {qScore !== null && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Answer Score:</span>
                                                    <span className="text-xs font-black text-cyan-400">{qScore}/10</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* QUESTION TEXT */}
                                        <h4 className="text-sm font-bold text-white leading-relaxed mb-4">
                                            {item.question || 'Standard Technical Question'}
                                        </h4>

                                        {/* CANDIDATE'S VERBATIM ANSWER BOX */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                                                <span className="text-cyan-400 flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5" /> Candidate's Recorded Answer
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    {hasAnswer && (
                                                        <span className="text-slate-500 font-mono text-[9px]">
                                                            {answerWords} words
                                                        </span>
                                                    )}
                                                    {hasAnswer && (
                                                        <button
                                                            onClick={() => handleCopyAnswer(item.answer, idx)}
                                                            className="flex items-center gap-1 text-[9px] text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                                                            title="Copy this answer"
                                                        >
                                                            {copiedIndex === idx ? (
                                                                <>
                                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                                    <span className="text-emerald-400">Copied</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-3 h-3" />
                                                                    <span>Copy</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {hasAnswer ? (
                                                <div className="bg-[#050A14] border border-cyan-500/20 rounded-xl p-4 text-xs font-normal text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-cyan-500/20 shadow-inner">
                                                    {item.answer}
                                                </div>
                                            ) : (
                                                <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 text-xs text-rose-400 flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                                    <span>No response was provided for this question during the interview.</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* AI EVALUATION & FEEDBACK ON THIS ANSWER */}
                                        {evalData && (evalData.feedback || evalData.strengths || evalData.weak_areas) && (
                                            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                                <span className="text-[9px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" /> AI Response Critique
                                                </span>
                                                {evalData.feedback && (
                                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                                        {typeof evalData.feedback === 'string' ? evalData.feedback : JSON.stringify(evalData.feedback)}
                                                    </p>
                                                )}

                                                {/* Strengths & Weaknesses if provided */}
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {evalData.strengths && (
                                                        <div className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                                            <strong>Strength:</strong> {Array.isArray(evalData.strengths) ? evalData.strengths.join(', ') : evalData.strengths}
                                                        </div>
                                                    )}
                                                    {evalData.weak_areas && (
                                                        <div className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                                                            <strong>Area for Growth:</strong> {Array.isArray(evalData.weak_areas) ? evalData.weak_areas.join(', ') : evalData.weak_areas}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-16 text-center space-y-3">
                                <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
                                <p className="text-sm font-bold text-slate-300">No Interview Answers Found</p>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    {searchTerm
                                        ? 'No questions or answers match your search filter.'
                                        : 'This session does not have any recorded answers in the database yet.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* MODAL FOOTER */}
                    <div className="p-4 md:px-8 border-t border-[#1E293B] bg-slate-900/60 flex flex-wrap items-center justify-between gap-4">
                        <div className="text-[10px] text-slate-500 font-mono">
                            Showing {filteredAnswers.length} of {answers.length} Q&A records
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleCopyTranscript}
                                disabled={answers.length === 0}
                                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-white/5 border border-white/10 hover:border-cyan-500/30 text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {copiedAll ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-emerald-400">Transcript Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy Full Transcript</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={onClose}
                                className="px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all cursor-pointer"
                            >
                                Close Review
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CandidateAnswersModal;

