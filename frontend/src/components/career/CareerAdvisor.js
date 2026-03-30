import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Target, BookOpen, ArrowRight, Star, Zap, Award, Loader2, MapPin, Building2, CheckCircle2, AlertCircle, Sparkles, ChevronDown } from 'lucide-react';
import api from '../../services/api';
import CareerChatbot from './CareerChatbot';

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
            {label && <span className="text-[10px] text-slate-500 text-center uppercase font-bold tracking-tight">{label}</span>}
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

// ── Job Card Component ──
const JobCard = ({ job, userSkills, resumeScore }) => {
    const [matching, setMatching] = useState(false);
    const [matchResult, setMatchResult] = useState(null);
    const [expanded, setExpanded] = useState(false);

    const runMatching = async () => {
        if (matchResult) { setExpanded(!expanded); return; }
        setMatching(true);
        try {
            const res = await api.post('/career/jobs/match', { job, skills: userSkills, resume_score: resumeScore });
            setMatchResult(res.data);
            setExpanded(true);
        } catch (e) {
            console.error("Match matching error", e);
        } finally {
            setMatching(false);
        }
    };

    return (
        <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 flex gap-2">
                {job.is_closing_soon && (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20 flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-2.5 h-2.5" /> Closing Soon
                    </span>
                )}
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${job.jobType === 'Internship' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                    {job.jobType}
                </span>
            </div>

            <div className="flex gap-4 items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-xl shadow-inner border border-white/5">
                    {job.company.charAt(0)}
                </div>
                <div>
                    <h4 className="font-bold text-white group-hover:text-cyan-300 transition-colors uppercase tracking-tight">{job.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-slate-400 text-[10px] font-bold">
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {job.company}</span>
                        <span className="flex items-center gap-1 text-cyan-400/80"><MapPin className="w-3 h-3" /> {job.location}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <div className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified Active
                </div>
                {job.days_remaining !== undefined && (
                    <div className="text-[9px] font-bold text-slate-500">
                        Deadline: <span className={job.is_closing_soon ? 'text-red-400' : 'text-slate-300'}>{job.deadline}</span>
                    </div>
                )}
            </div>

            <div className="mb-4">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-wider">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                    {job.skills?.slice(0, 4).map(s => (
                        <span key={s} className="bg-slate-800/50 text-slate-300 text-[10px] px-2 py-0.5 rounded-lg border border-white/5">{s}</span>
                    ))}
                </div>
            </div>

            {matchResult ? (
                <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-slate-300">Profile Match</span>
                        <span className="text-xs font-black text-cyan-400">{matchResult.match_score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${matchResult.match_score}%` }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        />
                    </div>
                </div>
            ) : (
                <button 
                    onClick={runMatching}
                    disabled={matching}
                    className="w-full py-2.5 rounded-xl bg-slate-800/50 border border-white/5 text-xs font-bold text-slate-400 hover:text-white hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2 mb-4"
                >
                    {matching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-cyan-400" />}
                    Analyze Match Score
                </button>
            )}

            <AnimatePresence>
                {expanded && matchResult && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/5 pt-4 mb-4"
                    >
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Why you match</p>
                                <p className="text-xs text-slate-300 flex items-start gap-2">
                                    <CheckCircle2 className="w-3 h-3 mt-0.5 text-emerald-500" /> {matchResult.why_match}
                                </p>
                            </div>
                            {matchResult.missing_skills?.length > 0 && (
                                <div>
                                    <p className="text-[10px] text-red-400 font-bold uppercase mb-1">Skill Gaps</p>
                                    <div className="flex flex-wrap gap-1">
                                        {matchResult.missing_skills.map(s => (
                                            <span key={s} className="text-[10px] text-red-300 bg-red-500/5 px-2 py-0.5 rounded-md border border-red-500/10">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/10">
                                <p className="text-[10px] text-cyan-400 font-bold uppercase mb-1">AI Advice</p>
                                <p className="text-xs text-slate-200 italic">"{matchResult.improvement_advice}"</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <a 
                href={job.applyLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full block text-center py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
            >
                Apply Now
            </a>
        </div>
    );
};

// ── Main Component ──
const CareerAdvisor = () => {
    const [advice, setAdvice] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingJobs, setLoadingJobs] = useState(false);
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
            
            // Fetch jobs in parallel
            fetchJobs(data.branch, data.best_role, data.top_roles?.[0]?.matched_skills || []);
            
        } catch (e) {
            // Fallback: generate locally from branch
            try {
                const res = await api.post('/career/advice/branch', { branch, skills: [] });
                setAdvice(res.data);
                setMode('result');
                fetchJobs(res.data.branch, res.data.best_role);
            } catch {
                setError('Could not load advice. Make sure the backend is running.');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async (userBranch, userRole, userSkills) => {
        setLoadingJobs(true);
        try {
            // Get user location from local profile info if it exists
            const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
            const location = userProfile.location || userProfile.state || "";

            const res = await api.post('/career/jobs/recommendations', { 
                branch: userBranch, 
                role: userRole,
                skills: userSkills,
                location: location 
            });
            setJobs(res.data);
        } catch (e) {
            console.error("Job fetch error", e);
        } finally {
            setLoadingJobs(false);
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
                                        <p className="text-slate-300 text-sm leading-relaxed mt-1 font-medium">{step}</p>
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

                        {/* Internship roles to target */}
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

                        {/* Smart Opportunity Recommendations */}
                        <div className="pt-8 border-t border-white/5">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-indigo-400 to-blue-600 rounded-xl shadow-lg shadow-indigo-500/20">
                                    <Zap className="w-5 h-5 text-slate-950" />
                                </div>
                                Current Open Internships and Placements
                            </h3>
                            
                            {loadingJobs ? (
                                <div className="flex flex-col items-center py-12 gap-3">
                                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                                    <p className="text-slate-500 text-sm">Searching for opportunities...</p>
                                </div>
                            ) : jobs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {jobs.map(job => (
                                        <JobCard 
                                            key={job._id} 
                                            job={job} 
                                            userSkills={advice.top_roles?.[0]?.matched_skills || []}
                                            resumeScore={advice.top_roles?.[0]?.match_percentage || 0}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="glass-panel p-12 rounded-3xl text-center border-dashed border-white/10">
                                    <div className="text-3xl mb-4">🔍</div>
                                    <p className="text-slate-400">No specific openings found for this role yet. We'll alert you when matching positions open up.</p>
                                </div>
                            )}
                        </div>

                        <button onClick={() => setMode('select')}
                            className="text-slate-500 hover:text-slate-300 transition-colors text-sm mt-8 block">
                            ← Try a different branch
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CareerAdvisor;
