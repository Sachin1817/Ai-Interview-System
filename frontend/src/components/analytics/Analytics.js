import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { TrendingUp, Trophy, BarChart2, FileText, Clock, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CHART_OPTIONS = {
    responsive: true,
    plugins: {
        legend: {
            labels: { color: '#94a3b8', font: { size: 11 } }
        },
        tooltip: {
            backgroundColor: '#0f172a',
            borderColor: '#334155',
            borderWidth: 1,
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
        }
    },
    scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
        y: {
            min: 0, max: 10,
            ticks: { color: '#64748b' },
            grid: { color: '#1e293b' }
        }
    },
};

// Stat card component
const StatCard = ({ label, value, icon: Icon, color, sub }) => (
    <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">{label}</p>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${color}-500/10`}>
                <Icon className={`w-4 h-4 text-${color}-400`} />
            </div>
        </div>
        <p className={`text-4xl font-black text-${color}-400`}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
);

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Please login to view your analytics.');
                    setLoading(false);
                    return;
                }
                const res = await api.get('/career/analytics');
                setData(res.data);
            } catch (e) {
                setError('No data yet. Complete an interview or assessment to see your analytics!');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            <p className="text-slate-400">Loading your analytics...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="glass-panel p-10 rounded-3xl max-w-md w-full text-center">
                <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-3">No Data Yet</h2>
                <p className="text-slate-400 text-sm">{error}</p>
            </div>
        </div>
    );

    const trend = data?.interview_trend || [];
    const labels = trend.map((t, i) => t.label || `Session ${i + 1}`);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Overall Score',
                data: trend.map(t => t.overall),
                borderColor: '#22d3ee',
                backgroundColor: 'rgba(34,211,238,0.08)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#22d3ee',
                pointRadius: 5,
            },
            {
                label: 'Domain Score',
                data: trend.map(t => t.domain),
                borderColor: '#818cf8',
                backgroundColor: 'rgba(129,140,248,0.05)',
                fill: false,
                tension: 0.4,
                pointBackgroundColor: '#818cf8',
                pointRadius: 5,
            },
            {
                label: 'Communication',
                data: trend.map(t => t.communication),
                borderColor: '#34d399',
                backgroundColor: 'rgba(52,211,153,0.05)',
                fill: false,
                tension: 0.4,
                pointBackgroundColor: '#34d399',
                pointRadius: 5,
                borderDash: [4, 4],
            },
        ],
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-3">
                        📊 Performance Analytics
                    </h1>
                    <p className="text-slate-400">Track your improvement across interviews, resume score, and skills over time.</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Interviews Done" value={data?.total_interviews || 0} icon={BarChart2} color="blue" sub="Total sessions" />
                    <StatCard label="Best Score" value={data?.best_score || '—'} icon={Trophy} color="yellow" sub="Out of 10" />
                    <StatCard label="Latest Score" value={data?.latest_score || '—'} icon={TrendingUp} color="cyan" sub="Most recent" />
                    <StatCard label="Resume Score" value={`${data?.resume_score || 0}%`} icon={FileText} color="emerald" sub="Job readiness" />
                </div>

                {/* Score Trend Chart */}
                {trend.length > 0 ? (
                    <div className="glass-panel p-8 rounded-3xl mb-8">
                        <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-cyan-400" />Interview Score Trend
                        </h2>
                        <Line data={chartData} options={CHART_OPTIONS} />
                    </div>
                ) : (
                    <div className="glass-panel p-10 rounded-3xl text-center mb-8">
                        <BarChart2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">Complete your first AI interview to see score trends here!</p>
                    </div>
                )}

                {/* Skills Detected */}
                {data?.resume_skills?.length > 0 && (
                    <div className="glass-card p-6 rounded-2xl mb-8">
                        <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-400" />Skills Detected in Resume
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {data.resume_skills.map(s => (
                                <span key={s} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full text-sm font-medium capitalize">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Interview History Table */}
                {trend.length > 0 && (
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-700/50">
                            <h3 className="font-bold text-slate-200 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-400" />Recent Interview Sessions
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-700/50">
                                        <th className="text-left text-slate-400 font-semibold px-6 py-3 text-xs uppercase tracking-wider">Session</th>
                                        <th className="text-left text-slate-400 font-semibold px-4 py-3 text-xs uppercase tracking-wider">Branch</th>
                                        <th className="text-left text-slate-400 font-semibold px-4 py-3 text-xs uppercase tracking-wider">Difficulty</th>
                                        <th className="text-right text-slate-400 font-semibold px-6 py-3 text-xs uppercase tracking-wider">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...trend].reverse().map((t, i) => (
                                        <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-4 text-slate-300 font-medium">{t.label}</td>
                                            <td className="px-4 py-4 text-slate-400">{t.branch || '—'}</td>
                                            <td className="px-4 py-4 text-slate-400">{t.difficulty || '—'}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-bold ${t.overall >= 7 ? 'text-emerald-400' : t.overall >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                    {t.overall}/10
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
