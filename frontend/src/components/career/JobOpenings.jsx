import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Briefcase, Calendar, MapPin, Sparkles, CheckCircle2, 
    ArrowRight, ShieldAlert, Clock, Code, Award, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const JobOpenings = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [assigned, setAssigned] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [resumeSkills, setResumeSkills] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Skill match modal state
    const [matchModal, setMatchModal] = useState({ open: false, job: null });
    const [applyStatus, setApplyStatus] = useState({ text: '', type: 'success' });
 
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch HR jobs
                const jobsRes = await api.get('/admin/jobs');
                setJobs(jobsRes.data);
 
                // Fetch assigned HR challenges
                const assignedRes = await api.get('/interview/assigned');
                setAssigned(assignedRes.data);
 
                // Fetch applied jobs list
                const appliedRes = await api.get('/admin/applied-jobs');
                setAppliedJobs(appliedRes.data);
 
                // Fetch user profile to check eligibility
                try {
                    const profileRes = await api.get('/auth/profile');
                    setUserProfile(profileRes.data);
                } catch (profErr) {
                    console.log("Could not load user profile details.", profErr);
                }
 
                // Fetch candidate resume skills
                try {
                    const diagnosisRes = await api.get('/resume/diagnosis');
                    setResumeSkills(diagnosisRes.data?.skills || []);
                } catch (resErr) {
                    console.log("No resume diagnosis found yet.", resErr);
                }
            } catch (err) {
                console.error("Error fetching candidate career data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleApply = async (jobId) => {
        setApplyStatus({ text: '', type: 'success' });
        try {
            await api.post('/admin/apply', { job_id: jobId });
            setApplyStatus({ text: 'Application submitted successfully!', type: 'success' });
            
            // Refresh applied jobs list
            const appliedRes = await api.get('/admin/applied-jobs');
            setAppliedJobs(appliedRes.data);

            setTimeout(() => {
                setMatchModal({ open: false, job: null });
                setApplyStatus({ text: '', type: 'success' });
            }, 1500);
        } catch (err) {
            setApplyStatus({ text: err.response?.data?.message || 'Failed to submit application', type: 'error' });
        }
    };

    const isApplied = (jobId) => {
        return appliedJobs.some(app => app.job_id === jobId);
    };

    const calculateMatch = (requiredSkills = []) => {
        if (!resumeSkills.length || !requiredSkills.length) return 0;
        const normUserSkills = resumeSkills.map(s => s.toLowerCase().trim());
        const normRequiredSkills = requiredSkills.map(s => s.toLowerCase().trim());
        const matches = normRequiredSkills.filter(s => normUserSkills.includes(s));
        return Math.round((matches.length / normRequiredSkills.length) * 100);
    };

    const getMatchedAndMissing = (requiredSkills = []) => {
        const normUserSkills = resumeSkills.map(s => s.toLowerCase().trim());
        const matched = [];
        const missing = [];
        
        requiredSkills.forEach(skill => {
            if (normUserSkills.includes(skill.toLowerCase().trim())) {
                matched.push(skill);
            } else {
                missing.push(skill);
            }
        });

        return { matched, missing };
    };

    const launchChallenge = (challenge) => {
        if (challenge.interview_type === 'standard') {
            // Save to localStorage for AIInterview to auto-load
            localStorage.setItem('auto_launch_assigned', JSON.stringify(challenge));
            navigate('/interview');
        } else if (challenge.interview_type === 'coding') {
            // Save to localStorage for CodingInterview to auto-load
            localStorage.setItem('auto_launch_assigned', JSON.stringify(challenge));
            navigate('/coding-interview');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-40 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-black animate-pulse">Syncing openings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-36 md:pt-40 pb-20 px-6 relative overflow-visible bg-[#060b16]">
            {/* Background blur overlays */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10 space-y-12">
                
                {/* PAGE HEADER */}
                <header className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                        <Briefcase className="w-3.5 h-3.5" /> Career Opportunities
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
                        Job Openings & Tasks
                    </h1>
                    <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                        Apply to placement drives, view real-time skill matching compatibility, and launch assigned coding or behavioral challenge tasks configured by the recruitment admins.
                    </p>
                </header>

                {/* SECTION 1: ASSIGNED CHALLENGES */}
                {assigned.length > 0 && (
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-[#1E293B] pb-4">
                            <Clock className="w-5 h-5 text-purple-400" />
                            <h2 className="text-lg font-black uppercase tracking-wider text-white">Pending HR Action Items</h2>
                            <span className="bg-purple-500/20 text-purple-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-purple-500/20 animate-pulse">
                                {assigned.length} ASSIGNED
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {assigned.map((challenge) => {
                                const isCoding = challenge.interview_type === 'coding';
                                return (
                                    <div 
                                        key={challenge._id} 
                                        className="bg-[#0F1728] border border-[#1E293B] hover:border-purple-500/30 p-6 rounded-[2rem] flex flex-col justify-between transition-all duration-300 relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-5 text-purple-500 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                                            {isCoding ? <Code className="w-32 h-32" /> : <Award className="w-32 h-32" />}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                                                    isCoding 
                                                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                                                        : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                                                }`}>
                                                    {isCoding ? 'Coding Arena' : 'Standard Q&A'}
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-bold">| Assigned by HR Admin</span>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                                    {challenge.role} Assessment
                                                </h3>
                                                <p className="text-slate-400 text-xs mt-1">
                                                    Difficulty Level: <span className="text-white font-bold">{challenge.difficulty}</span>
                                                </p>
                                            </div>

                                            {isCoding && challenge.coding_challenge && (
                                                <div className="bg-[#060b16]/60 border border-white/5 p-4 rounded-xl text-xs space-y-2">
                                                    <div className="font-bold text-white uppercase text-[9px] tracking-wider text-purple-400">Coding challenge:</div>
                                                    <div className="text-white font-black text-sm">{challenge.coding_challenge.title}</div>
                                                    <div className="text-slate-400 line-clamp-2 leading-relaxed">{challenge.coding_challenge.description}</div>
                                                </div>
                                            )}

                                            {!isCoding && challenge.manual_questions && (
                                                <div className="bg-[#060b16]/60 border border-white/5 p-4 rounded-xl text-xs space-y-2">
                                                    <div className="font-bold text-white uppercase text-[9px] tracking-wider text-cyan-400">Interview questions:</div>
                                                    <div className="text-slate-200 font-semibold">{challenge.manual_questions.length} Custom questions configured.</div>
                                                    <div className="text-slate-400 truncate leading-relaxed">"{challenge.manual_questions[0]}"</div>
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            onClick={() => launchChallenge(challenge)}
                                            className="w-full mt-6 bg-slate-900 hover:bg-purple-500 text-white hover:text-white border border-[#1E293B] hover:border-purple-400 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 group transition-all"
                                        >
                                            Launch Workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* SECTION 2: JOB OPENINGS LIST */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-[#1E293B] pb-4">
                        <Briefcase className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-lg font-black uppercase tracking-wider text-white">Active Placement Opportunities</h2>
                    </div>

                    {jobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobs.map((job) => {
                                const hasApplied = isApplied(job._id);
                                const matchScore = calculateMatch(job.skills);
                                return (
                                    <div 
                                        key={job._id}
                                        className="bg-[#0F1728] border border-[#1E293B] p-6 rounded-[2rem] flex flex-col justify-between transition-all duration-300 hover:border-cyan-500/20"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-base font-black text-white uppercase tracking-tight leading-tight truncate">{job.title}</h3>
                                                    <p className="text-xs font-bold text-slate-500 mt-0.5">{job.company}</p>
                                                </div>
                                                {resumeSkills.length > 0 && (
                                                    <div className={`px-2.5 py-1 rounded-lg text-center border shrink-0 ${
                                                        matchScore >= 80 
                                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                            : matchScore >= 50 
                                                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                                                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                                    }`}>
                                                        <div className="text-[8px] font-black uppercase tracking-wider">Match</div>
                                                        <div className="text-sm font-black">{matchScore}%</div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[10px] text-slate-400">
                                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {job.location}</span>
                                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> {job.jobType}</span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[10px] text-slate-400 bg-white/5 px-3 py-2 rounded-xl border border-white/5 mt-2">
                                                <span className="flex items-center gap-1 text-slate-400">Cutoff: <span className="text-cyan-400 font-black">{job.cgpaCutoff ? job.cgpaCutoff.toFixed(2) : '0.00'} CGPA</span></span>
                                                <span className="flex items-center gap-1 text-slate-400">Vacancies: <span className="text-purple-400 font-black">{job.vacancies || 1} Openings</span></span>
                                            </div>
 
                                            <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-medium">
                                                {job.description || 'No detailed job description supplied. Open requirements for matching placement profile.'}
                                            </p>
 
                                            <div className="space-y-1.5">
                                                <div className="text-[9px] uppercase font-black tracking-widest text-slate-500">Required Skills</div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {job.skills.map((skill, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 rounded text-[8px] font-black bg-white/5 border border-white/5 text-slate-300 uppercase">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
 
                                        <div className="mt-6 pt-4 border-t border-white/5">
                                            {(() => {
                                                const isBelowCutoff = job.cgpaCutoff && userProfile?.cgpa && (userProfile.cgpa < job.cgpaCutoff);
                                                if (hasApplied) {
                                                    return (
                                                        <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                                            <Check className="w-4 h-4" /> Applied
                                                        </div>
                                                    );
                                                }
                                                if (isBelowCutoff) {
                                                    return (
                                                        <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.1em] flex items-center justify-center gap-2">
                                                            <ShieldAlert className="w-4 h-4 shrink-0" /> Below Cutoff ({job.cgpaCutoff.toFixed(2)})
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <button 
                                                        onClick={() => setMatchModal({ open: true, job })}
                                                        className="w-full bg-white hover:bg-cyan-500 text-slate-950 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-98"
                                                    >
                                                        View Match & Apply
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-[#0F1728] border border-[#1E293B] p-12 rounded-[2rem] text-center max-w-xl mx-auto space-y-4">
                            <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
                            <h3 className="text-base font-black text-white uppercase tracking-wider">No Job Openings Registered</h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                The HR Recruitment Admin has not posted any active job specifications yet. Please check back later.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            {/* MATCH & APPLY MODAL */}
            <AnimatePresence>
                {matchModal.open && matchModal.job && (() => {
                    const { matched, missing } = getMatchedAndMissing(matchModal.job.skills);
                    const matchScore = calculateMatch(matchModal.job.skills);
                    const job = matchModal.job;
                    return (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#0F1728] border border-[#1E293B] p-8 rounded-[2rem] w-full max-w-2xl shadow-2xl relative"
                            >
                                <button 
                                    onClick={() => setMatchModal({ open: false, job: null })}
                                    className="absolute top-6 right-6 text-slate-500 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="mb-6 space-y-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                                        MATCH PROFILE DIAGNOSIS
                                    </span>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
                                        {job.title}
                                    </h3>
                                    <p className="text-slate-400 text-xs">{job.company} — {job.location}</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Match Ring / Stats */}
                                    <div className="flex items-center gap-4 bg-[#060b16]/60 border border-white/5 p-4 rounded-2xl">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 text-lg font-black border-4 ${
                                            matchScore >= 80 
                                                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' 
                                                : matchScore >= 50 
                                                    ? 'border-amber-500 text-amber-400 bg-amber-500/5' 
                                                    : 'border-rose-500 text-rose-400 bg-rose-500/5'
                                        }`}>
                                            {matchScore}%
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Placement Score Match</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">Calculated by mapping resume indexing tags against required keywords.</p>
                                        </div>
                                    </div>

                                    {/* Skill Comparison */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Matched Skills */}
                                        <div className="space-y-2">
                                            <div className="text-[9px] uppercase font-black tracking-widest text-emerald-400 flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills ({matched.length})
                                            </div>
                                            <div className="bg-[#060b16]/40 border border-[#1E293B] p-4 rounded-xl min-h-[100px] flex flex-wrap gap-1.5 content-start">
                                                {matched.length > 0 ? (
                                                    matched.map((skill, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase">
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-slate-600 font-bold">No skills matched.</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Missing Skills */}
                                        <div className="space-y-2">
                                            <div className="text-[9px] uppercase font-black tracking-widest text-rose-400 flex items-center gap-1.5">
                                                <ShieldAlert className="w-3.5 h-3.5" /> Missing Skills ({missing.length})
                                            </div>
                                            <div className="bg-[#060b16]/40 border border-[#1E293B] p-4 rounded-xl min-h-[100px] flex flex-wrap gap-1.5 content-start">
                                                {missing.length > 0 ? (
                                                    missing.map((skill, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 rounded text-[8px] font-black bg-rose-500/10 border border-rose-500/20 text-rose-400 uppercase">
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-[10px] text-emerald-500 font-bold">You match all requirements!</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-8 flex justify-between items-center gap-3 border-t border-white/5 pt-6">
                                        <button 
                                            onClick={() => setMatchModal({ open: false, job: null })}
                                            className="px-6 py-3 rounded-xl text-xs font-bold bg-white/5 border border-white/5 hover:bg-white/10 transition-all uppercase tracking-wider text-slate-300"
                                        >
                                            Close
                                        </button>
                                        {(() => {
                                            const isBelowCutoff = job.cgpaCutoff && userProfile?.cgpa && (userProfile.cgpa < job.cgpaCutoff);
                                            if (isBelowCutoff) {
                                                return (
                                                    <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-2">
                                                        <ShieldAlert className="w-4 h-4 shrink-0" /> Below Cutoff (Required: {job.cgpaCutoff.toFixed(2)} / Yours: {userProfile.cgpa.toFixed(2)})
                                                    </div>
                                                );
                                            }
                                            return (
                                                <button 
                                                    onClick={() => handleApply(job._id)}
                                                    className="px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all"
                                                >
                                                    Confirm Application
                                                </button>
                                            );
                                        })()}
                                    </div>

                                    {applyStatus.text && (
                                        <div className={`p-4 rounded-xl text-xs font-bold border flex gap-2 ${
                                            applyStatus.type === 'success' 
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                                        }`}>
                                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                                            <span>{applyStatus.text}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>
        </div>
    );
};

// Simple Close icon definition
const X = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default JobOpenings;
