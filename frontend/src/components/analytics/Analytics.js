import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { TrendingUp, Trophy, BarChart2, FileText, Clock, Loader2, AlertCircle, Activity, BrainCircuit, Zap } from 'lucide-react';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CHART_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            align: 'end',
            labels: { 
                color: '#64748b', 
                font: { size: 10, weight: 'bold' },
                usePointStyle: true,
                padding: 20
            }
        },
        tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            titleColor: '#f8fafc',
            bodyColor: '#94a3b8',
            padding: 12,
            cornerRadius: 12,
            usePointStyle: true,
        }
    },
    scales: {
        x: { 
            ticks: { color: '#64748b', font: { size: 10 } }, 
            grid: { display: false } 
        },
        y: {
            min: 0, max: 10,
            ticks: { color: '#64748b', font: { size: 10 }, stepSize: 2 },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
        }
    },
};

// Stat card component
const StatCard = ({ label, value, icon: Icon, color, sub }) => {
    const colorClasses = {
        blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        yellow: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20 shadow-glow-cyan',
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    };

    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="glass-panel p-8 rounded-[2.5rem] border-white/5 shadow-xl relative overflow-hidden group"
        >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.08] transition-opacity" />
            <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-[0.2em]">{label}</p>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorClasses[color] || 'text-slate-400 bg-slate-400/10 border-slate-400/20'}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">{value}</p>
            {sub && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">{sub}</p>}
        </motion.div>
    );
};

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/career/analytics');
                setData(res.data);
            } catch (e) {
                setError('No analysis detected. Complete a test to see your results.');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin" />
            </div>
            <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Loading Performance Data</p>
        </div>
    );

    if (error) return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-12 rounded-[3.5rem] max-w-lg w-full text-center border-white/5 shadow-2xl"
            >
                <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <AlertCircle className="w-10 h-10 text-amber-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">No Data Yet</h2>
                <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-8">{error}</p>
                <button 
                    onClick={() => window.location.href = '/'}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                >
                    Take Your First Test
                </button>
            </motion.div>
        </div>
    );

    const trend = data?.interview_trend || [];
    const labels = trend.map((t, i) => t.label || `Test ${i + 1}`);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Total Score',
                data: trend.map(t => t.overall),
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                fill: true,
                tension: 0.45,
                pointBackgroundColor: '#06b6d4',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
            },
            {
                label: 'Technical Accuracy',
                data: trend.map(t => t.domain),
                borderColor: '#6366f1',
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.45,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
            },
            {
                label: 'Communication',
                data: trend.map(t => t.communication),
                borderColor: '#10b981',
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.45,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                borderDash: [5, 5],
            },
        ],
    };

    return (
        <div className="min-h-screen pt-60 pb-20 px-6 lg:px-12 relative overflow-visible">
            {/* Ambient Background */}
            <div className="blob blob-1 opacity-20"></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                <header className="mb-12">
                    <h2 className="text-5xl font-black mb-4 text-slate-900 dark:text-white tracking-tighter uppercase">
                        Performance <span className="hero-gradient">Results</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-xl">
                        Track your growth and identify strengths through detailed analytics.
                    </p>
                </header>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard label="Tests Taken" value={data?.total_interviews || 0} icon={BarChart2} color="blue" sub="Total attempts" />
                    <StatCard label="Highest Score" value={data?.best_score || '—'} icon={Trophy} color="yellow" sub="Personal best" />
                    <StatCard label="Latest Score" value={data?.latest_score || '—'} icon={TrendingUp} color="cyan" sub="Most recent" />
                    <StatCard label="ATS Readiness" value={`${data?.resume_score || 0}%`} icon={FileText} color="emerald" sub="Resume score" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Score Trend Chart */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 glass-panel p-10 rounded-[3rem] border-white/5 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                            <TrendingUp className="w-64 h-64" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-10 flex items-center gap-3 uppercase tracking-tight">
                            <TrendingUp className="w-6 h-6 text-cyan-500" /> Score Progress
                        </h2>
                        <div className="h-[400px]">
                            <Line data={chartData} options={CHART_OPTIONS} />
                        </div>
                    </motion.div>

                    {/* Skills Detected */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-panel p-10 rounded-[3rem] border-white/5 shadow-2xl"
                    >
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
                            <BrainCircuit className="w-6 h-6 text-purple-500" /> My Skills
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {data?.resume_skills?.length > 0 ? (
                                data.resume_skills.map(s => (
                                    <span key={s} className="bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-purple-500/30 hover:bg-purple-500/5 transition-all cursor-default">
                                        {s}
                                    </span>
                                ))
                            ) : (
                                <p className="text-slate-500 italic text-sm">Upload a resume to see your skills.</p>
                            )}
                        </div>

                        <div className="mt-12 pt-12 border-t border-slate-200 dark:border-white/5">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                    <Zap className="w-6 h-6 text-cyan-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none">AI Tip</p>
                                    <p className="text-slate-700 dark:text-slate-200 font-bold text-sm mt-1">Keep Practicing</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Regular tests help our AI provide better career roadmaps for you.
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Interview History Table */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel rounded-[3rem] border-white/5 overflow-hidden shadow-2xl"
                >
                    <div className="px-10 py-8 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tight">
                            <Clock className="w-6 h-6 text-purple-500" /> History
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                                    <th className="text-left text-slate-500 dark:text-slate-400 font-black px-10 py-5 text-[10px] uppercase tracking-[0.2em]">Test ID</th>
                                    <th className="text-left text-slate-500 dark:text-slate-400 font-black px-6 py-5 text-[10px] uppercase tracking-[0.2em]">Subject</th>
                                    <th className="text-left text-slate-500 dark:text-slate-400 font-black px-6 py-5 text-[10px] uppercase tracking-[0.2em]">Difficulty</th>
                                    <th className="text-right text-slate-500 dark:text-slate-400 font-black px-10 py-5 text-[10px] uppercase tracking-[0.2em]">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trend.length > 0 ? (
                                    [...trend].reverse().map((t, i) => (
                                        <tr key={i} className="border-b border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-white/20 group-hover:bg-cyan-500 transition-colors" />
                                                    <span className="text-slate-700 dark:text-slate-200 font-bold">{t.label}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="text-slate-500 dark:text-slate-400 font-medium">{t.branch || 'General'}</span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                                    t.difficulty === 'Hard' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' :
                                                    t.difficulty === 'Medium' ? 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' :
                                                    'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                                                }`}>
                                                    {t.difficulty || 'Normal'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3 px-1">
                                                    <div className="w-24 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden hidden sm:block">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${t.overall * 10}%` }}
                                                            className={`h-full ${t.overall >= 7 ? 'bg-emerald-500 shadow-glow-cyan' : t.overall >= 5 ? 'bg-cyan-500' : 'bg-rose-500'}`}
                                                        />
                                                    </div>
                                                    <span className={`font-black tracking-tight ${t.overall >= 7 ? 'text-emerald-500' : t.overall >= 5 ? 'text-cyan-500' : 'text-rose-500'}`}>
                                                        {t.overall}/10
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-10 py-20 text-center text-slate-500 font-medium italic">
                                            No history recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Analytics;
