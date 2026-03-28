import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Target, BookOpen, ArrowRight, Star, Zap, Award, Loader2 } from 'lucide-react';
import api from '../../services/api';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical', 'Aerospace'];

// Circular progress ring
const Ring = ({ value, max = 100, color, size = 80, label }) => {
    const r = (size / 2) - 6;
    const circ = 2 * Math.PI * r;
    const pct = Math.min(value / max, 1);
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
                        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
                        style={{ transition: 'stroke-dashoffset 1s ease', strokeLinecap: 'round' }} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-black" style={{ color }}>
                    {value}%
                </span>
            </div>
            {label && <span className="text-xs text-slate-400 text-center">{label}</span>}
        </div>
    );
};

// Role match card
const RoleCard = ({ role, isTop }) => (
    <div className={`glass-card p-5 rounded-2xl border ${isTop ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-slate-700'}`}>
        <div className="flex items-start justify-between mb-3">
            <div>
                <h4 className={`font-bold text-base ${isTop ? 'text-cyan-300' : 'text-white'}`}>{role.role}</h4>
                {isTop && <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full mt-1 inline-block border border-cyan-500/30">Best Match ⭐</span>}
            </div>
            <Ring value={role.match_percentage} color={isTop ? '#22d3ee' : '#818cf8'} size={60} />
        </div>

        {role.missing_skills?.length > 0 && (
            <div className="mb-3">
                <p className="text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">Skills to Add</p>
                <div className="flex flex-wrap gap-1.5">
                    {role.missing_skills.map(s => (
                        <span key={s} className="bg-red-500/10 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-500/20">{s}</span>
                    ))}
                </div>
            </div>
        )}

        {role.matched_skills?.length > 0 && (
            <div className="mb-3">
                <p className="text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">You Have</p>
                <div className="flex flex-wrap gap-1.5">
                    {role.matched_skills.slice(0, 4).map(s => (
                        <span key={s} className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full border border-emerald-500/20">{s}</span>
                    ))}
                </div>
            </div>
        )}

        <div>
            <p className="text-xs text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">Project Ideas</p>
            <ul className="space-y-1">
                {role.projects?.slice(0, 2).map(p => (
                    <li key={p} className="text-xs text-slate-300 flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-purple-400 flex-shrink-0" />{p}
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

// ── Main Component ──
const CareerAdvisor = () => {
    const [advice, setAdvice] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [branch, setBranch] = useState('CSE');
    const [mode, setMode] = useState('select'); // 'select' | 'result'

    const fetchAdvice = async () => {
        setLoading(true);
        setError('');
        try {
            // Try authenticated route first (reads resume skills)
            const token = localStorage.getItem('token');
            let data;
            if (token) {
                const res = await api.get('/career/advice');
                data = res.data;
            } else {
                // Use public branch-based route
                const res = await api.post('/career/advice/branch', { branch, skills: [] });
                data = res.data;
            }
            setAdvice(data);
            setMode('result');
        } catch (e) {
            // Fallback: generate locally from branch
            try {
                const res = await api.post('/career/advice/branch', { branch, skills: [] });
                setAdvice(res.data);
                setMode('result');
            } catch {
                setError('Could not load advice. Make sure the backend is running.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-3">
                        AI Career Advisor
                    </h1>
                    <p className="text-slate-400">Personalized career paths, skill gap analysis, and internship roadmap — based on your profile.</p>
                </div>

                {mode === 'select' && !loading && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="glass-panel p-10 rounded-3xl max-w-xl mx-auto text-center">
                        <div className="text-5xl mb-6">🎯</div>
                        <h2 className="text-xl font-bold text-white mb-4">Select your branch to get started</h2>
                        <p className="text-slate-400 text-sm mb-6">
                            {localStorage.getItem('token')
                                ? 'We\'ll use your resume skills for a personalized analysis.'
                                : 'Choose your branch for career path recommendations.'}
                        </p>
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            {BRANCHES.map(b => (
                                <button key={b} onClick={() => setBranch(b)}
                                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all border ${branch === b ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                    {b}
                                </button>
                            ))}
                        </div>
                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                        <button onClick={fetchAdvice}
                            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-900 font-black py-4 rounded-2xl hover:from-emerald-400 hover:to-cyan-500 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2">
                            <Target className="w-5 h-5" />
                            Analyze My Career Path
                        </button>
                    </motion.div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
                        <p className="text-slate-400">Analyzing your profile...</p>
                    </div>
                )}

                {mode === 'result' && advice && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

                        {/* Header info */}
                        <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-white">Your Career Analysis — <span className="text-emerald-400">{advice.branch}</span></h2>
                                <p className="text-slate-400 text-sm mt-1">Best fit role: <strong className="text-cyan-400">{advice.best_role}</strong></p>
                            </div>
                            <div className="flex gap-4">
                                {advice.top_roles?.slice(0, 1).map(r => (
                                    <Ring key={r.role} value={r.match_percentage} color="#34d399" size={72} label="Profile Match" />
                                ))}
                            </div>
                        </div>

                        {/* Role Cards */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-cyan-400" />Matching Career Roles</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {advice.top_roles?.map((role, i) => (
                                    <RoleCard key={role.role} role={role} isTop={i === 0} />
                                ))}
                            </div>
                        </div>

                        {/* Personalized Roadmap */}
                        <div className="glass-card p-8 rounded-3xl">
                            <h3 className="text-lg font-bold text-purple-400 mb-6 flex items-center gap-2"><Target className="w-5 h-5" />Your Personalized Roadmap</h3>
                            <div className="space-y-4">
                                {advice.improvement_roadmap?.map((step, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-purple-500/20">
                                            {i + 1}
                                        </div>
                                        <p className="text-slate-300 text-sm leading-relaxed mt-1">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Resources */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card p-6 rounded-2xl">
                                <h3 className="font-bold text-emerald-400 flex items-center gap-2 mb-4"><BookOpen className="w-4 h-4" />Free Learning Resources</h3>
                                <ul className="space-y-2">
                                    {advice.free_resources?.map(r => (
                                        <li key={r} className="flex items-center gap-2 text-sm text-slate-300">
                                            <Star className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />{r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="glass-card p-6 rounded-2xl">
                                <h3 className="font-bold text-blue-400 flex items-center gap-2 mb-4"><Award className="w-4 h-4" />Premium Courses</h3>
                                <ul className="space-y-2">
                                    {advice.paid_resources?.map(r => (
                                        <li key={r} className="flex items-center gap-2 text-sm text-slate-300">
                                            <Zap className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />{r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Certifications for best role */}
                        {advice.top_roles?.[0]?.certifications?.length > 0 && (
                            <div className="glass-card p-6 rounded-2xl">
                                <h3 className="font-bold text-yellow-400 flex items-center gap-2 mb-4"><Award className="w-4 h-4" />Recommended Certifications for {advice.best_role}</h3>
                                <div className="flex flex-wrap gap-3">
                                    {advice.top_roles[0].certifications.map(cert => (
                                        <div key={cert} className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
                                            <Award className="w-4 h-4" />{cert}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Internship suggestions */}
                        {advice.top_roles?.[0]?.internships?.length > 0 && (
                            <div className="glass-card p-6 rounded-2xl">
                                <h3 className="font-bold text-cyan-400 flex items-center gap-2 mb-4"><Briefcase className="w-4 h-4" />Internship Roles to Target</h3>
                                <div className="flex flex-wrap gap-3">
                                    {advice.top_roles.flatMap(r => r.internships).slice(0, 6).map(role => (
                                        <div key={role} className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                                            <ArrowRight className="w-3 h-3" />{role}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button onClick={() => setMode('select')}
                            className="text-slate-500 hover:text-slate-300 transition-colors text-sm">
                            ← Try a different branch
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CareerAdvisor;
