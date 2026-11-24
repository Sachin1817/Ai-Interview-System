import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3, TrendingUp, Users, Briefcase, Award,
    RefreshCw, ArrowRight, ChevronDown, FileText
} from 'lucide-react';
import api from '../../services/api';

const PERIODS = [
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: '90 Days', value: '90' },
    { label: 'All Time', value: '3650' },
];


const FunnelBar = ({ label, value, max, color }) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">{label}</span>
                <span className={`font-black ${color}`}>{value}</span>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-current ${color}`}
                />
            </div>
        </div>
    );
};

const TrendBars = ({ data }) => {
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="flex items-end gap-2 h-32">
            {data.map((d, i) => {
                const h = Math.max((d.count / max) * 100, 4);
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="w-full relative" style={{ height: '80%' }}>
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: i * 0.05 }}
                                className="absolute bottom-0 w-full bg-cyan-500/30 group-hover:bg-cyan-500/60 rounded-t-lg border-t border-cyan-500/50 transition-colors"
                                title={`${d.count} applications`}
                            />
                        </div>
                        <span className="text-[9px] text-slate-600 font-bold">{d.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

const HRAnalyticsDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: res } = await api.get('/admin/analytics', { params: { period } });
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const kpis = data?.kpis || {};
    const funnel = data?.funnel || {};
    const trend = data?.weekly_trend || [];
    const branchDist = data?.branch_dist || [];
    const topJobs = data?.top_jobs || [];
    const branchScores = data?.branch_scores || [];
    const funnelMax = funnel.applied || 1;

    const conversionRate = funnelMax > 0 ? ((funnel.hired / funnelMax) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <BarChart3 className="w-7 h-7 text-cyan-400" />
                        Hiring Analytics
                    </h2>
                    <p className="text-slate-500 text-xs mt-1">Visualize your recruitment funnel and placement trends.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Period Filter */}
                    <div className="flex gap-1.5">
                        {PERIODS.map(p => (
                            <button
                                key={p.value}
                                onClick={() => setPeriod(p.value)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                    period === p.value
                                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                                        : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
                                }`}
                            >{p.label}</button>
                        ))}
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                </div>
            )}

            {!loading && data && (
                <>
                    {/* KPI Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[
                            { label: 'Candidates', value: kpis.total_candidates, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                            { label: 'Active Jobs', value: kpis.active_jobs, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                            { label: 'Applications', value: kpis.total_applications, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                            { label: 'Placements', value: kpis.placements, icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                            { label: 'Avg ATS Score', value: `${kpis.avg_ats_score}%`, icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                        ].map((k, i) => (
                            <motion.div
                                key={k.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`bg-[#0F1728] border ${k.border} rounded-2xl p-5`}
                            >
                                <div className={`w-9 h-9 rounded-xl ${k.bg} border ${k.border} flex items-center justify-center mb-3`}>
                                    <k.icon className={`w-5 h-5 ${k.color}`} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{k.label}</p>
                                <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Row 2: Funnel + Weekly Trend */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Hiring Funnel */}
                        <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-cyan-400" /> Hiring Funnel
                                </h3>
                                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                                    {conversionRate}% hired
                                </span>
                            </div>
                            <FunnelBar label="Applied" value={funnel.applied} max={funnelMax} color="text-cyan-400" />
                            <FunnelBar label="Shortlisted" value={funnel.shortlisted} max={funnelMax} color="text-blue-400" />
                            <FunnelBar label="Interview Scheduled" value={funnel.interview_scheduled} max={funnelMax} color="text-purple-400" />
                            <FunnelBar label="Hired" value={funnel.hired} max={funnelMax} color="text-emerald-400" />
                            <FunnelBar label="Rejected" value={funnel.rejected} max={funnelMax} color="text-rose-400" />
                        </div>

                        {/* Weekly Application Trend */}
                        <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2 mb-6">
                                <BarChart3 className="w-4 h-4 text-purple-400" /> Weekly Applications
                            </h3>
                            <TrendBars data={trend} />
                            <p className="text-[10px] text-slate-600 font-bold mt-4 text-center">Last 7 Weeks</p>
                        </div>
                    </div>

                    {/* Row 3: Branch Distribution + Top Jobs */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Branch Distribution */}
                        <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-6 space-y-3">
                            <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2 mb-4">
                                <Users className="w-4 h-4 text-cyan-400" /> Candidates by Branch
                            </h3>
                            {branchDist.length === 0 && <p className="text-slate-500 text-xs italic">No data yet.</p>}
                            {branchDist.map((b, i) => {
                                const maxB = branchDist[0]?.count || 1;
                                const pct = Math.min((b.count / maxB) * 100, 100);
                                return (
                                    <div key={b.branch} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-300 font-bold">{b.branch}</span>
                                            <span className="text-slate-500 font-black">{b.count}</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ delay: i * 0.06, duration: 0.7 }}
                                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Top Jobs by Applications */}
                        <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2 mb-4">
                                <Briefcase className="w-4 h-4 text-amber-400" /> Most Applied Jobs
                            </h3>
                            <div className="space-y-3">
                                {topJobs.length === 0 && <p className="text-slate-500 text-xs italic">No applications yet.</p>}
                                {topJobs.map((j, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-[#060B16]/60 border border-[#1E293B] rounded-xl p-3">
                                        <span className="text-xs font-black text-slate-500 w-6">#{i+1}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white truncate">{j.title}</p>
                                            <p className="text-[10px] text-slate-500">{j.company}</p>
                                        </div>
                                        <span className="text-xs font-black text-cyan-400 shrink-0">{j.count} apps</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Row 4: Branch Interview Score Rankings */}
                    {branchScores.length > 0 && (
                        <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2 mb-6">
                                <Award className="w-4 h-4 text-emerald-400" /> Avg Interview Score by Branch
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                {branchScores.map((b, i) => (
                                    <motion.div
                                        key={b.branch}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-[#060B16]/60 border border-[#1E293B] rounded-2xl p-4 text-center"
                                    >
                                        <p className={`text-2xl font-black ${b.avg >= 7 ? 'text-emerald-400' : b.avg >= 5 ? 'text-cyan-400' : 'text-rose-400'}`}>
                                            {b.avg}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{b.branch}</p>
                                        <p className="text-[9px] text-slate-600 mt-0.5">{b.count} sessions</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default HRAnalyticsDashboard;
