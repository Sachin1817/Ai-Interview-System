import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Medal, Crown, TrendingUp, Code2, FileText,
    BrainCircuit, Users, Filter, RefreshCw, Star, Zap
} from 'lucide-react';
import api from '../../services/api';

const BRANCHES = ['All', 'CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'AIDS', 'AIML', 'DS'];
const PERIODS = [
    { label: 'All Time', value: 'all' },
    { label: 'This Month', value: 'month' },
    { label: 'This Week', value: 'week' },
];

const RANK_MEDALS = {
    1: { icon: Crown, color: 'text-amber-400', bg: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-500/30', glow: 'shadow-amber-500/20', size: 'w-20 h-20' },
    2: { icon: Medal, color: 'text-slate-300', bg: 'from-slate-400/20 to-slate-500/10', border: 'border-slate-400/30', glow: 'shadow-slate-400/20', size: 'w-16 h-16' },
    3: { icon: Medal, color: 'text-amber-600', bg: 'from-amber-700/20 to-amber-800/10', border: 'border-amber-700/30', glow: 'shadow-amber-700/20', size: 'w-16 h-16' },
};

const ScoreBar = ({ label, value, color }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[10px]">
            <span className="text-slate-500 font-bold">{label}</span>
            <span className={`font-black ${color}`}>{value}</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full bg-current ${color}`}
            />
        </div>
    </div>
);

const PodiumCard = ({ entry, rank }) => {
    const cfg = RANK_MEDALS[rank];
    const Icon = cfg.icon;
    const isFirst = rank === 1;
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rank * 0.1 }}
            className={`relative flex flex-col items-center ${isFirst ? 'order-2 -mb-2' : rank === 2 ? 'order-1' : 'order-3'}`}
        >
            {entry.is_me && (
                <span className="absolute -top-3 bg-cyan-500 text-slate-950 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                    You
                </span>
            )}
            <div className={`relative bg-gradient-to-b ${cfg.bg} border ${cfg.border} rounded-3xl p-6 flex flex-col items-center shadow-xl ${cfg.glow} shadow-lg ${isFirst ? 'w-44' : 'w-36 mt-6'}`}>
                <div className={`${cfg.size} rounded-2xl flex items-center justify-center bg-black/20 mb-3`}>
                    <Icon className={`${isFirst ? 'w-10 h-10' : 'w-8 h-8'} ${cfg.color}`} />
                </div>
                <p className={`font-black text-white text-center truncate max-w-full ${isFirst ? 'text-base' : 'text-sm'}`}>{entry.name}</p>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">{entry.branch}</p>
                <div className={`mt-3 ${cfg.color} font-black ${isFirst ? 'text-3xl' : 'text-2xl'}`}>
                    {entry.composite}
                </div>
                <p className="text-[10px] text-slate-500">/ 100</p>
            </div>
            <div className={`mt-0 bg-gradient-to-b ${cfg.bg} border-x border-b ${cfg.border} rounded-b-2xl px-6 py-2 text-center`}>
                <span className={`text-xs font-black ${cfg.color}`}>#{rank}</span>
            </div>
        </motion.div>
    );
};

const Leaderboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [branch, setBranch] = useState('All');
    const [period, setPeriod] = useState('all');
    const [expandedRow, setExpandedRow] = useState(null);

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = { period };
            if (branch !== 'All') params.branch = branch;
            const { data: res } = await api.get('/career/leaderboard', { params });
            setData(res);
        } catch {
            setError('Could not load leaderboard. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [branch, period]);

    useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

    const list = data?.leaderboard || [];
    const top3 = list.slice(0, 3);
    const rest = list.slice(3);
    const myRank = data?.my_rank;
    const myEntry = list.find(e => e.is_me);

    return (
        <div className="min-h-screen pt-36 md:pt-40 pb-20 px-6 lg:px-12 relative overflow-visible">
            <div className="blob blob-1 opacity-20" />

            <div className="max-w-5xl mx-auto relative z-10">
                {/* Header */}
                <header className="mb-10">
                    <h2 className="text-5xl font-black mb-4 text-slate-900 dark:text-white tracking-tighter uppercase">
                        Candidate <span className="hero-gradient">Leaderboard</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-xl">
                        Ranked by composite score — Interview · Resume ATS · Assessment · Coding.
                    </p>
                </header>

                {/* My Rank Card */}
                {myEntry && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-2xl p-5 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                                <Star className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-0.5">Your Position</p>
                                <p className="text-white font-black text-lg">Rank #{myRank} of {data?.total}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-black text-cyan-400">{myEntry.composite}</p>
                            <p className="text-xs text-slate-500">Composite Score / 100</p>
                        </div>
                    </motion.div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-10">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Filter className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Filter</span>
                    </div>
                    {/* Branch */}
                    <div className="flex flex-wrap gap-2">
                        {BRANCHES.map(b => (
                            <button
                                key={b}
                                onClick={() => setBranch(b)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                    branch === b
                                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                                        : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                                }`}
                            >{b}</button>
                        ))}
                    </div>
                    <div className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />
                    {/* Period */}
                    <div className="flex gap-2">
                        {PERIODS.map(p => (
                            <button
                                key={p.value}
                                onClick={() => setPeriod(p.value)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                    period === p.value
                                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-400'
                                        : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                                }`}
                            >{p.label}</button>
                        ))}
                    </div>
                    <button
                        onClick={fetchLeaderboard}
                        className="ml-auto p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Calculating Rankings…</p>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                        <Trophy className="w-12 h-12 text-slate-700" />
                        <p className="text-slate-500 text-sm font-bold">{error}</p>
                    </div>
                )}

                {/* Podium — Top 3 */}
                {!loading && !error && top3.length >= 3 && (
                    <div className="flex items-end justify-center gap-4 mb-12">
                        {top3.map(e => <PodiumCard key={e.user_id} entry={e} rank={e.rank} />)}
                    </div>
                )}

                {/* Rest of Rankings */}
                {!loading && !error && list.length > 0 && (
                    <div className="bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                            <Users className="w-5 h-5 text-purple-400" />
                            <h3 className="text-sm font-black text-white uppercase tracking-tight">
                                {rest.length > 0 ? `Ranks #4–#${list.length}` : 'Top Rankings'}
                            </h3>
                            <span className="ml-auto text-[10px] text-slate-500 font-bold">{data?.total} candidates</span>
                        </div>

                        <div className="divide-y divide-white/5">
                            {(rest.length > 0 ? rest : list).map((entry, i) => (
                                <motion.div key={entry.user_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                                    <div
                                        onClick={() => setExpandedRow(expandedRow === entry.user_id ? null : entry.user_id)}
                                        className={`flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-white/5 transition-colors ${entry.is_me ? 'bg-cyan-500/5 border-l-2 border-cyan-500' : ''}`}
                                    >
                                        {/* Rank */}
                                        <span className={`w-8 text-center text-sm font-black ${entry.rank <= 3 ? 'text-amber-400' : 'text-slate-500'}`}>
                                            #{entry.rank}
                                        </span>
                                        {/* Name + Branch */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-bold truncate ${entry.is_me ? 'text-cyan-400' : 'text-white'}`}>
                                                    {entry.name}
                                                </p>
                                                {entry.is_me && <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full font-black border border-cyan-500/20">You</span>}
                                            </div>
                                            <p className="text-[10px] text-slate-500">{entry.branch}</p>
                                        </div>
                                        {/* Score Bar */}
                                        <div className="hidden sm:flex items-center gap-2 w-36">
                                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${entry.composite}%` }}
                                                    transition={{ duration: 0.6 }}
                                                    className={`h-full rounded-full ${entry.composite >= 70 ? 'bg-emerald-500' : entry.composite >= 40 ? 'bg-cyan-500' : 'bg-rose-500'}`}
                                                />
                                            </div>
                                        </div>
                                        {/* Composite */}
                                        <span className={`text-lg font-black w-14 text-right ${entry.composite >= 70 ? 'text-emerald-400' : entry.composite >= 40 ? 'text-cyan-400' : 'text-rose-400'}`}>
                                            {entry.composite}
                                        </span>
                                    </div>

                                    {/* Expanded Score Breakdown */}
                                    <AnimatePresence>
                                        {expandedRow === entry.user_id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden border-t border-white/5"
                                            >
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 py-4 bg-black/20">
                                                    <div className="flex items-center gap-2">
                                                        <BrainCircuit className="w-4 h-4 text-blue-400 shrink-0" />
                                                        <div className="flex-1">
                                                            <p className="text-[9px] text-slate-500 font-black uppercase">Interview</p>
                                                            <p className="text-sm font-black text-blue-400">{entry.interview_score}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                                                        <div className="flex-1">
                                                            <p className="text-[9px] text-slate-500 font-black uppercase">ATS Resume</p>
                                                            <p className="text-sm font-black text-emerald-400">{entry.ats_score}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                                                        <div className="flex-1">
                                                            <p className="text-[9px] text-slate-500 font-black uppercase">Assessment</p>
                                                            <p className="text-sm font-black text-purple-400">{entry.assessment_score}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />
                                                        <div className="flex-1">
                                                            <p className="text-[9px] text-slate-500 font-black uppercase">Coding</p>
                                                            <p className="text-sm font-black text-cyan-400">{entry.coding_score}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {!loading && !error && list.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Trophy className="w-14 h-14 text-slate-700" />
                        <p className="text-slate-500 font-bold">No candidates yet — be the first!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
