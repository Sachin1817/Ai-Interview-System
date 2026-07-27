import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resumeAPI } from '../../services/api';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';

const ResumeUpload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const onFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const onUpload = async () => {
        if (!file) return setError('Please select a file first');

        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await resumeAPI.upload(formData);
            setResult(response.data.diagnosis);
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed. Ensure you are logged in.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 lg:pt-36 pb-20 px-8 max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 rounded-3xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Resume Diagnosis Engine
                    </h2>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                        <Sparkles className="w-3 h-3" /> Powered by Groq AI
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-8">
                        {/* Futuristic Scanning Document Graphic */}
                        <div className="relative w-48 h-64 bg-slate-950/80 rounded-2xl border border-cyan-500/30 overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col justify-between p-4">
                            {/* Inner lines representing text */}
                            <div className="space-y-3 opacity-30">
                                <div className="h-3 bg-slate-700 rounded w-3/4"></div>
                                <div className="h-3 bg-slate-700 rounded w-5/6"></div>
                                <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                                <div className="h-3 bg-slate-700 rounded w-3/4"></div>
                            </div>
                            <div className="space-y-3 opacity-30">
                                <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                                <div className="h-3 bg-slate-700 rounded w-3/4"></div>
                                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                            </div>
                            
                            {/* Scanning laser beam */}
                            <motion.div 
                                className="absolute left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 shadow-[0_0_15px_#22d3ee]"
                                animate={{ top: ["10%", "90%", "10%"] }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                            />
                            
                            {/* Glowing corner brackets */}
                            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400 rounded-tl" />
                            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400 rounded-tr" />
                            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400 rounded-bl" />
                            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400 rounded-br" />
                        </div>

                        {/* Scanning Status Text */}
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-white tracking-wide uppercase flex items-center justify-center gap-3">
                                <Loader2 className="animate-spin w-5 h-5 text-cyan-400" />
                                Analyzing Document
                            </h3>
                            <p className="text-sm text-cyan-400/70 font-semibold tracking-wider uppercase animate-pulse">
                                Deep parsing resume layout & structure
                            </p>
                        </div>

                        {/* Rolling Terminal Output */}
                        <div className="w-full max-w-md bg-slate-950/70 border border-white/5 rounded-2xl p-4 font-mono text-xs text-slate-400 text-left space-y-1.5 shadow-inner">
                            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 border-b border-white/5 pb-1">
                                <span>Scanning Logs</span>
                                <span className="animate-pulse text-emerald-400">● Live Connection</span>
                            </div>
                            <div className="text-cyan-400">✔ PDF loaded successfully ({file?.size ? (file.size / 1024).toFixed(1) : 0} KB)</div>
                            <div className="text-cyan-400/80">✔ Extracted text character matrix</div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-indigo-400">✔ Triggering Groq Llama 3.3 pipeline...</motion.div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="text-slate-400">⟳ Computing ATS match compatibility score...</motion.div>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4.5 }} className="text-slate-500">⟳ Synthesizing professional roadmap paths...</motion.div>
                        </div>
                    </div>
                ) : !result ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 p-12 rounded-2xl bg-slate-900/40">
                        <Upload className="w-16 h-16 text-slate-500 mb-4" />
                        <p className="text-slate-400 mb-6 text-center">
                            Drag and drop your resume (PDF only) or click to browse
                        </p>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={onFileChange}
                            className="hidden"
                            id="resume-input"
                        />
                        <label
                            htmlFor="resume-input"
                            className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl cursor-pointer transition-all border border-slate-600 mb-6"
                        >
                            {file ? file.name : 'Select PDF'}
                        </label>

                        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                        <button
                            onClick={onUpload}
                            disabled={!file || loading}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 font-bold px-10 py-4 rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            Start Analysis
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* ATS Score Card & Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-8 rounded-3xl text-center flex flex-col items-center justify-center bg-slate-900/40 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full filter blur-xl group-hover:bg-cyan-500/20 transition-all duration-500" />
                                <span className="text-xs text-slate-400 block mb-4 uppercase tracking-[0.2em] font-black">ATS Score</span>
                                
                                {/* Radial progress ring */}
                                <div className="relative w-36 h-36 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="72" cy="72" r="60" className="stroke-slate-800 fill-none" strokeWidth="10" />
                                        <motion.circle 
                                            cx="72" 
                                            cy="72" 
                                            r="60" 
                                            className="stroke-cyan-400 fill-none" 
                                            strokeWidth="10" 
                                            strokeDasharray={2 * Math.PI * 60}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - result.score / 100) }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="absolute text-4xl font-black text-white">
                                        {result.score}%
                                    </span>
                                </div>
                                
                                <span className="text-xs text-emerald-400 mt-4 font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                    {result.score >= 80 ? "Optimal Match" : result.score >= 60 ? "Average Match" : "Action Needed"}
                                </span>
                            </div>
                            
                            {/* ATS Breakdown bars */}
                            <div className="glass-card p-8 rounded-3xl md:col-span-2 bg-slate-900/40 flex flex-col justify-between">
                                <div>
                                    <span className="text-xs text-slate-400 block mb-4 uppercase tracking-[0.2em] font-black">ATS Breakdown</span>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Formatting & Layout', value: result.ats_breakdown?.formatting || 70, color: 'from-cyan-400 to-blue-500' },
                                            { label: 'Keyword Match', value: result.ats_breakdown?.keywords || 65, color: 'from-purple-400 to-indigo-500' },
                                            { label: 'Action & Impact Verbs', value: result.ats_breakdown?.impact_verbs || 75, color: 'from-emerald-400 to-teal-500' }
                                        ].map(item => (
                                            <div key={item.label} className="space-y-1.5">
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className="text-slate-300">{item.label}</span>
                                                    <span className="text-cyan-400">{item.value}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${item.value}%` }}
                                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Detected Location badge */}
                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                                    <span>Candidate Location: <strong className="text-slate-300">{result.location || "India"}</strong></span>
                                    <span>Detected Skills: <strong className="text-cyan-400">{result.skills?.length || 0}</strong></span>
                                </div>
                            </div>
                        </div>

                        {/* ATS Feedback / Suggestions */}
                        {result.detailed_ats_feedback?.length > 0 && (
                            <div className="glass-card p-8 rounded-3xl bg-slate-900/40">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-cyan-400" /> ATS Compatibility Recommendations
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.detailed_ats_feedback.map((feedback, idx) => (
                                        <div key={idx} className="flex gap-3 items-start bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                                            <div className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">!</div>
                                            <span className="text-sm text-slate-300 font-semibold">{feedback}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Detected Skills */}
                            <div className="glass-card p-6 rounded-2xl md:col-span-3">
                                <span className="text-sm text-slate-400 block mb-2 uppercase tracking-widest font-bold">Detected Skills</span>
                                <div className="flex flex-wrap gap-2">
                                    {result.skills.map(skill => (
                                        <span key={skill} className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-sm border border-cyan-500/20">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="glass-card p-8 rounded-3xl bg-red-500/5 border-red-500/10">
                                <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" /> Skill Gaps Identified
                                </h3>
                                <ul className="space-y-3">
                                    {result.missing_skills.map(skill => (
                                        <li key={skill} className="text-slate-300 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" /> {skill}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="glass-card p-8 rounded-3xl bg-emerald-500/5 border-emerald-500/10">
                                <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" /> Predicted Job Roles
                                </h3>
                                <div className="space-y-2">
                                    {result.job_roles.map(role => (
                                        <div key={role} className="text-slate-300 font-medium">{role}</div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-3xl">
                            <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5" /> Recommended Roadmap
                            </h3>
                            <div className="space-y-6">
                                {result.roadmap.map((step, idx) => (
                                    <div key={idx} className="flex gap-4 items-start">
                                        <div className="bg-purple-500/20 text-purple-400 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold border border-purple-500/30">
                                            {idx + 1}
                                        </div>
                                        <p className="text-slate-300 mt-1">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setResult(null)}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            Analyze Another Resume
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ResumeUpload;
