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
        <div className="min-h-screen p-8 max-w-5xl mx-auto">
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
                        <Sparkles className="w-3 h-3" /> Powered by Gemini AI
                    </div>
                </div>

                {!result ? (
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
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Start Analysis'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-6 rounded-2xl text-center">
                                <span className="text-sm text-slate-400 block mb-2 uppercase tracking-widest font-bold">Job Readiness Score</span>
                                <div className="text-5xl font-black text-emerald-400">{result.score}%</div>
                            </div>
                            <div className="glass-card p-6 rounded-2xl md:col-span-2">
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
