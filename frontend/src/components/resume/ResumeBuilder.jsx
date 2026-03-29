import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, BookOpen, Cpu, Briefcase, Award, CheckCircle, 
    ChevronRight, ChevronLeft, Save, Sparkles, Download, 
    Plus, Trash2, Rocket, Zap, Target
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../firebase/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
            const res = await axios.post('http://localhost:5001/api/resume/analyze', { resumeData });
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
            const res = await axios.post('http://localhost:5001/api/resume/improve-description', { description: original });
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
            const res = await axios.post('http://localhost:5001/api/resume/generate-pdf', { data: resumeData }, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error("PDF download failed", err);
        } finally {
            setLoading(false);
        }
    };

    // ─── RENDER COMPONENTS ───
    const ProgressHeader = () => (
        <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-cyan-500 p-3 rounded-2xl shadow-lg shadow-cyan-500/30">
                        <User className="w-6 h-6 text-slate-950" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white">Resume Architect</h2>
                        <p className="text-slate-400 font-medium">Step {step} of 8: {steps[step-1].title}</p>
                    </div>
                </div>
                <button 
                    onClick={saveToFirebase}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 transition-all font-bold text-sm ${isSaving ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/20' : 'bg-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/30'}`}
                >
                    {isSaving ? <Zap className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Syncing...' : 'Auto-save'}
                </button>
            </div>
            <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden flex gap-1">
                {steps.map((s, i) => (
                    <div key={s.id} className={`h-full flex-grow rounded-full transition-all duration-700 ${i + 1 <= step ? 'bg-gradient-to-r from-cyan-400 to-blue-600 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'bg-transparent'}`} />
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                
                {/* ─── LEFT: INPUT FORM ─── */}
                <div className="flex-1">
                    <ProgressHeader />
                    
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass-panel p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden"
                        >
                            {/* Step Content */}
                            {step === 1 && (
                                <section className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Full Name</label>
                                            <input 
                                                type="text" 
                                                value={resumeData.personalInfo.fullName}
                                                onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                                                placeholder="John Doe"
                                                className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Email</label>
                                            <input 
                                                type="email" 
                                                value={resumeData.personalInfo.email}
                                                readOnly
                                                className="w-full bg-slate-950/50 border border-white/5 p-4 rounded-xl text-slate-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">Phone</label>
                                            <input 
                                                type="text" 
                                                value={resumeData.personalInfo.phoneNumber}
                                                onChange={(e) => handleInputChange('personalInfo', 'phoneNumber', e.target.value)}
                                                placeholder="+91 XXXXX XXXXX"
                                                className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white outline-none" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500">LinkedIn</label>
                                            <input 
                                                type="text" 
                                                value={resumeData.personalInfo.linkedin}
                                                onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)}
                                                className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white outline-none" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-4">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Professional Location</label>
                                        <input 
                                            type="text" 
                                            value={resumeData.personalInfo.location}
                                            onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                                            placeholder="Mumbai, India"
                                            className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white outline-none" 
                                        />
                                    </div>
                                </section>
                            )}

                            {step === 2 && (
                                <section className="space-y-8">
                                    {resumeData.education.map((edu, idx) => (
                                        <div key={idx} className="p-6 bg-slate-900/40 rounded-3xl border border-white/5 relative group">
                                            <button 
                                                onClick={() => removeArrayItem('education', idx)}
                                                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black tracking-widest text-slate-500 uppercase">Degree</label>
                                                    <input 
                                                        type="text" 
                                                        value={edu.degree}
                                                        onChange={(e) => handleArrayChange('education', idx, 'degree', e.target.value)}
                                                        className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white outline-none" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black tracking-widest text-slate-500 uppercase">College Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={edu.collegeName}
                                                        onChange={(e) => handleArrayChange('education', idx, 'collegeName', e.target.value)}
                                                        className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white outline-none" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black tracking-widest text-slate-500 uppercase">Start Year</label>
                                                    <input 
                                                        type="text" 
                                                        value={edu.startYear}
                                                        onChange={(e) => handleArrayChange('education', idx, 'startYear', e.target.value)}
                                                        className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white outline-none" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black tracking-widest text-slate-500 uppercase">CGPA / %</label>
                                                    <input 
                                                        type="text" 
                                                        value={edu.cgpa}
                                                        onChange={(e) => handleArrayChange('education', idx, 'cgpa', e.target.value)}
                                                        className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white outline-none" 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => addArrayItem('education', { degree: '', branch: '', collegeName: '', university: '', startYear: '', endYear: '', cgpa: '' })}
                                        className="w-full py-4 border-2 border-dashed border-white/10 rounded-3xl text-slate-400 hover:text-white hover:border-cyan-500/30 transition-all flex items-center justify-center gap-2 font-bold"
                                    >
                                        <Plus className="w-5 h-5" /> Add Education
                                    </button>
                                </section>
                            )}

                            {step === 3 && (
                                <section className="space-y-6">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-black tracking-widest text-slate-500 uppercase">Technical Skills</label>
                                                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest bg-cyan-500/10 px-2 py-0.5 rounded">Machine Readable</span>
                                            </div>
                                            <textarea 
                                                value={resumeData.skills.technical}
                                                onChange={(e) => handleInputChange('skills', 'technical', e.target.value)}
                                                placeholder="React, Node.js, Python, AWS, Docker..."
                                                className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-2xl text-white min-h-[100px] outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black tracking-widest text-slate-500 uppercase">Tools & Technologies</label>
                                            <textarea 
                                                value={resumeData.skills.tools}
                                                onChange={(e) => handleInputChange('skills', 'tools', e.target.value)}
                                                placeholder="Git, VS Code, Postman, MongoDB Compass..."
                                                className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-2xl text-white min-h-[100px] outline-none"
                                            />
                                        </div>
                                    </div>
                                </section>
                            )}

                            {step === 4 && (
                                <section className="space-y-8">
                                    {resumeData.projects.map((proj, idx) => (
                                        <div key={idx} className="p-8 bg-slate-900/40 rounded-[2.5rem] border border-white/5 relative group">
                                            <button 
                                                onClick={() => removeArrayItem('projects', idx)}
                                                className="absolute top-6 right-6 p-2 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black tracking-widest text-slate-500 uppercase">Project Title</label>
                                                        <input 
                                                            type="text" 
                                                            value={proj.title}
                                                            onChange={(e) => handleArrayChange('projects', idx, 'title', e.target.value)}
                                                            className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white outline-none" 
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black tracking-widest text-slate-500 uppercase">Technologies</label>
                                                        <input 
                                                            type="text" 
                                                            value={proj.technologiesUsed}
                                                            onChange={(e) => handleArrayChange('projects', idx, 'technologiesUsed', e.target.value)}
                                                            className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white outline-none" 
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="text-xs font-black tracking-widest text-slate-500 uppercase">Description</label>
                                                        <button 
                                                            onClick={() => improveDescription(idx)}
                                                            disabled={aiLoading}
                                                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-full border border-cyan-500/20 transition-all active:scale-95 disabled:opacity-50"
                                                        >
                                                            <Sparkles className={`w-3 h-3 ${aiLoading ? 'animate-spin' : ''}`} />
                                                            {aiLoading ? 'Optimizing...' : 'AI Enhance'}
                                                        </button>
                                                    </div>
                                                    <textarea 
                                                        value={proj.description}
                                                        onChange={(e) => handleArrayChange('projects', idx, 'description', e.target.value)}
                                                        className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-2xl text-white min-h-[120px] outline-none" 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => addArrayItem('projects', { title: '', description: '', technologiesUsed: '', githubLink: '', role: '', duration: '' })}
                                        className="w-full py-6 border-2 border-dashed border-white/10 rounded-[2.5rem] text-slate-400 hover:text-white hover:border-cyan-500/30 transition-all flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest"
                                    >
                                        <Plus className="w-6 h-6" /> Add Major Project
                                    </button>
                                </section>
                            )}

                            {step === 5 && (
                                <section className="space-y-8">
                                    {resumeData.experience.map((exp, idx) => (
                                        <div key={idx} className="p-8 bg-slate-900/40 rounded-[2.5rem] border border-white/5 relative group">
                                            <button 
                                                onClick={() => removeArrayItem('experience', idx)}
                                                className="absolute top-6 right-6 p-2 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black tracking-widest text-slate-500 uppercase">Company Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={exp.companyName}
                                                        onChange={(e) => handleArrayChange('experience', idx, 'companyName', e.target.value)}
                                                        className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white outline-none" 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black tracking-widest text-slate-500 uppercase">Role</label>
                                                    <input 
                                                        type="text" 
                                                        value={exp.role}
                                                        onChange={(e) => handleArrayChange('experience', idx, 'role', e.target.value)}
                                                        className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white outline-none" 
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 mt-4">
                                                <label className="text-xs font-black tracking-widest text-slate-500 uppercase">Responsibilities</label>
                                                <textarea 
                                                    value={exp.responsibilities}
                                                    onChange={(e) => handleArrayChange('experience', idx, 'responsibilities', e.target.value)}
                                                    className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white outline-none min-h-[100px]" 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => addArrayItem('experience', { companyName: '', role: '', duration: '', responsibilities: '' })}
                                        className="w-full py-4 border-2 border-dashed border-white/10 rounded-3xl text-slate-400 hover:text-white flex items-center justify-center gap-2 font-bold"
                                    >
                                        <Plus className="w-5 h-5" /> Add Experience
                                    </button>
                                </section>
                            )}

                            {step === 6 && (
                                <section className="space-y-8">
                                    {resumeData.certifications.map((cert, idx) => (
                                        <div key={idx} className="p-6 bg-slate-900/40 rounded-3xl border border-white/5 relative group">
                                            <button 
                                                onClick={() => removeArrayItem('certifications', idx)}
                                                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input 
                                                    type="text" 
                                                    placeholder="Cert Name"
                                                    value={cert.name}
                                                    onChange={(e) => handleArrayChange('certifications', idx, 'name', e.target.value)}
                                                    className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white outline-none" 
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Organization"
                                                    value={cert.organization}
                                                    onChange={(e) => handleArrayChange('certifications', idx, 'organization', e.target.value)}
                                                    className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white outline-none" 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => addArrayItem('certifications', { name: '', organization: '', year: '' })}
                                        className="w-full py-4 border-2 border-dashed border-white/10 rounded-3xl text-slate-400 hover:text-white flex items-center justify-center gap-2 font-bold"
                                    >
                                        <Plus className="w-5 h-5" /> Add Certification
                                    </button>
                                </section>
                            )}

                            {step === 7 && (
                                <section className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black tracking-widest text-slate-500 uppercase">Honors & Awards</label>
                                        <textarea 
                                            value={resumeData.achievements.awards}
                                            onChange={(e) => handleInputChange('achievements', 'awards', e.target.value)}
                                            placeholder="National Hackathon Winner, Top 1% in GATE..."
                                            className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-2xl text-white min-h-[150px] outline-none" 
                                        />
                                    </div>
                                </section>
                            )}

                            {step === 8 && (
                                <section className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="glass-panel p-8 rounded-[2rem] border-cyan-500/20 bg-cyan-500/5 flex flex-col items-center justify-center text-center">
                                            <div className="relative mb-4">
                                                <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center text-3xl font-black text-cyan-400">
                                                    {aiLoading ? (
                                                        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                                                    ) : (
                                                        atsData ? `${atsData.atsScore}%` : '??'
                                                    )}
                                                </div>
                                                <div className="absolute inset-0 border-4 border-cyan-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
                                            </div>
                                            <h4 className="text-xl font-black text-white mb-2">ATS Efficiency</h4>
                                            <p className="text-slate-400 text-sm">Based on current industry standards for ${resumeData.personalInfo.fullName || 'Software Engineer'}.</p>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <button 
                                                onClick={downloadPDF}
                                                disabled={loading}
                                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 group transition-all"
                                            >
                                                <Download className={`w-10 h-10 text-slate-950 ${loading ? 'animate-bounce' : 'group-hover:scale-110 transition-transform'}`} />
                                                <div className="text-center">
                                                    <span className="block text-slate-950 font-black text-lg uppercase tracking-widest">Download PDF</span>
                                                    <span className="text-slate-950/70 text-xs font-bold uppercase">ATS-Optimized Format</span>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {atsData && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl">
                                                    <h5 className="text-green-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" /> Strong Aspects
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {atsData.strengths.map((s, i) => (
                                                            <li key={i} className="text-slate-300 text-sm flex gap-2">
                                                                <span className="text-green-500">•</span> {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-3xl">
                                                    <h5 className="text-yellow-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <Zap className="w-4 h-4" /> Optimization Tips
                                                    </h5>
                                                    <ul className="space-y-2">
                                                        {atsData.suggestions.slice(0, 3).map((s, i) => (
                                                            <li key={i} className="text-slate-300 text-sm flex gap-2">
                                                                <span className="text-yellow-500">•</span> {s}
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
                            <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/5">
                                <button 
                                    onClick={() => setStep(prev => Math.max(1, prev - 1))}
                                    disabled={step === 1}
                                    className={`flex items-center gap-2 font-bold transition-all ${step === 1 ? 'text-slate-700 opacity-0' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <ChevronLeft className="w-5 h-5" /> Previous Step
                                </button>
                                
                                {step === 8 ? (
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => setStep(1)}
                                            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                        >
                                            Edit Again
                                        </button>
                                    </div>
                                ) : step === 7 ? (
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={analyzeResume}
                                            disabled={aiLoading}
                                            className="px-10 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {aiLoading ? 'AI Architect Busy...' : 'Run AI Analysis & Download'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        {/* Mobile Quick Download */}
                                        <button 
                                            onClick={downloadPDF}
                                            disabled={loading || !resumeData.personalInfo.fullName}
                                            className="lg:hidden p-4 bg-white/5 text-slate-400 rounded-2xl transition-all"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                        
                                        <button 
                                            onClick={() => setStep(prev => prev + 1)}
                                            className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all active:scale-95"
                                        >
                                            Continue Phase
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* ─── RIGHT: LIVE PREVIEW ─── */}
                <div className="hidden lg:block w-[400px]">
                    <div className="sticky top-24">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-white uppercase tracking-widest">Real-Time Canvas</h3>
                            <button 
                                onClick={downloadPDF}
                                disabled={loading || !resumeData.personalInfo.fullName}
                                className="bg-white/10 hover:bg-cyan-500 text-white hover:text-slate-950 p-2 rounded-lg transition-all disabled:opacity-30"
                                title="Quick Download PDF"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-2xl h-[700px] overflow-y-auto p-10 origin-top hover:scale-[1.02] transition-transform duration-500 resume-preview-scroll">
                            {/* Visual Resume Rendering */}
                            <div className="text-slate-950 font-sans">
                                <div className="text-center border-b-2 border-slate-200 pb-4 mb-6">
                                    <h1 className="text-2xl font-bold uppercase tracking-tight">{resumeData.personalInfo.fullName || 'Your Name'}</h1>
                                    <div className="text-[10px] text-slate-500 font-medium mt-1">
                                        {resumeData.personalInfo.email} | {resumeData.personalInfo.phoneNumber} | {resumeData.personalInfo.location}
                                    </div>
                                    <div className="text-[9px] text-blue-600 font-bold mt-1">
                                        {resumeData.personalInfo.linkedin} | {resumeData.personalInfo.github}
                                    </div>
                                </div>

                                <section className="mb-6">
                                    <h2 className="text-[12px] font-black uppercase text-slate-400 border-b border-slate-100 mb-3 tracking-[0.2em]">Education</h2>
                                    {resumeData.education.map((e, i) => (
                                        e.degree && (
                                            <div key={i} className="mb-3">
                                                <div className="flex justify-between items-baseline font-bold text-xs">
                                                    <span>{e.degree} - {e.branch}</span>
                                                    <span className="text-[10px] text-slate-500">{e.startYear} - {e.endYear}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-600">{e.collegeName} | CGPA: {e.cgpa}</div>
                                            </div>
                                        )
                                    ))}
                                </section>

                                <section className="mb-6">
                                    <h2 className="text-[12px] font-black uppercase text-slate-400 border-b border-slate-100 mb-3 tracking-[0.2em]">Projects</h2>
                                    {resumeData.projects.map((p, i) => (
                                        p.title && (
                                            <div key={i} className="mb-4">
                                                <div className="flex justify-between items-baseline font-bold text-xs uppercase">
                                                    <span>{p.title}</span>
                                                    <span className="text-[9px] text-slate-400">{p.technologiesUsed}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-700 mt-1 leading-relaxed">
                                                    {p.description.split('\n').map((line, li) => (
                                                        <div key={li} className="flex gap-2">
                                                            <span className="text-slate-300">•</span>
                                                            {line}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </section>

                                <section className="mb-6">
                                    <h2 className="text-[12px] font-black uppercase text-slate-400 border-b border-slate-100 mb-3 tracking-[0.2em]">Technical Arsenal</h2>
                                    <div className="text-[10px] text-slate-700 grid grid-cols-2 gap-y-2 translate-all">
                                        <div><span className="font-bold text-slate-400 uppercase text-[9px]">Tech:</span> {resumeData.skills.technical}</div>
                                        <div><span className="font-bold text-slate-400 uppercase text-[9px]">Languages:</span> {resumeData.skills.languages}</div>
                                        <div><span className="font-bold text-slate-400 uppercase text-[9px]">Tools:</span> {resumeData.skills.tools}</div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResumeBuilder;
