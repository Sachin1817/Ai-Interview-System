import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, BookOpen, Cpu, Briefcase, Award, CheckCircle, 
    ChevronRight, ChevronLeft, Save, Sparkles, Download, 
    Plus, Trash2, Rocket, Zap, Target
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../firebase/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../../services/api';

const ResumeBuilder = () => {
    const { currentUser } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [atsData, setAtsData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    const [resumeData, setResumeData] = useState({
        personalInfo: {
            fullName: '',
            email: currentUser?.email || '',
            phoneNumber: '',
            location: '',
            linkedin: '',
            github: '',
            portfolio: '',
            photoURL: ''
        },
        education: [{ degree: '', branch: '', collegeName: '', university: '', startYear: '', endYear: '', cgpa: '' }],
        skills: { technical: '', languages: '', tools: '', soft: '' },
        projects: [{ title: '', description: '', technologiesUsed: '', githubLink: '', role: '', duration: '' }],
        experience: [{ companyName: '', role: '', duration: '', responsibilities: '' }],
        certifications: [{ name: '', organization: '', year: '' }],
        achievements: { awards: '', publications: '' }
    });

    const steps = [
        { id: 1, title: 'Personal Info', icon: <User className="w-5 h-5" /> },
        { id: 2, title: 'Education', icon: <BookOpen className="w-5 h-5" /> },
        { id: 3, title: 'Skills', icon: <Cpu className="w-5 h-5" /> },
        { id: 4, title: 'Projects', icon: <Rocket className="w-5 h-5" /> },
        { id: 5, title: 'Experience', icon: <Briefcase className="w-5 h-5" /> },
        { id: 6, title: 'Certifications', icon: <Award className="w-5 h-5" /> },
        { id: 7, title: 'Achievements', icon: <Target className="w-5 h-5" /> },
        { id: 8, title: 'AI Preview', icon: <Sparkles className="w-5 h-5" /> }
    ];

    // ─── HANDLERS ───
    const handleInputChange = (section, field, value) => {
        setResumeData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const handleArrayChange = (section, index, field, value) => {
        const newArray = resumeData[section].map((item, i) => 
            i === index ? { ...item, [field]: value } : item
        );
        setResumeData(prev => ({ ...prev, [section]: newArray }));
    };

    const addArrayItem = (section, item) => {
        setResumeData(prev => ({
            ...prev,
            [section]: [...prev[section], item]
        }));
    };

    const removeArrayItem = (section, index) => {
        if (resumeData[section].length > 1) {
            setResumeData(prev => ({
                ...prev,
                [section]: prev[section].filter((_, i) => i !== index)
            }));
        }
    };

    // ─── FIREBASE SYNC ───
    useEffect(() => {
        const fetchResume = async () => {
            if (!currentUser) return;
            try {
                const docRef = doc(db, 'resumes', currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setResumeData(docSnap.data());
                }
            } catch (err) {
                console.warn("Firestore fetch error (likely offline):", err);
            }
        };
        fetchResume();
    }, [currentUser]);

    const saveToFirebase = async () => {
        if (!currentUser) return;
        setIsSaving(true);
        try {
            await setDoc(doc(db, 'resumes', currentUser.uid), resumeData);
            setIsSaving(false);
        } catch (err) {
            console.error("Firebase save error", err);
            setIsSaving(false);
        }
    };

    // ─── AI INTEGRATION ───
    const analyzeResume = async () => {
        setStep(8); // Move to the final page immediately
        setAiLoading(true);
        try {
            const res = await api.post('/resume/analyze', { resumeData });
            setAtsData(res.data);
        } catch (err) {
            console.error("AI Analysis failed", err);
        } finally {
            setAiLoading(false);
        }
    };

    const improveDescription = async (index) => {
        const original = resumeData.projects[index].description;
        if (!original) return;
        setAiLoading(true);
        try {
            const res = await api.post('/resume/improve-description', { description: original });
            handleArrayChange('projects', index, 'description', res.data.improved);
        } catch (err) {
            console.error("AI improvement failed", err);
        } finally {
            setAiLoading(false);
        }
    };

    const downloadPDF = async () => {
        setLoading(true);
        try {
            const input = document.getElementById('resume-preview-content');
            if (!input) {
                console.error("Resume content not found for PDF generation");
                return;
            }

            const canvas = await html2canvas(input, {
                scale: 2, 
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            // Create PDF with aspect ratio of the generated canvas
            const pdfData = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height] 
            });

            pdfData.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdfData.save(`${resumeData.personalInfo.fullName.replace(/\s+/g, '_') || 'My'}_Resume.pdf`);
        } catch (err) {
            console.error("PDF download failed", err);
        } finally {
            setLoading(false);
        }
    };

    // ─── RENDER COMPONENTS ───
    const ProgressHeader = () => (
        <div className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-premium-gradient rounded-2xl flex items-center justify-center shadow-glow-primary">
                        <User className="w-8 h-8 text-slate-900" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Resume <span className="hero-gradient">Architect</span></h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-lg">Phase {step} / 8</span>
                            <span className="text-slate-400 font-bold text-sm">| {steps[step-1].title}</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={saveToFirebase}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl border transition-all font-black text-xs uppercase tracking-widest ${isSaving ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-glow-cyan' : 'bg-white/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:text-cyan-500 hover:border-cyan-500/50'}`}
                >
                    {isSaving ? <Zap className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Synchronizing...' : 'Sync to Cloud'}
                </button>
            </div>
            
            <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden shadow-inner flex p-0.5">
                {steps.map((s, i) => {
                    const isActive = i + 1 <= step;
                    return (
                        <div key={s.id} className="relative flex-grow h-full px-0.5">
                            <motion.div 
                                initial={false}
                                animate={{ 
                                    opacity: isActive ? 1 : 0.2,
                                    backgroundColor: isActive ? 'var(--tw-gradient-from)' : 'rgba(148, 163, 184, 0.1)'
                                }}
                                className={`h-full w-full rounded-full transition-all duration-700 ${isActive ? 'bg-premium-gradient shadow-glow-primary' : 'bg-slate-300 dark:bg-white/10'}`} 
                            />
                            {i + 1 === step && (
                                <motion.div layoutId="progress-glow" className="absolute inset-0 bg-white/40 blur-sm rounded-full" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-40 pb-20 px-6 lg:px-12 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="blob blob-1 opacity-20"></div>
            <div className="blob blob-2 opacity-20"></div>

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 relative z-10">
                
                {/* ─── LEFT: INPUT FORM ─── */}
                <div className="flex-1">
                    <ProgressHeader />
                    
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={step}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                            className="glass-panel p-10 lg:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 pointer-events-none">
                                {steps[step-1].icon}
                            </div>

                            {/* Step Content */}
                            {step === 1 && (
                                <section className="space-y-10">
                                    <header className="mb-4">
                                        <h3 className="section-heading !mb-2">Identity & Reach</h3>
                                        <p className="text-slate-500 text-sm">Modern ATS systems prioritize clear contact information.</p>
                                    </header>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex justify-between">
                                                <span>Full Name</span>
                                                <span className="text-cyan-500">Required</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                value={resumeData.personalInfo.fullName}
                                                onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                                                placeholder="Satoshi Nakamoto"
                                                className="premium-input" 
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Public Identifier (Email)</label>
                                            <input 
                                                type="email" 
                                                value={resumeData.personalInfo.email}
                                                readOnly
                                                className="premium-input !bg-slate-100/50 dark:!bg-white/5 !border-transparent !text-slate-400 cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Mobile Extension</label>
                                            <input 
                                                type="text" 
                                                value={resumeData.personalInfo.phoneNumber}
                                                onChange={(e) => handleInputChange('personalInfo', 'phoneNumber', e.target.value)}
                                                placeholder="+91 98765 43210"
                                                className="premium-input" 
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">LinkedIn Nexus</label>
                                            <input 
                                                type="text" 
                                                value={resumeData.personalInfo.linkedin}
                                                onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
                                                placeholder="linkedin.com/in/user"
                                                className="premium-input" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Geographic Base</label>
                                        <input 
                                            type="text" 
                                            value={resumeData.personalInfo.location}
                                            onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                                            placeholder="Dubai, UAE"
                                            className="premium-input" 
                                        />
                                    </div>
                                </section>
                            )}

                            {step === 2 && (
                                <section className="space-y-10">
                                    <header>
                                        <h3 className="section-heading !mb-2">Academic Foundation</h3>
                                        <p className="text-slate-500 text-sm">Chronicle your journey through formal education.</p>
                                    </header>
                                    <div className="space-y-12">
                                        {resumeData.education.map((edu, idx) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={idx} 
                                                className="p-10 bg-slate-100/30 dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/5 relative group shadow-inner"
                                            >
                                                <button 
                                                    onClick={() => removeArrayItem('education', idx)}
                                                    className="absolute top-6 right-6 p-3 text-slate-400 hover:text-red-500 bg-white dark:bg-white/5 rounded-2xl shadow-sm transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Credential / Degree</label>
                                                        <input 
                                                            type="text" 
                                                            value={edu.degree}
                                                            onChange={(e) => handleArrayChange('education', idx, 'degree', e.target.value)}
                                                            className="premium-input !bg-white dark:!bg-slate-950" 
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Institution Name</label>
                                                        <input 
                                                            type="text" 
                                                            value={edu.collegeName}
                                                            onChange={(e) => handleArrayChange('education', idx, 'collegeName', e.target.value)}
                                                            className="premium-input !bg-white dark:!bg-slate-950" 
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Timeline (Start - End)</label>
                                                        <input 
                                                            type="text" 
                                                            value={edu.startYear}
                                                            onChange={(e) => handleArrayChange('education', idx, 'startYear', e.target.value)}
                                                            className="premium-input !bg-white dark:!bg-slate-950" 
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Metric (CGPA / %)</label>
                                                        <input 
                                                            type="text" 
                                                            value={edu.cgpa}
                                                            onChange={(e) => handleArrayChange('education', idx, 'cgpa', e.target.value)}
                                                            className="premium-input !bg-white dark:!bg-slate-950" 
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => addArrayItem('education', { degree: '', branch: '', collegeName: '', university: '', startYear: '', endYear: '', cgpa: '' })}
                                        className="w-full py-8 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] text-slate-400 hover:text-cyan-500 hover:border-cyan-500/30 bg-slate-50 dark:bg-white/5 hover:bg-cyan-500/5 transition-all flex items-center justify-center gap-4 font-black text-sm uppercase tracking-widest"
                                    >
                                        <Plus className="w-6 h-6" /> Append Educational Milestone
                                    </button>
                                </section>
                            )}

                            {step === 3 && (
                                <section className="space-y-12">
                                    <header>
                                        <h3 className="section-heading !mb-2">Technical Arsenal</h3>
                                        <p className="text-slate-500 text-sm">Our AI will optimize these keywords for parser compatibility.</p>
                                    </header>
                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Primary Tech Stack</label>
                                                <span className="text-[8px] text-cyan-500 font-black uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">High ATS Intensity</span>
                                            </div>
                                            <textarea 
                                                value={resumeData.skills.technical}
                                                onChange={(e) => handleInputChange('skills', 'technical', e.target.value)}
                                                placeholder="e.g. React.js, TypeScript, Kubernetes, Node.js..."
                                                className="premium-input min-h-[140px] !py-6"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Subsidary Tools</label>
                                            <textarea 
                                                value={resumeData.skills.tools}
                                                onChange={(e) => handleInputChange('skills', 'tools', e.target.value)}
                                                placeholder="e.g. Git, Docker, JIRA, Postman..."
                                                className="premium-input min-h-[120px] !py-6"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Natural Languages</label>
                                            <textarea 
                                                value={resumeData.skills.languages}
                                                onChange={(e) => handleInputChange('skills', 'languages', e.target.value)}
                                                placeholder="e.g. Native Proficiency: English, Hindi, German..."
                                                className="premium-input min-h-[100px] !py-6"
                                            />
                                        </div>
                                    </div>
                                </section>
                            )}

                            {step === 4 && (
                                <section className="space-y-12">
                                    <header>
                                        <h3 className="section-heading !mb-2">Project Portfolio</h3>
                                        <p className="text-slate-500 text-sm">Each project is an opportunity to showcase practical application of your tech stack.</p>
                                    </header>
                                    <div className="space-y-10">
                                        {resumeData.projects.map((proj, idx) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={idx} 
                                                className="p-10 bg-slate-100/30 dark:bg-white/5 rounded-[3.5rem] border border-slate-200 dark:border-white/5 relative group shadow-inner"
                                            >
                                                <button 
                                                    onClick={() => removeArrayItem('projects', idx)}
                                                    className="absolute top-6 right-6 p-3 text-slate-400 hover:text-red-500 bg-white dark:bg-white/5 rounded-2xl shadow-sm transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                
                                                <div className="space-y-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Project Title</label>
                                                            <input 
                                                                type="text" 
                                                                value={proj.title}
                                                                onChange={(e) => handleArrayChange('projects', idx, 'title', e.target.value)}
                                                                className="premium-input !bg-white dark:!bg-slate-950" 
                                                            />
                                                        </div>
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Core Technologies</label>
                                                            <input 
                                                                type="text" 
                                                                value={proj.technologiesUsed}
                                                                onChange={(e) => handleArrayChange('projects', idx, 'technologiesUsed', e.target.value)}
                                                                className="premium-input !bg-white dark:!bg-slate-950" 
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <label className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Impact & Description</label>
                                                            <button 
                                                                onClick={() => improveDescription(idx)}
                                                                disabled={aiLoading}
                                                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20 px-4 py-2 rounded-full border border-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
                                                            >
                                                                <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                                                                {aiLoading ? 'Synthesizing...' : 'AI Enhance'}
                                                            </button>
                                                        </div>
                                                        <textarea 
                                                            value={proj.description}
                                                            onChange={(e) => handleArrayChange('projects', idx, 'description', e.target.value)}
                                                            className="premium-input !bg-white dark:!bg-slate-950 min-h-[160px] !py-6" 
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => addArrayItem('projects', { title: '', description: '', technologiesUsed: '', githubLink: '', role: '', duration: '' })}
                                        className="w-full py-8 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] text-slate-400 hover:text-cyan-500 hover:border-cyan-500/30 bg-slate-50 dark:bg-white/5 hover:bg-cyan-500/5 transition-all flex items-center justify-center gap-4 font-black text-sm uppercase tracking-widest"
                                    >
                                        <Plus className="w-6 h-6" /> Catalog New Research/Project
                                    </button>
                                </section>
                            )}

                            {step === 5 && (
                                <section className="space-y-12">
                                    <header>
                                        <h3 className="section-heading !mb-2">Professional Trajectory</h3>
                                        <p className="text-slate-500 text-sm">Internships, roles, and corporate experience.</p>
                                    </header>
                                    <div className="space-y-10">
                                        {resumeData.experience.map((exp, idx) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={idx} 
                                                className="p-10 bg-slate-100/30 dark:bg-white/5 rounded-[3.5rem] border border-slate-200 dark:border-white/5 relative group shadow-inner"
                                            >
                                                <button 
                                                    onClick={() => removeArrayItem('experience', idx)}
                                                    className="absolute top-6 right-6 p-3 text-slate-400 hover:text-red-500 bg-white dark:bg-white/5 rounded-2xl shadow-sm transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Corporate Entity</label>
                                                        <input 
                                                            type="text" 
                                                            value={exp.companyName}
                                                            onChange={(e) => handleArrayChange('experience', idx, 'companyName', e.target.value)}
                                                            className="premium-input !bg-white dark:!bg-slate-950" 
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Professional Designation</label>
                                                        <input 
                                                            type="text" 
                                                            value={exp.role}
                                                            onChange={(e) => handleArrayChange('experience', idx, 'role', e.target.value)}
                                                            className="premium-input !bg-white dark:!bg-slate-950" 
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4 mt-8">
                                                    <label className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Core Responsibilities</label>
                                                    <textarea 
                                                        value={exp.responsibilities}
                                                        onChange={(e) => handleArrayChange('experience', idx, 'responsibilities', e.target.value)}
                                                        className="premium-input !bg-white dark:!bg-slate-950 min-h-[140px] !py-6" 
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => addArrayItem('experience', { companyName: '', role: '', duration: '', responsibilities: '' })}
                                        className="w-full py-8 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] text-slate-400 hover:text-cyan-500 hover:border-cyan-500/30 bg-slate-50 dark:bg-white/5 hover:bg-cyan-500/5 transition-all flex items-center justify-center gap-4 font-black text-sm uppercase tracking-widest"
                                    >
                                        <Plus className="w-6 h-6" /> Add Professional Block
                                    </button>
                                </section>
                            )}

                            {step === 6 && (
                                <section className="space-y-12">
                                    <header>
                                        <h3 className="section-heading !mb-2">Validated Expertise</h3>
                                        <p className="text-slate-500 text-sm">Certifications and official validations of your skills.</p>
                                    </header>
                                    <div className="space-y-8">
                                        {resumeData.certifications.map((cert, idx) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={idx} 
                                                className="p-8 bg-slate-100/30 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5 relative group"
                                            >
                                                <button 
                                                    onClick={() => removeArrayItem('certifications', idx)}
                                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Certification Name"
                                                        value={cert.name}
                                                        onChange={(e) => handleArrayChange('certifications', idx, 'name', e.target.value)}
                                                        className="premium-input !bg-white dark:!bg-slate-950" 
                                                    />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Issuing Organization"
                                                        value={cert.organization}
                                                        onChange={(e) => handleArrayChange('certifications', idx, 'organization', e.target.value)}
                                                        className="premium-input !bg-white dark:!bg-slate-950" 
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => addArrayItem('certifications', { name: '', organization: '', year: '' })}
                                        className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl text-slate-400 hover:text-cyan-500 hover:border-cyan-500/30 bg-slate-50 dark:bg-white/5 transition-all flex items-center justify-center gap-4 font-black text-xs uppercase tracking-widest"
                                    >
                                        <Plus className="w-5 h-5" /> Append Certification
                                    </button>
                                </section>
                            )}

                            {step === 7 && (
                                <section className="space-y-12">
                                    <header>
                                        <h3 className="section-heading !mb-2">Distinctions & Honors</h3>
                                        <p className="text-slate-500 text-sm">Awards, publications, and competitive achievements.</p>
                                    </header>
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">Accomplishment Registry</label>
                                            <textarea 
                                                value={resumeData.achievements.awards}
                                                onChange={(e) => handleInputChange('achievements', 'awards', e.target.value)}
                                                placeholder="e.g. Winner of National Innovation Challenge 2024, Published paper on AI Ethics..."
                                                className="premium-input min-h-[220px] !py-8" 
                                            />
                                        </div>
                                    </div>
                                </section>
                            )}

                            {step === 8 && (
                                <section className="space-y-12">
                                    <header>
                                        <h3 className="section-heading !mb-2">Intelligence Assessment</h3>
                                        <p className="text-slate-500 text-sm">Our neural engine has analyzed your profile against modern hiring metrics.</p>
                                    </header>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="glass-panel p-10 rounded-[3rem] border-cyan-500/20 bg-cyan-500/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-premium-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
                                            <div className="relative mb-8">
                                                <div className="w-32 h-32 rounded-full border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center">
                                                    {aiLoading ? (
                                                        <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                                                    ) : (
                                                        <div className="text-4xl font-black text-slate-900 dark:text-white">
                                                            {atsData ? `${atsData.atsScore}%` : '??'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute inset-0 border-4 border-cyan-500 rounded-full animate-pulse shadow-glow-cyan" />
                                            </div>
                                            <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Parser Velocity</h4>
                                            <p className="text-slate-500 text-sm font-medium">Likelihood of bypassing automated recruitment filters.</p>
                                        </div>

                                        <div className="flex flex-col gap-6">
                                            <button 
                                                onClick={downloadPDF}
                                                disabled={loading}
                                                className="flex-1 bg-premium-gradient p-10 rounded-[3rem] flex flex-col items-center justify-center gap-4 group transition-all shadow-glow-primary active:scale-95 disabled:opacity-50"
                                            >
                                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-slate-900 border border-white/30 group-hover:scale-110 transition-transform">
                                                    <Download className={`w-8 h-8 ${loading ? 'animate-bounce' : ''}`} />
                                                </div>
                                                <div className="text-center">
                                                    <span className="block text-slate-900 font-black text-xl uppercase tracking-tighter">Harvest PDF</span>
                                                    <span className="text-slate-900/60 text-[10px] font-black uppercase tracking-widest">ATS-Optimized Vector Format</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {atsData && (
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2.5rem]">
                                                    <h5 className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                                        <CheckCircle className="w-4 h-4" /> Competitive Advantages
                                                    </h5>
                                                    <ul className="space-y-4">
                                                        {atsData.strengths.map((s, i) => (
                                                            <li key={i} className="text-slate-600 dark:text-slate-300 text-sm flex gap-3 font-medium">
                                                                <span className="text-emerald-500 font-black">•</span> {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="bg-yellow-500/5 border border-yellow-500/10 p-8 rounded-[2.5rem]">
                                                    <h5 className="text-yellow-600 dark:text-yellow-400 font-black text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                                        <Zap className="w-4 h-4" /> Strategic Optimizations
                                                    </h5>
                                                    <ul className="space-y-4">
                                                        {atsData.suggestions.slice(0, 3).map((s, i) => (
                                                            <li key={i} className="text-slate-600 dark:text-slate-300 text-sm flex gap-3 font-medium">
                                                                <span className="text-yellow-500 font-black">•</span> {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* ─── NAVIGATION BUTTONS ─── */}
                            <div className="flex flex-col sm:flex-row justify-between items-center mt-16 pt-10 border-t border-slate-200 dark:border-white/5 gap-6">
                                <button 
                                    onClick={() => setStep(prev => Math.max(1, prev - 1))}
                                    disabled={step === 1}
                                    className={`flex items-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                                >
                                    <ChevronLeft className="w-5 h-5" /> Regress Phase
                                </button>
                                
                                {step === 8 ? (
                                    <button 
                                        onClick={() => setStep(1)}
                                        className="w-full sm:w-auto px-12 py-5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/5"
                                    >
                                        Recall Init Settings
                                    </button>
                                ) : step === 7 ? (
                                    <button 
                                        onClick={analyzeResume}
                                        disabled={aiLoading}
                                        className="w-full sm:w-auto px-12 py-5 bg-premium-gradient text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-glow-primary hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {aiLoading ? (
                                            <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                        ) : <Sparkles className="w-4 h-4" />}
                                        {aiLoading ? 'Synthesizing...' : 'Finalize & Execute Analysis'}
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <button 
                                            onClick={downloadPDF}
                                            disabled={loading || !resumeData.personalInfo.fullName}
                                            className="lg:hidden p-5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-2xl transition-all border border-slate-200 dark:border-white/5"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                        
                                        <button 
                                            onClick={() => setStep(prev => prev + 1)}
                                            className="flex-1 sm:flex-none px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-cyan-500 hover:text-slate-900 hover:shadow-glow-cyan transition-all active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            Advance Workflow <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* ─── RIGHT: LIVE PREVIEW ─── */}
                <div className="hidden lg:block w-[450px]">
                    <div className="sticky top-32">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.4em]">Live Rendering</h3>
                            <div className="flex gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            </div>
                        </div>
                        
                        <div className="glass-panel rounded-[3rem] p-4 bg-slate-200/50 dark:bg-slate-900/50 border-white/5 shadow-2xl overflow-hidden group">
                            <div className="bg-white rounded-[2rem] shadow-2xl h-[700px] overflow-y-auto p-12 origin-top hover:scale-[1.01] transition-transform duration-700 custom-scrollbar relative">
                                {/* Visual Resume Rendering */}
                                <div id="resume-preview-content" className="text-slate-950 font-sans bg-white min-h-full">
                                    <div className="text-center border-b-[3px] border-slate-900 pb-8 mb-10">
                                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-4">{resumeData.personalInfo.fullName || 'Your Identity'}</h1>
                                        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest space-x-2">
                                            <span>{resumeData.personalInfo.email}</span>
                                            {resumeData.personalInfo.phoneNumber && <span>• {resumeData.personalInfo.phoneNumber}</span>}
                                            {resumeData.personalInfo.location && <span>• {resumeData.personalInfo.location}</span>}
                                        </div>
                                        <div className="text-[9px] text-cyan-600 font-black mt-3 uppercase tracking-[0.2em]">
                                            {resumeData.personalInfo.linkedin} {resumeData.personalInfo.linkedin && resumeData.personalInfo.github && '|'} {resumeData.personalInfo.github}
                                        </div>
                                    </div>

                                    <section className="mb-10">
                                        <h2 className="text-[14px] font-black uppercase text-slate-900 border-b-2 border-slate-100 pb-2 mb-5 tracking-[0.25em]">Educational Core</h2>
                                        {resumeData.education.map((e, i) => (
                                            e.degree && (
                                                <div key={i} className="mb-5 last:mb-0">
                                                    <div className="flex justify-between items-baseline font-black text-xs uppercase tracking-tight">
                                                        <span className="text-slate-900">{e.degree} {e.branch && `- ${e.branch}`}</span>
                                                        <span className="text-[9px] text-slate-500">{e.startYear} - {e.endYear || 'Present'}</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-600 font-bold mt-1 inline-flex items-center gap-2">
                                                        {e.collegeName} <span className="w-1 h-1 rounded-full bg-slate-300" /> CGPA: {e.cgpa}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </section>

                                    <section className="mb-10">
                                        <h2 className="text-[14px] font-black uppercase text-slate-900 border-b-2 border-slate-100 pb-2 mb-5 tracking-[0.25em]">Research & Projects</h2>
                                        {resumeData.projects.map((p, i) => (
                                            p.title && (
                                                <div key={i} className="mb-6 last:mb-0">
                                                    <div className="flex justify-between items-baseline font-black text-[11px] uppercase tracking-tight">
                                                        <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{p.title}</span>
                                                        <span className="text-[9px] text-cyan-700 tracking-widest">{p.technologiesUsed}</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-700 mt-2 leading-relaxed space-y-1.5 font-medium">
                                                        {p.description.split('\n').map((line, li) => (
                                                            line.trim() && (
                                                                <div key={li} className="flex gap-3">
                                                                    <span className="text-slate-300 flex-shrink-0">›</span>
                                                                    {line}
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </section>

                                    <section>
                                        <h2 className="text-[14px] font-black uppercase text-slate-900 border-b-2 border-slate-100 pb-2 mb-5 tracking-[0.25em]">Technical Arsenal</h2>
                                        <div className="space-y-3">
                                            {resumeData.skills.technical && (
                                                <div className="text-[10px]">
                                                    <span className="font-black text-slate-400 uppercase text-[9px] mr-2 tracking-widest">Stack:</span>
                                                    <span className="text-slate-800 font-bold">{resumeData.skills.technical}</span>
                                                </div>
                                            )}
                                            {resumeData.skills.tools && (
                                                <div className="text-[10px]">
                                                    <span className="font-black text-slate-400 uppercase text-[9px] mr-2 tracking-widest">Tools:</span>
                                                    <span className="text-slate-800 font-bold">{resumeData.skills.tools}</span>
                                                </div>
                                            )}
                                            {resumeData.skills.languages && (
                                                <div className="text-[10px]">
                                                    <span className="font-black text-slate-400 uppercase text-[9px] mr-2 tracking-widest">Lingua:</span>
                                                    <span className="text-slate-800 font-bold">{resumeData.skills.languages}</span>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center gap-3 px-6">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-60">Real-time Synchronization Active</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResumeBuilder;
