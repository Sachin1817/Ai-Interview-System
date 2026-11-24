import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Award, Briefcase, Plus, Send, Play, Users, BarChart3,
    BookOpen, Sparkles, CheckCircle, AlertCircle, X, ChevronRight, Code, User,
    LayoutDashboard, ClipboardList, Shield, Settings, Menu, LogOut, FileText,
    ChevronLeft, ArrowLeft, RefreshCw, Check, AlertTriangle, Bell, MoreVertical,
    ChevronDown, ChevronUp, Download, Eye, TrendingUp, Terminal
} from 'lucide-react';
import api from '../../services/api';
import aiInterviewAPI from '../../services/aiInterviewApi';
import AIInterviewReviewModal from './AIInterviewReviewModal';
import CandidateAnswersModal from './CandidateAnswersModal';
import HRAnalyticsDashboard from './HRAnalyticsDashboard';
import BulkActionBar from './BulkActionBar';
import { useTheme } from '../../contexts/ThemeContext';

const renderFeedbackDetails = (feedback) => {
    if (!feedback) return "Evaluation complete. Satisfactory responses.";
    if (typeof feedback === 'string') {
        return feedback;
    }
    
    const f = feedback;
    return (
        <div className="space-y-4">
            {f.skill_level && (
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Skill Level:</span>
                    <span className="inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-purple-500/10 border border-purple-500/20 text-purple-400">
                        {f.skill_level}
                    </span>
                </div>
            )}
            
            {/* Scores Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#060B16] p-3 rounded-xl border border-white/5">
                <div>
                    <div className="text-[9px] text-slate-500 uppercase font-black">Syntax</div>
                    <div className="text-sm font-bold text-white mt-0.5">{f.syntax_score ?? f.syntax ?? 0}/10</div>
                </div>
                <div>
                    <div className="text-[9px] text-slate-500 uppercase font-black">Logic</div>
                    <div className="text-sm font-bold text-white mt-0.5">{f.logic_score ?? f.logic ?? 0}/10</div>
                </div>
                <div>
                    <div className="text-[9px] text-slate-500 uppercase font-black">Performance</div>
                    <div className="text-sm font-bold text-white mt-0.5">{f.performance_score ?? f.performance ?? 0}/10</div>
                </div>
                <div>
                    <div className="text-[9px] text-slate-500 uppercase font-black">Quality</div>
                    <div className="text-sm font-bold text-white mt-0.5">{f.quality_score ?? f.quality ?? 0}/10</div>
                </div>
            </div>

            {/* Strengths & Weaknesses */}
            {f.strengths && (
                <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Strengths</div>
                    <p className="text-slate-300 leading-relaxed font-medium">{Array.isArray(f.strengths) ? f.strengths.join(', ') : String(f.strengths)}</p>
                </div>
            )}

            {f.weak_areas && (
                <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Areas for Improvement</div>
                    <p className="text-slate-300 leading-relaxed font-medium">{Array.isArray(f.weak_areas) ? f.weak_areas.join(', ') : String(f.weak_areas)}</p>
                </div>
            )}

            {f.suggestions && (
                <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400 mb-1">AI Suggestions</div>
                    <p className="text-slate-400 leading-relaxed font-medium">{Array.isArray(f.suggestions) ? f.suggestions.join(', ') : String(f.suggestions)}</p>
                </div>
            )}
            
            {f.general_feedback && (
                <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">General Feedback</div>
                    <p className="text-slate-300 leading-relaxed font-medium">{f.general_feedback}</p>
                </div>
            )}
        </div>
    );
};

const HRDashboard = () => {
    const navigate = useNavigate();
    const { theme } = useTheme() || { theme: 'dark' };

    const getSidebarBtnClass = (tabName) => {
        const isCurrent = activeTab === tabName;
        return `w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative ${
            isCurrent
                ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
        }`;
    };

    // Core Layout States
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'candidates', 'jobs', 'submissions', 'settings'
    const [selectedCandidate, setSelectedCandidate] = useState(null); // Detailed profile drawer
    const [selectedInterviewAnswers, setSelectedInterviewAnswers] = useState(null); // Modal for viewing candidate answers
    const [expandedAnswersId, setExpandedAnswersId] = useState(null); // Inline Q&A toggle in Submissions tab
    const [candidateInterviewHistory, setCandidateInterviewHistory] = useState([]); // All interview sessions for selectedCandidate
    const [loadingCandidateHistory, setLoadingCandidateHistory] = useState(false);

    // API State Variables
    const [searchQuery, setSearchQuery] = useState('');
    const [branchFilter, setBranchFilter] = useState('All');
    const [resumeFilter, setResumeFilter] = useState('All');
    const [candidates, setCandidates] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState('');
    const [rankedCandidates, setRankedCandidates] = useState([]);
    const [applicationsList, setApplicationsList] = useState([]);
    const [applicationFilter, setApplicationFilter] = useState('All');

    // Multi-select & Bulk Action states
    const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
    const [selectedAppIds, setSelectedAppIds] = useState([]);
    const [bulkUpdating, setBulkUpdating] = useState(false);

    // Bulk Email Modal state
    const [emailModal, setEmailModal] = useState({
        open: false,
        candidateIds: [],
        recipientCount: 0,
        subject: '',
        body: '',
        template: 'custom'
    });
    const [sendingEmail, setSendingEmail] = useState(false);

    // Form states for posting a job
    const [newJob, setNewJob] = useState({
        title: '',
        company: '',
        location: '',
        description: '',
        skills: '',
        jobType: 'Full-time',
        cgpaCutoff: '',
        vacancies: ''
    });

    // Submissions list
    const [submissions, setSubmissions] = useState({ interviews: [], coding_submissions: [] });

    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [jobModalOpen, setJobModalOpen] = useState(false);

    // Modals & Action Dialogs
    const [assignModal, setAssignModal] = useState({ open: false, type: 'standard', candidate: null });
    const [manualQuestions, setManualQuestions] = useState(['', '', '']);
    const [codingChallenge, setCodingChallenge] = useState({
        title: '',
        description: '',
        language: 'python',
        boilerplate: '',
        input_output: ''
    });

    const [assignRole, setAssignRole] = useState('Software Engineer');

    // AI Voice Interview Sessions State
    const [aiSessions, setAiSessions] = useState([]);
    const [reviewSession, setReviewSession] = useState(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: 'success' });
    const [adminInfo, setAdminInfo] = useState({ name: 'HR Admin', email: 'sachindevaraju49@gmail.com' });

    useEffect(() => {
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (localUser?.role !== 'hr') {
            navigate('/');
            return;
        }
        if (localUser?.name) {
            setAdminInfo({
                name: localUser.name,
                email: localUser.email || 'sachindevaraju49@gmail.com'
            });
        }
        fetchCandidates();
        fetchJobs();
        fetchSubmissions();
        fetchApplicationsList();
        fetchAiSessions();
    }, [navigate]);

    const fetchAiSessions = async () => {
        try {
            const res = await aiInterviewAPI.getAdminSessions();
            setAiSessions(res.data || []);
        } catch (err) {
            console.error("Failed to fetch AI interview sessions:", err);
        }
    };

    const fetchCandidates = async (query = '') => {
        try {
            const res = await api.get(`/admin/candidates?query=${query}`);
            setCandidates(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchJobs = async () => {
        try {
            const res = await api.get('/admin/jobs');
            setJobs(res.data);
            if (res.data.length > 0 && !selectedJob) {
                setSelectedJob(res.data[0]._id);
                fetchRankings(res.data[0]._id);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchRankings = async (jobId) => {
        if (!jobId) return;
        setLoading(true);
        try {
            const res = await api.get(`/admin/rank/${jobId}`);
            setRankedCandidates(res.data.rankings);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async () => {
        try {
            const res = await api.get('/admin/submissions');
            setSubmissions(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchApplicationsList = async () => {
        try {
            const res = await api.get('/admin/applications');
            setApplicationsList(res.data);
        } catch (e) {
            console.error("Failed to fetch applications:", e);
        }
    };

    const fetchCandidateInterviewAnswers = async (candidateId) => {
        if (!candidateId) return;
        setLoadingCandidateHistory(true);
        try {
            const res = await api.get(`/admin/candidates/${candidateId}/interview-answers`);
            setCandidateInterviewHistory(res.data || []);
        } catch (err) {
            console.error("Failed to fetch candidate interview answers:", err);
            setCandidateInterviewHistory([]);
        } finally {
            setLoadingCandidateHistory(false);
        }
    };

    const handleSelectCandidate = (cand) => {
        setSelectedCandidate(cand);
        if (cand && (cand.id || cand._id)) {
            fetchCandidateInterviewAnswers(cand.id || cand._id);
        } else {
            setCandidateInterviewHistory([]);
        }
    };

    const handleUpdateApplicationStatus = async (appId, newStatus) => {
        try {
            await api.put(`/admin/applications/${appId}/status`, { status: newStatus });
            fetchApplicationsList();
            setMessage({ text: `Application status updated to ${newStatus}!`, type: 'success' });
            setTimeout(() => setMessage({ text: '', type: 'success' }), 3000);
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Failed to update application status.', type: 'error' });
        }
    };

    const handlePreviewResume = async (candId) => {
        try {
            const res = await api.get(`/admin/resume/${candId}/download`, { responseType: 'blob' });
            const file = new Blob([res.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL);
        } catch (e) {
            console.error(e);
            if (e.response && e.response.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorData = JSON.parse(reader.result);
                        alert(errorData.message || "Failed to download or preview candidate's resume PDF.");
                    } catch (parseError) {
                        alert("Failed to download or preview candidate's resume PDF.");
                    }
                };
                reader.readAsText(e.response.data);
            } else {
                alert(e.response?.data?.message || "Failed to download or preview candidate's resume PDF.");
            }
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCandidates(searchQuery);
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: 'success' });
        try {
            const skillArray = newJob.skills.split(',').map(s => s.trim()).filter(Boolean);
            await api.post('/admin/jobs', {
                ...newJob,
                skills: skillArray,
                cgpaCutoff: parseFloat(newJob.cgpaCutoff) || 0.0,
                vacancies: parseInt(newJob.vacancies) || 1
            });
            setMessage({ text: 'Job posting successfully created!', type: 'success' });
            setNewJob({
                title: '',
                company: '',
                location: '',
                description: '',
                skills: '',
                jobType: 'Full-time',
                cgpaCutoff: '',
                vacancies: ''
            });
            fetchJobs();
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to create job posting', type: 'error' });
        }
    };

    const handleCloseJob = async (jobId) => {
        try {
            await api.post(`/admin/jobs/${jobId}/close`);
            fetchJobs();
        } catch (e) {
            console.error("Failed to close job:", e);
        }
    };

    const handleAssignInterview = async () => {
        setMessage({ text: '', type: 'success' });
        const { candidate, type } = assignModal;

        if (candidate?.isBulk) {
            handleBulkAssignSubmit();
            return;
        }

        try {
            const payload = {
                candidate_id: candidate.id,
                interview_type: type,
                role: assignRole,
                difficulty: 'Intermediate'
            };

            if (type === 'standard') {
                const filteredQuestions = manualQuestions.filter(q => q.trim() !== '');
                if (filteredQuestions.length === 0) {
                    setMessage({ text: 'Please enter at least one question.', type: 'error' });
                    return;
                }
                payload.manual_questions = filteredQuestions;
            } else {
                if (!codingChallenge.title || !codingChallenge.description) {
                    setMessage({ text: 'Challenge title and description are required.', type: 'error' });
                    return;
                }
                payload.coding_challenge = codingChallenge;
            }

            await api.post('/admin/assign-interview', payload);
            setMessage({ text: 'Interview successfully assigned to candidate!', type: 'success' });
            setTimeout(() => {
                setAssignModal({ open: false, type: 'standard', candidate: null });
                setManualQuestions(['', '', '']);
                setCodingChallenge({ title: '', description: '', language: 'python', boilerplate: '', input_output: '' });
                setMessage({ text: '', type: 'success' });
                if (selectedCandidate) {
                    // Update current drawer selected view
                    setSelectedCandidate(prev => ({
                        ...prev,
                        is_manual_mode: true
                    }));
                }
            }, 1500);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to assign interview.', type: 'error' });
        }
    };

    const addQuestionField = () => {
        setManualQuestions([...manualQuestions, '']);
    };

    const removeQuestionField = (index) => {
        const updated = manualQuestions.filter((_, idx) => idx !== index);
        setManualQuestions(updated);
    };

    // ─── Export & Bulk Action Handlers ───
    const handleExportCandidatesCSV = async () => {
        try {
            const res = await api.get('/admin/export/candidates', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `candidates_export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            console.error("Export candidates failed:", e);
            alert("Failed to export candidates CSV.");
        }
    };

    const handleExportApplicationsCSV = async () => {
        try {
            const res = await api.get('/admin/export/applications', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `applications_pipeline_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            console.error("Export applications failed:", e);
            alert("Failed to export applications CSV.");
        }
    };

    const handleBulkStatusUpdate = async (status) => {
        if (selectedAppIds.length === 0) return;
        setBulkUpdating(true);
        try {
            const res = await api.post('/admin/applications/bulk-status', {
                application_ids: selectedAppIds,
                status: status
            });
            setMessage({ text: res.data.message || `Updated ${selectedAppIds.length} applications!`, type: 'success' });
            setSelectedAppIds([]);
            fetchApplications();
        } catch (e) {
            console.error("Bulk status update failed:", e);
            setMessage({ text: 'Failed to perform bulk status update.', type: 'error' });
        } finally {
            setBulkUpdating(false);
        }
    };

    const handleBulkAssignModalOpen = () => {
        if (selectedCandidateIds.length === 0) return;
        setAssignModal({
            open: true,
            type: 'standard',
            candidate: { name: `${selectedCandidateIds.length} Selected Candidates`, isBulk: true, ids: selectedCandidateIds }
        });
    };

    // ─── Bulk Email Handlers ───
    const EMAIL_TEMPLATES = [
        {
            id: 'interview_invite',
            name: '📅 Interview Invitation',
            subject: 'Invitation to Technical & Behavioral Interview Round',
            body: `Dear {name},\n\nWe are impressed with your profile and application. We would like to invite you for the next interview round.\n\nPlease log in to your Placement AI dashboard to review the schedule and complete your preparatory assessments.\n\nBest regards,\nCampus Recruitment Team`
        },
        {
            id: 'shortlist_congrats',
            name: '🎉 Shortlisting Notice',
            subject: 'Congratulations! Your Application has been Shortlisted',
            body: `Dear {name},\n\nCongratulations! Your application has successfully passed our initial screening and ATS evaluation.\n\nOur hiring panel is currently finalizing the interview lineup. Keep an eye on your inbox and candidate portal for the date and details.\n\nBest regards,\nHR Recruitment Team`
        },
        {
            id: 'doc_reminder',
            name: '📑 Document & Resume Verification',
            subject: 'Action Required: Submit Your Resume & Profile Details',
            body: `Dear {name},\n\nThis is a quick reminder from the Placement Cell to ensure your latest ATS-compliant resume and profile information are up-to-date on the platform.\n\nPlease visit your dashboard to submit any pending details before the upcoming recruitment drive deadline.\n\nBest regards,\nPlacement Cell Administration`
        },
        {
            id: 'drive_update',
            name: '📢 Placement Drive Announcement',
            subject: 'Important Update Regarding Upcoming Campus Placement Drive',
            body: `Dear {name},\n\nWe have scheduled upcoming campus recruitment drives with leading technology partners. Please ensure you practice mock interviews and coding labs on Placement AI to maximize your readiness.\n\nGood luck with your preparation!\n\nBest regards,\nHR & Placement Cell`
        }
    ];

    const handleOpenCandidateBulkEmail = () => {
        if (selectedCandidateIds.length === 0) return;
        setEmailModal({
            open: true,
            candidateIds: selectedCandidateIds,
            recipientCount: selectedCandidateIds.length,
            subject: EMAIL_TEMPLATES[0].subject,
            body: EMAIL_TEMPLATES[0].body,
            template: EMAIL_TEMPLATES[0].id
        });
    };

    const handleOpenApplicationBulkEmail = () => {
        if (selectedAppIds.length === 0) return;
        const targetCandidateIds = applicationsList
            .filter(app => selectedAppIds.includes(app._id))
            .map(app => app.user_id)
            .filter(Boolean);

        const uniqueCandidateIds = [...new Set(targetCandidateIds)];
        setEmailModal({
            open: true,
            candidateIds: uniqueCandidateIds,
            recipientCount: uniqueCandidateIds.length,
            subject: EMAIL_TEMPLATES[1].subject,
            body: EMAIL_TEMPLATES[1].body,
            template: EMAIL_TEMPLATES[1].id
        });
    };

    const handleSendBulkEmailSubmit = async (e) => {
        e?.preventDefault();
        if (!emailModal.subject.trim() || !emailModal.body.trim()) {
            alert('Please enter both an email subject and body.');
            return;
        }

        setSendingEmail(true);
        try {
            const res = await api.post('/admin/bulk-email', {
                candidate_ids: emailModal.candidateIds,
                subject: emailModal.subject,
                body: emailModal.body
            });
            setMessage({ text: res.data.message || `Successfully sent email to ${emailModal.recipientCount} candidates!`, type: 'success' });
            setEmailModal({ open: false, candidateIds: [], recipientCount: 0, subject: '', body: '', template: 'custom' });
        } catch (err) {
            console.error("Bulk email error:", err);
            setMessage({ text: err.response?.data?.message || 'Failed to dispatch bulk email.', type: 'error' });
        } finally {
            setSendingEmail(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Derived statistics
    const analyzedCount = candidates.filter(c => c.has_resume).length;
    const totalInterviews = submissions.interviews.length + submissions.coding_submissions.length;
    const placementsCount = applicationsList.filter(a => a.status === 'selected').length;
    const topCandidates = candidates.length > 0 ? [...candidates].filter(c => c.has_resume).sort((a, b) => (b.ats_score || 0) - (a.ats_score || 0)).slice(0, 3) : [];

    const totalApps = applicationsList.length;
    const shortlistedAppsCount = applicationsList.filter(a => a.status === 'shortlisted').length;
    const interviewAppsCount = applicationsList.filter(a => a.status === 'interview').length;
    const selectedAppsCount = applicationsList.filter(a => a.status === 'selected').length;
    const maxAppsVal = totalApps || 1;
    const shortlistedPct = (shortlistedAppsCount / maxAppsVal) * 100;
    const interviewPct = (interviewAppsCount / maxAppsVal) * 100;
    const selectedPct = (selectedAppsCount / maxAppsVal) * 100;
    const placementsPct = (placementsCount / maxAppsVal) * 100;

    const sortedJobsByActive = [...jobs].sort((a, b) => (a.status === 'closed' ? 1 : 0) - (b.status === 'closed' ? 1 : 0));

    // Filters logic
    const filteredCandidates = candidates.filter(c => {
        if (branchFilter !== 'All' && c.branch !== branchFilter) return false;
        if (resumeFilter !== 'All') {
            const hasRes = c.has_resume;
            if (resumeFilter === 'Analyzed' && !hasRes) return false;
            if (resumeFilter === 'Pending' && hasRes) return false;
        }
        return true;
    });

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-[#060B16] text-slate-900 dark:text-[#F8FAFC] font-sans antialiased overflow-x-hidden">

            {/* 1. SIDEBAR REDESIGN WITH SMOOTH SCROLLING ANIMATIONS */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarCollapsed ? 80 : 288 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col bg-white dark:bg-[#0A1120] border-r border-slate-200 dark:border-[#1E293B] z-50 sticky top-0 h-screen"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-[#1E293B]">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <motion.div
                            whileHover={{ rotate: 90 }}
                            transition={{ duration: 0.3 }}
                            className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-slate-950 font-black text-sm shrink-0 shadow-lg shadow-cyan-500/20 cursor-pointer"
                        >
                            ◈
                        </motion.div>
                        {!sidebarCollapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="font-black text-lg tracking-wider text-slate-900 dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-slate-400 dark:bg-clip-text dark:text-transparent uppercase whitespace-nowrap"
                            >
                                Placement AI
                            </motion.span>
                        )}
                    </div>
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 transition-all hidden lg:block"
                        title="Collapse Sidebar"
                    >
                        {sidebarCollapsed ? <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" /> : <ChevronLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
                    </button>
                </div>
                {/* Navigation Menu with Smooth Custom Scrollbar */}
                <div className="flex-grow py-6 px-4 space-y-6 overflow-y-auto custom-scrollbar scroll-smooth">
                    {/* Main Section */}
                    <div>
                        {!sidebarCollapsed && (
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B] px-3 mb-2">MAIN</p>
                        )}
                        <nav className="space-y-1">
                            {[
                                { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, action: () => { setActiveTab('dashboard'); setSelectedCandidate(null); } },
                                { key: 'candidates', label: 'Candidates', icon: Users, action: () => { setActiveTab('candidates'); } },
                                { key: 'jobs', label: 'Job Posts', icon: Briefcase, action: () => { setActiveTab('jobs'); setSelectedCandidate(null); } },
                                { key: 'applications', label: 'Applications', icon: FileText, action: () => { setActiveTab('applications'); setSelectedCandidate(null); } },
                                { key: 'interviews', label: 'Interviews', icon: ClipboardList, action: () => { setActiveTab('interviews'); setSelectedCandidate(null); } },
                                { key: 'placements', label: 'Placements', icon: Award, action: () => { setActiveTab('placements'); setSelectedCandidate(null); } },
                            ].map(item => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.key;
                                return (
                                    <motion.button
                                        key={item.key}
                                        onClick={item.action}
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`relative w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-bold transition-all text-left ${
                                            isActive
                                                ? 'text-cyan-500 dark:text-cyan-400 font-black'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabPill"
                                                className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/30 rounded-xl"
                                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                            />
                                        )}
                                        <Icon className={`w-5 h-5 shrink-0 relative z-10 ${isActive ? 'text-cyan-400' : ''}`} />
                                        {!sidebarCollapsed && <span className="text-xs relative z-10">{item.label}</span>}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabDot"
                                                className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-cyan-400 rounded-r z-10"
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* AI & Analytics Section */}
                    <div>
                        {!sidebarCollapsed && (
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B] px-3 mb-2">AI & ANALYTICS</p>
                        )}
                        <nav className="space-y-1">
                            {[
                                { key: 'ai-interviews', label: 'AI Voice Interviews', icon: Sparkles, color: 'text-cyan-400', action: () => { setActiveTab('ai-interviews'); setSelectedCandidate(null); fetchAiSessions(); } },
                                { key: 'hr-analytics', label: 'Analytics', icon: BarChart3, action: () => { setActiveTab('hr-analytics'); setSelectedCandidate(null); } },
                                { key: 'submissions', label: 'Reports', icon: BookOpen, action: () => { setActiveTab('submissions'); setSelectedCandidate(null); } },
                            ].map(item => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.key;
                                return (
                                    <motion.button
                                        key={item.key}
                                        onClick={item.action}
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`relative w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-bold transition-all text-left ${
                                            isActive
                                                ? 'text-cyan-500 dark:text-cyan-400 font-black'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabPill"
                                                className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/30 rounded-xl"
                                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                            />
                                        )}
                                        <Icon className={`w-5 h-5 shrink-0 relative z-10 ${item.color || (isActive ? 'text-cyan-400' : '')}`} />
                                        {!sidebarCollapsed && <span className="text-xs relative z-10">{item.label}</span>}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabDot"
                                                className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-cyan-400 rounded-r z-10"
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* System Section */}
                    <div>
                        {!sidebarCollapsed && (
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B] px-3 mb-2">SYSTEM</p>
                        )}
                        <nav className="space-y-1">
                            <motion.button
                                onClick={() => { setActiveTab('settings'); setSelectedCandidate(null); }}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className={`relative w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-bold transition-all text-left ${
                                    activeTab === 'settings'
                                        ? 'text-cyan-500 dark:text-cyan-400 font-black'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                }`}
                            >
                                {activeTab === 'settings' && (
                                    <motion.div
                                        layoutId="activeTabPill"
                                        className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/30 rounded-xl"
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}
                                <Settings className="w-5 h-5 shrink-0 relative z-10" />
                                {!sidebarCollapsed && <span className="text-xs relative z-10">Settings</span>}
                                {activeTab === 'settings' && (
                                    <motion.div
                                        layoutId="activeTabDot"
                                        className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-cyan-400 rounded-r z-10"
                                    />
                                )}
                            </motion.button>
                        </nav>
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-slate-900/40">
                    <div className="flex items-center justify-between gap-3 overflow-hidden">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-slate-950 font-black text-sm shrink-0 shadow-md">
                                {adminInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            {!sidebarCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex-grow min-w-0"
                                >
                                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{adminInfo.name}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">HR Administrator</p>
                                </motion.div>
                            )}
                        </div>
                        {!sidebarCollapsed && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleLogout}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 shrink-0"
                                title="Log Out"
                            >
                                <LogOut className="w-4 h-4" />
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.aside>


            {/* Main Application Area */}
            <div className="flex-grow flex flex-col min-w-0">

                {/* 2. TOP NAVBAR */}
                <header className="sticky top-0 bg-white/80 dark:bg-[#060B16]/80 backdrop-blur-xl border-b border-slate-200 dark:border-[#1E293B] py-4 px-8 flex items-center justify-between z-40">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">
                                {activeTab === 'dashboard' ? 'Overview' :
                                    activeTab === 'candidates' ? 'Candidate Directory' :
                                        activeTab === 'jobs' ? 'Job Posting specs' :
                                            activeTab === 'applications' ? 'Application Management' :
                                                activeTab === 'interviews' ? 'Interviews & Schedules' :
                                                    activeTab === 'submissions' ? 'Submission Logs' : 'Admin Settings'}
                            </h2>
                            <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mt-0.5">GOOD MORNING, ADMIN</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Global Search Bar */}
                        <form onSubmit={handleSearch} className="relative hidden md:block">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-[#1E293B] rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-cyan-500/40 text-slate-900 dark:text-white min-w-[280px] placeholder:text-slate-500 dark:placeholder:text-slate-600 transition-all"
                                placeholder="Search candidates, skills, keywords..."
                            />
                        </form>

                        <div className="w-px h-6 bg-slate-200 dark:bg-[#1E293B] hidden md:block" />

                        {/* Notifications Bell Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-[#1E293B] hover:border-cyan-500/30 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all relative"
                            >
                                <Bell className="w-4 h-4" />
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 ring-2 ring-slate-950" />
                            </button>
                            {notificationsOpen && (
                                <div className="absolute right-0 mt-3 w-80 bg-[#0C1422] border border-[#1E293B] rounded-2xl shadow-2xl z-50 p-4 space-y-4">
                                    <div className="flex justify-between items-center border-b border-[#1E293B] pb-2">
                                        <span className="text-xs font-black uppercase text-white tracking-wider">Notifications</span>
                                        <button onClick={() => setNotificationsOpen(false)} className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider hover:text-cyan-300">
                                            Mark all as read
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex gap-2.5 text-xs text-slate-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-200">New candidate registered</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">Sachin D. uploaded a resume</p>
                                                <p className="text-[9px] text-slate-600 mt-1">2 min ago</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2.5 text-xs text-slate-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-200">Interview completed</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">Rahul K. completed coding track</p>
                                                <p className="text-[9px] text-slate-600 mt-1">18 min ago</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2.5 text-xs text-slate-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-200">New application received</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">12 new applicant profiles parsed</p>
                                                <p className="text-[9px] text-slate-600 mt-1">1 hour ago</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* 3. MAIN WORKSPACE CONTAINER */}
                <main className="flex-grow p-8 lg:p-10 overflow-y-auto w-full max-w-[96%] mx-auto space-y-8">
                    {/* TAB: DASHBOARD HOMEPAGE */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8">

                            {/* Greeting header */}
                            <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-8 rounded-[2rem] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                                    <Sparkles className="w-64 h-64" />
                                </div>
                                <div className="space-y-2 relative z-10">
                                    <h1 className="text-3xl font-black text-white tracking-tight">
                                        {(() => {
                                            const hr = new Date().getHours();
                                            if (hr < 12) return 'Good morning';
                                            if (hr < 17) return 'Good afternoon';
                                            return 'Good evening';
                                        })()}, {adminInfo.name.split(' ')[0]} 👋
                                    </h1>
                                    <p className="text-slate-400 text-sm font-medium">Here's what's happening across your recruitment pipeline today.</p>
                                </div>
                                <button
                                    onClick={() => { fetchCandidates(); fetchJobs(); fetchSubmissions(); }}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-white/5 border border-white/10 hover:border-cyan-500/30 text-white transition-all select-none hover:bg-cyan-500/5"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
                                </button>
                            </div>

                            {/* KPI Metrics Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-5 hover:border-cyan-500/30 transition-all duration-300">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-[#94A3B8] mb-1">Candidates</p>
                                    <p className="text-3xl font-black text-white">{candidates.length}</p>
                                    <p className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1">↑ 12.4% <span className="text-slate-500 font-normal">vs last month</span></p>
                                </div>
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-5 hover:border-cyan-500/30 transition-all duration-300">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-[#94A3B8] mb-1">Applications</p>
                                    <p className="text-3xl font-black text-white">{totalApps}</p>
                                    <p className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1">↑ 18.7% <span className="text-slate-500 font-normal">vs last month</span></p>
                                </div>
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-5 hover:border-cyan-500/30 transition-all duration-300">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-[#94A3B8] mb-1">Interviews</p>
                                    <p className="text-3xl font-black text-white">{totalInterviews}</p>
                                    <p className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1">↑ 8.2% <span className="text-slate-500 font-normal">vs last month</span></p>
                                </div>
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-5 hover:border-cyan-500/30 transition-all duration-300">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-[#94A3B8] mb-1">Active Jobs</p>
                                    <p className="text-3xl font-black text-white">{jobs.filter(j => j.status !== 'closed').length}</p>
                                    <p className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1">↑ 4.5% <span className="text-slate-500 font-normal">vs last month</span></p>
                                </div>
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-5 hover:border-cyan-500/30 transition-all duration-300">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-[#94A3B8] mb-1">Placements</p>
                                    <p className="text-3xl font-black text-white">{placementsCount}</p>
                                    <p className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1">↑ 15.1% <span className="text-slate-500 font-normal">vs last month</span></p>
                                </div>
                            </div>

                            {/* AI Recruitment Intelligence block */}
                            <div className="bg-[#0F1728] border border-[#1E293B] rounded-[2rem] p-6 space-y-6">
                                <div className="flex justify-between items-center border-b border-[#1E293B] pb-4">
                                    <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2 text-white">
                                        <Sparkles className="w-5 h-5 text-cyan-400" /> AI Recruitment Intelligence
                                    </h3>
                                    <button onClick={() => setActiveTab('candidates')} className="text-xs text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider">
                                        View All →
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left Column: Top Candidate Matches */}
                                    <div className="bg-[#060B16]/50 border border-[#1E293B] rounded-2xl p-6 space-y-4">
                                        <div>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-[#94A3B8] bg-white/5 px-2 py-0.5 rounded border border-white/5">Top Candidate Matches</span>
                                            <h4 className="text-sm font-black text-white mt-2">Best AI Recommendations</h4>
                                        </div>
                                        <div className="space-y-3">
                                            {topCandidates.map((cand, idx) => (
                                                <div key={cand.id} className="bg-[#0F1728]/60 border border-white/5 hover:border-cyan-500/20 rounded-xl p-4 flex items-center justify-between gap-4 transition-all">
                                                    <div className="space-y-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-[10px] font-black text-cyan-400`}>
                                                                #{idx + 1}
                                                            </span>
                                                            <h5 className="text-xs font-bold text-white truncate">{cand.name}</h5>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 truncate">{cand.branch || 'Engineering'} • {cand.skills?.slice(0, 2).join(', ') || 'No skills'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <div className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] font-bold text-cyan-400">
                                                            {cand.ats_score || 0}% ATS
                                                        </div>
                                                        <button
                                                            onClick={() => { setSelectedCandidate(cand); setActiveTab('candidates'); }}
                                                            className="p-1 rounded-lg bg-white/5 hover:bg-cyan-500 hover:text-slate-950 text-slate-400 transition-all"
                                                        >
                                                            <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {topCandidates.length === 0 && (
                                                <p className="text-slate-500 text-xs italic">No candidates with parsed resumes found.</p>
                                            )}
                                        </div>
                                    </div>
                                    {/* Right Column: Hiring Risks & Pool Analysis */}
                                    <div className="bg-[#060B16]/50 border border-[#1E293B] rounded-2xl p-6 space-y-4">
                                        <div>
                                            <span className="text-[8px] font-black uppercase tracking-widest text-[#94A3B8] bg-white/5 px-2 py-0.5 rounded border border-white/5">AI Pool Insights</span>
                                            <h4 className="text-sm font-black text-white mt-2">Talent Pool Assessment</h4>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-2.5 text-xs text-slate-400">
                                                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="font-bold text-slate-200">{candidates.filter(c => !c.has_resume).length} candidates pending resume review</p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">Missing parsed resume data in live database</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2.5 text-xs text-slate-400">
                                                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="font-bold text-slate-200">{candidates.filter(c => c.has_resume && c.ats_score >= 80).length} high-performing candidates</p>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">Exhibiting ATS match index scores ≥ 80%</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setActiveTab('submissions')} className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-cyan-400 hover:text-cyan-300 pt-2 transition-all">
                                            View Submissions Analysis →
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Section using modern vector blocks */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Chart 1: Applications Trends */}
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-[2rem] p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                                            <BarChart3 className="w-4 h-4 text-cyan-400" /> Applications Trend
                                        </h3>
                                        <span className="text-[9px] font-black uppercase bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-400">Jan - Jul</span>
                                    </div>
                                    <div className="relative pt-4 flex flex-col justify-end min-h-[160px] border-b border-white/5 pb-2">
                                        <svg className="w-full h-32" viewBox="0 0 400 100" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
                                                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                                                </linearGradient>
                                            </defs>
                                            <path d="M 0 80 Q 80 40 160 70 T 320 20 T 400 30 L 400 100 L 0 100 Z" fill="url(#chartGradient)" />
                                            <path d="M 0 80 Q 80 40 160 70 T 320 20 T 400 30" fill="none" stroke="#06B6D4" strokeWidth="2.5" />
                                            <circle cx="160" cy="70" r="4" fill="#06B6D4" />
                                            <circle cx="320" cy="20" r="4" fill="#06B6D4" />
                                        </svg>
                                        <div className="flex justify-between text-[10px] text-slate-500 mt-2 px-1">
                                            <span>Jan</span>
                                            <span>Feb</span>
                                            <span>Mar</span>
                                            <span>Apr</span>
                                            <span>May</span>
                                            <span>Jun</span>
                                            <span>Jul</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Chart 2: Hiring Funnel */}
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-[2rem] p-8 space-y-6">
                                    <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-purple-400" /> Hiring Funnel
                                    </h3>
                                    <div className="space-y-3.5">
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-medium text-slate-400">
                                                <span>Applications</span>
                                                <span className="text-white font-bold">{totalApps}</span>
                                            </div>
                                            <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-500 rounded-full w-full" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-medium text-slate-400">
                                                <span>Shortlisted</span>
                                                <span className="text-cyan-400 font-bold">{shortlistedAppsCount}</span>
                                            </div>
                                            <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${shortlistedPct}%` }} />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-medium text-slate-400">
                                                <span>Interviews</span>
                                                <span className="text-purple-400 font-bold">{interviewAppsCount}</span>
                                            </div>
                                            <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${interviewPct}%` }} />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-medium text-slate-400">
                                                <span>Selected</span>
                                                <span className="text-emerald-400 font-bold">{selectedAppsCount}</span>
                                            </div>
                                            <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedPct}%` }} />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-medium text-slate-400">
                                                <span>Placed</span>
                                                <span className="text-indigo-400 font-bold">{placementsCount}</span>
                                            </div>
                                            <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${placementsPct}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Candidates & Active Jobs side-by-side */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Recent Registrations Table */}
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-[2rem] overflow-hidden">
                                    <div className="p-6 border-b border-[#1E293B] flex justify-between items-center bg-white/[0.01]">
                                        <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                                            <Users className="w-4 h-4 text-cyan-400" /> Recent Candidates
                                        </h3>
                                        <button onClick={() => setActiveTab('candidates')} className="text-xs text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider">
                                            View All →
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-[#1E293B] text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                                    <th className="px-6 py-4">Candidate</th>
                                                    <th className="px-6 py-4">ATS Score</th>
                                                    <th className="px-6 py-4 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#1E293B]">
                                                {candidates.slice(0, 4).map(c => (
                                                    <tr key={c.id || c._id} className="hover:bg-white/[0.01] transition-colors">
                                                        <td className="px-6 py-4 flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs text-cyan-400 border border-white/5">
                                                                {c.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-white">{c.name}</div>
                                                                <div className="text-[10px] text-slate-500 mt-0.5">{c.email}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-xs font-black text-cyan-400">
                                                                {c.has_resume ? `${c.ats_score}/100` : 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => setSelectedCandidate(c)}
                                                                className="px-3 py-1 rounded bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 text-[10px] font-black text-slate-300 hover:text-white uppercase transition-all"
                                                            >
                                                                Inspect
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Active Job Openings Table */}
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-[2rem] overflow-hidden">
                                    <div className="p-6 border-b border-[#1E293B] flex justify-between items-center bg-white/[0.01]">
                                        <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                                            <Briefcase className="w-4 h-4 text-purple-400" /> Active Job Openings
                                        </h3>
                                        <button onClick={() => setActiveTab('jobs')} className="text-xs text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider">
                                            Manage Jobs →
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-[#1E293B] text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                                    <th className="px-6 py-4">Job Title</th>
                                                    <th className="px-6 py-4">Vacancies</th>
                                                    <th className="px-6 py-4 text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#1E293B]">
                                                {sortedJobsByActive.slice(0, 4).map(job => (
                                                    <tr key={job._id} className="hover:bg-white/[0.01] transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="text-xs font-bold text-white">{job.title}</div>
                                                            <div className="text-[10px] text-slate-500 mt-0.5">{job.company}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-bold text-slate-400">
                                                            {job.vacancies || 1}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                                                                job.status === 'closed' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                            }`}>
                                                                {job.status || 'active'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: CANDIDATE DIRECTORY */}
                    {activeTab === 'candidates' && (
                        <div className="space-y-8">

                            {/* Toolbar (Search and Filters) */}
                            {!selectedCandidate && (
                                <>
                                    <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-8 rounded-[2rem] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                                        <div>
                                            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Candidates</h1>
                                            <p className="text-slate-400 text-sm mt-1">{filteredCandidates.length} total candidates in directory</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={handleExportCandidatesCSV}
                                                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 text-xs font-black uppercase tracking-wider text-slate-300 hover:text-white flex items-center gap-2 transition-all"
                                            >
                                                <Download className="w-4 h-4 text-cyan-400" /> Export CSV
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-[#0F1728] border border-[#1E293B] p-6 rounded-[2rem] space-y-4">
                                        <form onSubmit={handleSearch} className="flex gap-4">
                                            <div className="relative flex-grow flex items-center">
                                                <Search className="w-4 h-4 text-slate-500 absolute left-4" />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full bg-[#060B16] border border-[#1E293B] focus:border-cyan-500/40 rounded-xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:ring-4 focus:ring-cyan-500/5 text-white placeholder:text-slate-600 transition-all"
                                                    placeholder="Search candidates by name, email, or resume skill keywords..."
                                                />
                                            </div>
                                            <button type="submit" className="px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all select-none">
                                                Search
                                            </button>
                                        </form>

                                        <div className="flex flex-wrap items-center gap-6 pt-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Branch:</span>
                                                <select
                                                    value={branchFilter}
                                                    onChange={(e) => setBranchFilter(e.target.value)}
                                                    className="bg-[#060B16] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/30"
                                                >
                                                    <option value="All">All Branches</option>
                                                    <option value="CSE">CSE</option>
                                                    <option value="ECE">ECE</option>
                                                    <option value="ISE">ISE</option>
                                                    <option value="ME">ME</option>
                                                </select>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Resume:</span>
                                                <select
                                                    value={resumeFilter}
                                                    onChange={(e) => setResumeFilter(e.target.value)}
                                                    className="bg-[#060B16] border border-[#1E293B] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500/30"
                                                >
                                                    <option value="All">All Statuses</option>
                                                    <option value="Analyzed">Analyzed</option>
                                                    <option value="Pending">Pending</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Main directory split view */}
                            {!selectedCandidate ? (
                                <div className="grid grid-cols-1 gap-8 items-start">
                                    <BulkActionBar 
                                        selectedCount={selectedCandidateIds.length} 
                                        totalCount={filteredCandidates.length}
                                        onExport={() => handleBulkExport(selectedCandidateIds)}
                                    />
                                    {/* Left/Main directory table */}
                                    <div className="bg-[#0F1728] border border-[#1E293B] rounded-[2rem] overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-[#1E293B] text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                                        <th className="px-6 py-4 w-12">
                                                            <input
                                                                type="checkbox"
                                                                checked={filteredCandidates.length > 0 && selectedCandidateIds.length === filteredCandidates.length}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedCandidateIds(filteredCandidates.map(c => c.id || c._id));
                                                                    } else {
                                                                        setSelectedCandidateIds([]);
                                                                    }
                                                                }}
                                                                className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                                                            />
                                                        </th>
                                                        <th className="px-6 py-4">Identity</th>
                                                        <th className="px-6 py-4">Branch</th>
                                                        <th className="px-6 py-4">Resume</th>
                                                        <th className="px-6 py-4">ATS Score</th>
                                                        <th className="px-6 py-4">Skills keywords</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#1E293B]">
                                                    {filteredCandidates.length > 0 ? (
                                                        filteredCandidates.map(cand => {
                                                            const candId = cand.id || cand._id;
                                                            const isChecked = selectedCandidateIds.includes(candId);
                                                            return (
                                                            <tr
                                                                key={cand.id}
                                                                className={`hover:bg-white/[0.02] transition-all cursor-pointer ${selectedCandidate?.id === cand.id ? 'bg-cyan-500/[0.02] border-l-2 border-l-cyan-500' : ''}`}
                                                            >
                                                                <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setSelectedCandidateIds(prev => [...prev, candId]);
                                                                            } else {
                                                                                setSelectedCandidateIds(prev => prev.filter(id => id !== candId));
                                                                            }
                                                                        }}
                                                                        className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                                                                    />
                                                                </td>
                                                                <td className="px-6 py-4 flex items-center gap-3" onClick={() => handleSelectCandidate(cand)}>
                                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs text-cyan-400 border border-white/5">
                                                                        {cand.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-xs text-white">{cand.name}</div>
                                                                        <div className="text-[10px] text-slate-500 mt-0.5">{cand.email}</div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-xs font-bold text-slate-400" onClick={() => handleSelectCandidate(cand)}>{cand.branch}</td>
                                                                <td className="px-6 py-4" onClick={() => handleSelectCandidate(cand)}>
                                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${cand.has_resume ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                                                        {cand.has_resume ? 'Analyzed' : 'No Resume'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-xs font-black text-cyan-400" onClick={() => handleSelectCandidate(cand)}>
                                                                    {cand.has_resume ? `${cand.ats_score}/100` : 'N/A'}
                                                                </td>
                                                                <td className="px-6 py-4" onClick={() => handleSelectCandidate(cand)}>
                                                                    <div className="flex flex-wrap gap-1 max-w-[320px]">
                                                                        {cand.skills?.slice(0, 4).map(skill => (
                                                                            <span key={skill} className="text-[7.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400">
                                                                                {skill}
                                                                            </span>
                                                                        )) || <span className="text-slate-700 text-xs">-</span>}
                                                                        {cand.skills?.length > 4 && (
                                                                            <span className="text-[8px] font-black text-cyan-400 px-1">+{cand.skills.length - 4}</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-right" onClick={() => handleSelectCandidate(cand)}>
                                                                    <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
                                                                </td>
                                                            </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="7" className="text-center py-12 text-slate-500 text-xs font-semibold">No candidates found matching the active filters.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Back Header */}
                                    <button
                                        onClick={() => setSelectedCandidate(null)}
                                        className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white transition-all select-none"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Back to Candidates
                                    </button>

                                    {/* Profile Layout */}
                                    <div className="bg-[#0F1728] border border-[#1E293B] rounded-[2rem] p-8 space-y-8">
                                        {/* Profile Header */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#1E293B] pb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-slate-950 font-black text-xl">
                                                    {selectedCandidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-black text-white">{selectedCandidate.name}</h2>
                                                    <p className="text-xs text-slate-400 mt-1">{selectedCandidate.email} | Branch: {selectedCandidate.branch}</p>
                                                    {selectedCandidate.has_resume && (
                                                        <button
                                                            onClick={() => handlePreviewResume(selectedCandidate.id)}
                                                            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all select-none cursor-pointer"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" /> Preview Resume
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">AI MATCH INDEX</div>
                                                <div className="text-3xl font-black text-cyan-400 mt-1">{selectedCandidate.ats_score || 0}%</div>
                                                <span className="text-[9px] text-[#10B981] font-bold mt-1">● Excellent Match</span>
                                            </div>
                                        </div>

                                        {/* Two columns */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* LEFT COLUMN: Profile info & skills */}
                                            <div className="space-y-8">
                                                <div className="bg-[#060B16]/50 border border-[#1E293B] rounded-2xl p-6 space-y-4">
                                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Candidate Profile Details</h3>
                                                    <div className="space-y-3 text-xs text-slate-300">
                                                        <div className="flex justify-between"><span className="text-slate-500">Education</span><span className="font-bold text-white">B.E. {selectedCandidate.branch || 'Computer Science'}</span></div>
                                                        <div className="flex justify-between"><span className="text-slate-500">Graduation Year</span><span className="font-bold text-white">2026</span></div>
                                                        <div className="flex justify-between"><span className="text-slate-500">Academic CGPA</span><span className="font-bold text-cyan-400">{selectedCandidate.cgpa ? parseFloat(selectedCandidate.cgpa).toFixed(2) : 'N/A'}</span></div>
                                                        <div className="flex justify-between"><span className="text-slate-500">Skills Status</span><span className="font-bold text-emerald-400">{selectedCandidate.has_resume ? 'Resume Parsed' : 'No Resume'}</span></div>
                                                    </div>
                                                </div>

                                                <div className="bg-[#060B16]/50 border border-[#1E293B] rounded-2xl p-6 space-y-4">
                                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Technical Key Skills</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedCandidate.skills?.map(skill => (
                                                            <span key={skill} className="text-[9px] font-bold uppercase px-2.5 py-1 rounded bg-white/5 border border-white/5 text-slate-200">
                                                                {skill}
                                                            </span>
                                                        )) || <span className="text-slate-600 text-xs">No skills keywords extracted</span>}
                                                    </div>
                                                </div>

                                                <div className="bg-[#060B16]/50 border border-[#1E293B] rounded-2xl p-6 space-y-4">
                                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Assigned Evaluations</h3>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                            disabled={!selectedCandidate.has_resume}
                                                            onClick={() => setAssignModal({ open: true, type: 'standard', candidate: selectedCandidate })}
                                                            className="py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-[#060B16] border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed text-center"
                                                        >
                                                            Assign Q&A Challenge
                                                        </button>
                                                        <button
                                                            disabled={!selectedCandidate.has_resume}
                                                            onClick={() => setAssignModal({ open: true, type: 'coding', candidate: selectedCandidate })}
                                                            className="py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-[#060B16] border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed text-center"
                                                        >
                                                            Assign Coding Lab
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* RIGHT COLUMN: AI Evaluation & Recommendations */}
                                            <div className="space-y-8">
                                                <div className="bg-[#060B16]/50 border border-[#1E293B] rounded-2xl p-6 space-y-4">
                                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">AI Evaluation Matrix</h3>
                                                    <div className="space-y-4">
                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between text-xs font-medium text-slate-400">
                                                                <span>Skills Fit</span>
                                                                <span className="text-cyan-400 font-bold">96%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                                                <div className="h-full bg-cyan-500 rounded-full w-[96%]" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between text-xs font-medium text-slate-400">
                                                                <span>Experience Matching</span>
                                                                <span className="text-cyan-400 font-bold">91%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                                                <div className="h-full bg-cyan-500 rounded-full w-[91%]" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between text-xs font-medium text-slate-400">
                                                                <span>Projects & Complexity</span>
                                                                <span className="text-cyan-400 font-bold">95%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                                                <div className="h-full bg-cyan-500 rounded-full w-[95%]" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between text-xs font-medium text-slate-400">
                                                                <span>Education Relevance</span>
                                                                <span className="text-cyan-400 font-bold">90%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                                                <div className="h-full bg-cyan-500 rounded-full w-[90%]" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-[#060B16]/50 border border-[#1E293B] rounded-2xl p-6 space-y-4">
                                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">AI Recommendation Insights</h3>
                                                    <div className="space-y-3.5 text-xs text-slate-400 leading-relaxed">
                                                        <div className="flex gap-2 text-slate-200">
                                                            <span className="text-[#10B981] font-bold">✓</span>
                                                            <p>Strong candidate for Full Stack Developer roles. Exhibits deep competency in React, Python, and MongoDB.</p>
                                                        </div>
                                                        <div className="flex gap-2 text-slate-200">
                                                            <span className="text-amber-500 font-bold">⚠</span>
                                                            <p>Missing Containerization skills (Docker, Kubernetes) and CI/CD pipelines.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CANDIDATE COMPLETED INTERVIEWS & VERBATIM ANSWERS HISTORY */}
                                        <div className="bg-[#060B16]/60 border border-[#1E293B] rounded-2xl p-6 md:p-8 space-y-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                                                <div>
                                                    <h3 className="text-sm font-black uppercase text-cyan-400 tracking-wider flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-cyan-400" /> Candidate Interview Answers & Recorded Transcripts
                                                    </h3>
                                                    <p className="text-xs text-slate-400 mt-1">Review the verbatim technical & behavioral answers submitted by {selectedCandidate.name}.</p>
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit">
                                                    {candidateInterviewHistory.length} Sessions Available
                                                </span>
                                            </div>

                                            {loadingCandidateHistory ? (
                                                <div className="py-8 text-center text-slate-500 text-xs font-bold flex items-center justify-center gap-2">
                                                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> Loading candidate interview answers...
                                                </div>
                                            ) : candidateInterviewHistory.length > 0 ? (
                                                <div className="space-y-4">
                                                    {candidateInterviewHistory.map((sess, sIdx) => {
                                                        const isExpanded = expandedAnswersId === sess.session_id;
                                                        const score = sess.result?.overall_score ?? sess.result?.score ?? 0;
                                                        return (
                                                            <div key={sess.session_id || sIdx} className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 space-y-4 transition-all hover:border-cyan-500/30">
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                                                                    <div>
                                                                        <div className="text-xs font-black text-white flex items-center gap-2">
                                                                            <span>{sess.role}</span>
                                                                            <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                                                {sess.round_type}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-[10px] text-slate-500 mt-0.5">
                                                                            {sess.started_at ? new Date(sess.started_at).toLocaleDateString() : 'Recent'} • {sess.answers_count} Answers Logged
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-4">
                                                                        <div className="text-right">
                                                                            <div className="text-[9px] uppercase font-black tracking-widest text-slate-500">Score</div>
                                                                            <div className="text-base font-black text-cyan-400">{score}/100</div>
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={() => setSelectedInterviewAnswers({
                                                                                    ...sess,
                                                                                    candidate_name: selectedCandidate.name,
                                                                                    candidate_email: selectedCandidate.email
                                                                                })}
                                                                                className="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/10"
                                                                            >
                                                                                <Eye className="w-3.5 h-3.5" /> Full Answers Modal
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setExpandedAnswersId(isExpanded ? null : sess.session_id)}
                                                                                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                                                                                title={isExpanded ? 'Collapse' : 'Expand inline'}
                                                                            >
                                                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Expandable Q&A answers */}
                                                                {isExpanded && (
                                                                    <div className="space-y-4 pt-2">
                                                                        {sess.answers?.length > 0 ? (
                                                                            sess.answers.map((ans, aIdx) => (
                                                                                <div key={ans._id || aIdx} className="bg-[#050A14] border border-white/5 p-4 rounded-xl space-y-2">
                                                                                    <div className="flex items-center justify-between text-[10px]">
                                                                                        <span className="font-bold text-cyan-400">Q{aIdx + 1} • {ans.topic || 'General'}</span>
                                                                                        {ans.evaluation?.score !== undefined && (
                                                                                            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold">
                                                                                                Score: {ans.evaluation.score}/10
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    <p className="text-xs font-semibold text-white">{ans.question}</p>
                                                                                    <div className="bg-white/[0.02] border border-cyan-500/20 p-3 rounded-lg text-xs text-slate-200 leading-relaxed font-sans">
                                                                                        <div className="text-[9px] font-black uppercase text-cyan-400 mb-1">Candidate Answer:</div>
                                                                                        {ans.answer || <span className="text-rose-400 italic">[No answer recorded]</span>}
                                                                                    </div>
                                                                                    {ans.evaluation?.feedback && (
                                                                                        <p className="text-[11px] text-slate-400 italic">
                                                                                            AI Feedback: {typeof ans.evaluation.feedback === 'string' ? ans.evaluation.feedback : JSON.stringify(ans.evaluation.feedback)}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            ))
                                                                        ) : (
                                                                            <p className="text-xs text-slate-500 italic">No individual answers recorded for this session.</p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="py-6 text-center text-slate-500 text-xs">
                                                    No completed interview sessions recorded for this candidate yet.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: JOB POSTS SPECIFICATIONS */}
                    {activeTab === 'jobs' && (
                        <div className="space-y-8">

                            {/* Header Toolbar */}
                            <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-8 rounded-[2rem] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                                <div>
                                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Job Post Specs</h1>
                                    <p className="text-slate-400 text-sm mt-1">{jobs.length} active spec requirements</p>
                                </div>
                                <button
                                    onClick={() => setJobModalOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all select-none"
                                >
                                    <Plus className="w-3.5 h-3.5 text-slate-950" /> Post Job Spec
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                {/* Left Column: Active Jobs list */}
                                <div className="space-y-8 lg:col-span-1">
                                    <div className="bg-[#0F1728] border border-[#1E293B] p-6 rounded-[2rem] space-y-6">
                                        <div className="border-b border-[#1E293B] pb-4">
                                            <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2 text-white">
                                                <Briefcase className="w-5 h-5 text-cyan-400" /> Active Openings ({jobs.length})
                                            </h3>
                                        </div>
                                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                                            {sortedJobsByActive.length > 0 ? (
                                                sortedJobsByActive.map(job => (
                                                    <div
                                                        key={job._id}
                                                        onClick={() => {
                                                            setSelectedJob(job._id);
                                                            fetchRankings(job._id);
                                                        }}
                                                        className={`p-5 rounded-2xl bg-[#060B16]/50 border cursor-pointer transition-all flex flex-col gap-3 ${
                                                            selectedJob === job._id ? 'border-cyan-500 bg-cyan-500/[0.02]' : 'border-[#1E293B] hover:border-white/10'
                                                        }`}
                                                    >
                                                        <div>
                                                            <div className="flex justify-between items-start gap-2">
                                                                <span className="text-xs font-black uppercase tracking-tight text-white leading-snug">{job.title}</span>
                                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border shrink-0 ${
                                                                    job.status === 'closed'
                                                                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                                                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                                }`}>
                                                                    {job.status || 'active'}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{job.company}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-wider bg-white/5 p-2 rounded-xl border border-white/5">
                                                            <div>Required CGPA: <span className="text-cyan-400 font-black">{job.cgpaCutoff ? job.cgpaCutoff.toFixed(2) : '0.00'}</span></div>
                                                            <div>Vacancies: <span className="text-purple-400 font-black">{job.vacancies || 1}</span></div>
                                                        </div>
                                                        {job.status !== 'closed' && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCloseJob(job._id);
                                                                }}
                                                                className="w-full py-2 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-transparent text-red-400 hover:text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all text-center"
                                                            >
                                                                Close Opening
                                                            </button>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-6 text-slate-600 text-xs font-semibold">No job openings created yet.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Candidate rankings matching */}
                                <div className="lg:col-span-2 bg-[#0F1728] border border-[#1E293B] p-6 rounded-[2rem] space-y-6">
                                    <div className="border-b border-[#1E293B] pb-6">
                                        <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2 text-white">
                                            <Award className="w-5 h-5 text-cyan-400" /> Candidate Matching Rankings
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        {loading ? (
                                            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                                <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ranking Database...</span>
                                            </div>
                                        ) : !selectedJob ? (
                                            <div className="text-center py-12 text-slate-500 text-xs font-semibold">Select a Job Posting spec from the left list to display matching candidate rankings.</div>
                                        ) : rankedCandidates.length > 0 ? (
                                            rankedCandidates.map((cand, index) => (
                                                <div key={cand.candidate_id} className="relative bg-[#060B16]/40 border border-[#1E293B] rounded-2xl p-6 hover:border-white/10 transition-all duration-300">
                                                    {/* Rank Badge */}
                                                    <div className="absolute top-6 left-6 flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 text-slate-950 font-black text-xs">
                                                        #{index + 1}
                                                    </div>

                                                    <div className="pl-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                        <div>
                                                            <div className="font-bold text-sm text-white flex items-center gap-2">
                                                                {cand.name}
                                                                <span className="text-[8px] font-bold uppercase tracking-wider bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-400">{cand.branch}</span>
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 mt-0.5">{cand.email}</div>

                                                            {/* Skills breakdown */}
                                                            <div className="mt-4 space-y-2">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">Matched ({cand.matched_skills.length})</span>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {cand.matched_skills.map(s => (
                                                                            <span key={s} className="text-[8px] font-bold uppercase px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5">{s}</span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                {cand.missing_skills.length > 0 && (
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <span className="text-[8px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/10">Missing ({cand.missing_skills.length})</span>
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {cand.missing_skills.map(s => (
                                                                                <span key={s} className="text-[8px] font-bold uppercase px-2 py-0.5 rounded bg-white/5 text-slate-500 border border-white/5">{s}</span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
                                                            <div className="text-right">
                                                                <div className="text-[9px] uppercase font-black tracking-widest text-slate-500">Match score</div>
                                                                <div className="text-2xl font-black text-cyan-400 leading-none mt-1">{cand.match_percentage}%</div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-[9px] uppercase font-black tracking-widest text-slate-500">ATS Score</div>
                                                                <div className="text-xs font-black text-white mt-0.5">{cand.ats_score}/100</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 text-slate-500 text-xs font-semibold">No candidates have applied to this job posting yet. Candidates can apply from the Jobs portal.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: APPLICATIONS */}
                    {activeTab === 'applications' && (
                        <div className="space-y-8">
                            <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-8 rounded-[2rem] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                                <div>
                                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Application tracking</h1>
                                    <p className="text-slate-400 text-sm mt-1">Review applicant scores, perform batch status updates, and export pipeline logs.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleExportApplicationsCSV}
                                        className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 text-xs font-black uppercase tracking-wider text-slate-300 hover:text-white flex items-center gap-2 transition-all"
                                    >
                                        <Download className="w-4 h-4 text-cyan-400" /> Export Pipeline CSV
                                    </button>
                                </div>
                            </div>

                            {/* KPI Metrics Row */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-4 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">Total Applications</p>
                                    <p className="text-2xl font-black text-white mt-1">{applicationsList.length}</p>
                                </div>
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-4 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400">Shortlisted</p>
                                    <p className="text-2xl font-black text-emerald-400 mt-1">{applicationsList.filter(a => a.status === 'shortlisted').length}</p>
                                </div>
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-4 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-wider text-purple-400">Interviews</p>
                                    <p className="text-2xl font-black text-purple-400 mt-1">{applicationsList.filter(a => a.status === 'interview').length}</p>
                                </div>
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-4 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-wider text-cyan-400">Selected</p>
                                    <p className="text-2xl font-black text-cyan-400 mt-1">{applicationsList.filter(a => a.status === 'selected').length}</p>
                                </div>
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-4 text-center">
                                    <p className="text-[9px] font-black uppercase tracking-wider text-red-400">Rejected</p>
                                    <p className="text-2xl font-black text-red-400 mt-1">{applicationsList.filter(a => a.status === 'rejected').length}</p>
                                </div>
                            </div>

                            {/* Filters row */}
                            <div className="flex gap-2 border-b border-[#1E293B] pb-4">
                                {['All', 'applied', 'shortlisted', 'interview', 'selected', 'rejected'].map(stage => (
                                    <button
                                        key={stage}
                                        onClick={() => setApplicationFilter(stage)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                                            applicationFilter === stage
                                                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                                                : 'border-transparent text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {stage}
                                    </button>
                                ))}
                            </div>

                            {/* Table */}
                            <div className="bg-[#0F1728] border border-[#1E293B] rounded-[2rem] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#1E293B] text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                                <th className="px-6 py-4 w-12">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            applicationsList.filter(a => applicationFilter === 'All' || a.status === applicationFilter).length > 0 &&
                                                            selectedAppIds.length === applicationsList.filter(a => applicationFilter === 'All' || a.status === applicationFilter).length
                                                        }
                                                        onChange={(e) => {
                                                            const filteredApps = applicationsList.filter(a => applicationFilter === 'All' || a.status === applicationFilter);
                                                            if (e.target.checked) {
                                                                setSelectedAppIds(filteredApps.map(a => a._id));
                                                            } else {
                                                                setSelectedAppIds([]);
                                                            }
                                                        }}
                                                        className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                                                    />
                                                </th>
                                                <th className="px-6 py-4">Candidate</th>
                                                <th className="px-6 py-4">Job Opening</th>
                                                <th className="px-6 py-4">Applied Date</th>
                                                <th className="px-6 py-4">ATS Score</th>
                                                <th className="px-6 py-4">Stage Status</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#1E293B]">
                                            {applicationsList
                                                .filter(a => applicationFilter === 'All' || a.status === applicationFilter)
                                                .map(app => {
                                                    const isChecked = selectedAppIds.includes(app._id);
                                                    return (
                                                    <tr key={app._id} className="hover:bg-white/[0.01] transition-colors">
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedAppIds(prev => [...prev, app._id]);
                                                                    } else {
                                                                        setSelectedAppIds(prev => prev.filter(id => id !== app._id));
                                                                    }
                                                                }}
                                                                className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-xs font-bold text-white">{app.candidate_name}</div>
                                                            <div className="text-[10px] text-slate-500 mt-0.5">{app.candidate_email}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-xs font-bold text-slate-300">{app.job_title}</div>
                                                            <div className="text-[10px] text-slate-500 mt-0.5">{app.company}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-slate-400">
                                                            {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-xs font-black text-cyan-400">{app.ats_score || 0}/100</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                                                                app.status === 'selected' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                                app.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                                app.status === 'interview' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                                                                app.status === 'shortlisted' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' :
                                                                'bg-slate-500/10 border-slate-500/20 text-slate-400'
                                                            }`}>
                                                                {app.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <select
                                                                value={app.status}
                                                                onChange={(e) => handleUpdateApplicationStatus(app._id, e.target.value)}
                                                                className="bg-[#060B16] border border-[#1E293B] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                                                            >
                                                                <option value="applied">Applied</option>
                                                                <option value="shortlisted">Shortlisted</option>
                                                                <option value="interview">Interview</option>
                                                                <option value="selected">Selected</option>
                                                                <option value="rejected">Rejected</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                    );
                                                })}
                                            {applicationsList.length === 0 && (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-12 text-slate-500 text-xs font-semibold">No candidate applications found in the database.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: INTERVIEWS */}
                    {activeTab === 'interviews' && (
                        <div className="space-y-8">
                            <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-8 rounded-[2rem] border border-[#1E293B] relative overflow-hidden">
                                <h1 className="text-3xl font-black text-white tracking-tight uppercase">Scheduled Interviews</h1>
                                <p className="text-slate-400 text-sm mt-1">Review upcoming coding tracks and standard AI mock interview sessions.</p>
                            </div>

                            {/* Active & Completed grid */}
                            <div className="bg-[#0F1728] border border-[#1E293B] rounded-[2rem] overflow-hidden">
                                <div className="p-6 border-b border-[#1E293B] bg-white/[0.01]">
                                    <h3 className="font-bold text-sm text-white uppercase tracking-wider">All Active Interview Schedules</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#1E293B] text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                                <th className="px-6 py-4">Candidate</th>
                                                <th className="px-6 py-4">Role Track</th>
                                                <th className="px-6 py-4">Interview Type</th>
                                                <th className="px-6 py-4">Interview Status</th>
                                                <th className="px-6 py-4">Assignment Date</th>
                                                <th className="px-6 py-4 text-right">Candidate Answers</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#1E293B]">
                                            {candidates
                                                .filter(c => c.is_manual_mode)
                                                .map(cand => (
                                                    <tr key={cand.id || cand._id} className="hover:bg-white/[0.01] transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="text-xs font-bold text-white">{cand.name}</div>
                                                            <div className="text-[10px] text-slate-500 mt-0.5">{cand.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-bold text-slate-300">
                                                            Software Engineering
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border bg-purple-500/10 border-purple-500/20 text-purple-400">
                                                                Assigned Override
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border bg-amber-500/10 border-amber-500/20 text-amber-400">
                                                                Pending submission
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-slate-500">
                                                            Assigned recently
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-[10px] text-slate-500 italic">
                                                            Awaiting Answers
                                                        </td>
                                                    </tr>
                                                ))}
                                            {submissions.interviews.map(session => (
                                                <tr key={session._id} className="hover:bg-white/[0.01] transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs font-bold text-white">{session.candidate_name}</div>
                                                        <div className="text-[10px] text-slate-500 mt-0.5">{session.candidate_email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold text-slate-300">
                                                        {session.role}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
                                                            {session.interview_type || 'standard Q&A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                                                            Completed
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-500">
                                                        {session.created_at ? new Date(session.created_at).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => setSelectedInterviewAnswers(session)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all select-none cursor-pointer"
                                                        >
                                                            <FileText className="w-3.5 h-3.5" /> View Answers ({session.answers?.length || 0})
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {candidates.filter(c => c.is_manual_mode).length === 0 && submissions.interviews.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-12 text-slate-500 text-xs font-semibold">No interviews or coding tasks scheduled yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'submissions' && (
                        <div className="space-y-8">

                            {/* Title banner */}
                            <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-8 rounded-[2rem] border border-[#1E293B] relative overflow-hidden">
                                <h1 className="text-3xl font-black text-white tracking-tight uppercase">Submission Logs</h1>
                                <p className="text-slate-400 text-sm mt-1">Review finalized evaluation scores, code artifacts, and detailed AI feedback logs.</p>
                            </div>

                            {/* KPI Metrics Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-5 hover:border-cyan-500/20 transition-all">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Total Submissions</p>
                                    <p className="text-3xl font-black text-white">{submissions.interviews.length + submissions.coding_submissions.length}</p>
                                </div>
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-5 hover:border-cyan-500/20 transition-all">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-cyan-400 mb-1">Completed Q&A Tasks</p>
                                    <p className="text-3xl font-black text-cyan-400">{submissions.interviews.length}</p>
                                </div>
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-5 hover:border-purple-500/20 transition-all">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-purple-400 mb-1">Completed Coding Labs</p>
                                    <p className="text-3xl font-black text-purple-400">{submissions.coding_submissions.length}</p>
                                </div>
                            </div>

                            {/* Standard Q&A Interviews list */}
                            <div className="bg-[#0F1728] border border-[#1E293B] p-6 rounded-[2rem] space-y-6">
                                <div className="border-b border-[#1E293B] pb-4">
                                    <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2 text-white">
                                        <BookOpen className="w-5 h-5 text-cyan-400" /> Completed Q&A Interviews ({submissions.interviews.length})
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {submissions.interviews.length > 0 ? (
                                        submissions.interviews.map(session => (
                                            <div key={session._id} className="bg-[#060B16]/40 border border-[#1E293B] rounded-2xl p-6 transition-all hover:border-cyan-500/20">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                                                    <div>
                                                        <div className="font-bold text-sm text-white flex items-center gap-2">
                                                            {session.candidate_name}
                                                            <span className="text-[9px] font-black uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-400">{session.role}</span>
                                                            <span className="text-[9px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">
                                                                {session.answers?.length || session.answers_count || 0} Q&A Answers
                                                            </span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 mt-0.5">{session.candidate_email}</div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <div className="text-[9px] uppercase font-black tracking-widest text-slate-500">Evaluation Score</div>
                                                            <div className="text-xl font-black text-cyan-400 mt-0.5">{session.result?.overall_score || session.result?.score || 0}/100</div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setSelectedInterviewAnswers(session)}
                                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all select-none cursor-pointer shadow-lg shadow-cyan-500/10"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" /> View Candidate Answers ({session.answers?.length || 0})
                                                            </button>
                                                            <button
                                                                onClick={() => setExpandedAnswersId(expandedAnswersId === session._id ? null : session._id)}
                                                                className="flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all select-none cursor-pointer"
                                                            >
                                                                <span>{expandedAnswersId === session._id ? 'Collapse' : 'Inspect'}</span>
                                                                {expandedAnswersId === session._id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 text-xs">
                                                    <div className="font-bold text-white uppercase text-[9px] tracking-wider mb-2 flex items-center gap-1 text-cyan-400">
                                                        <Sparkles className="w-3.5 h-3.5" /> AI Feedback Analysis
                                                    </div>
                                                    <div className="bg-white/[0.01] p-4 rounded-xl border border-white/5 leading-relaxed text-slate-400 font-medium">
                                                        {renderFeedbackDetails(session.result?.feedback || session.result?.overall_feedback)}
                                                    </div>
                                                </div>

                                                {/* INLINE CANDIDATE Q&A ANSWERS ACCORDION */}
                                                {expandedAnswersId === session._id && (
                                                    <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                                                                <BookOpen className="w-4 h-4" /> Candidate Submitted Answers ({session.answers?.length || 0})
                                                            </h4>
                                                            <button
                                                                onClick={() => setSelectedInterviewAnswers(session)}
                                                                className="text-[10px] text-cyan-400 hover:underline font-bold uppercase cursor-pointer"
                                                            >
                                                                Open in Full Modal →
                                                            </button>
                                                        </div>

                                                        {session.answers?.length > 0 ? (
                                                            <div className="space-y-3">
                                                                {session.answers.map((ans, aIdx) => (
                                                                    <div key={ans._id || aIdx} className="bg-[#050A14] border border-white/5 rounded-xl p-4 space-y-2">
                                                                        <div className="flex items-center justify-between text-[10px]">
                                                                            <span className="font-bold text-cyan-400">Q{aIdx + 1}: {ans.question}</span>
                                                                            {ans.evaluation?.score !== undefined && (
                                                                                <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold">
                                                                                    Score: {ans.evaluation.score}/10
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="bg-white/[0.02] border border-cyan-500/20 rounded-lg p-3 text-xs text-slate-200 leading-relaxed font-sans">
                                                                            <div className="text-[9px] font-black uppercase text-cyan-400 mb-1">Candidate Answer:</div>
                                                                            {ans.answer || <span className="text-rose-400 italic">[No answer recorded]</span>}
                                                                        </div>
                                                                        {ans.evaluation?.feedback && (
                                                                            <p className="text-[11px] text-slate-400 italic">
                                                                                AI Feedback: {typeof ans.evaluation.feedback === 'string' ? ans.evaluation.feedback : JSON.stringify(ans.evaluation.feedback)}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 rounded-xl bg-white/5 text-center text-xs text-slate-500">
                                                                No individual question responses recorded for this session.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500">
                                                <BookOpen className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <p className="text-slate-200 font-bold text-sm">No Completed Q&A Tasks Yet</p>
                                                <p className="text-xs text-slate-500 mt-1 max-w-sm">Assigned standard Q&A challenges will automatically populate here once candidate responses are finalized by the grading pipeline.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Coding Submissions list */}
                            <div className="bg-[#0F1728] border border-[#1E293B] p-6 rounded-[2rem] space-y-6">
                                <div className="border-b border-[#1E293B] pb-4">
                                    <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2 text-white">
                                        <Code className="w-5 h-5 text-purple-400" /> Completed Coding Submissions ({submissions.coding_submissions.length})
                                    </h3>
                                </div>
                                <div className="space-y-6">
                                    {submissions.coding_submissions.length > 0 ? (
                                        submissions.coding_submissions.map(submit => (
                                            <div key={submit._id} className="bg-[#060B16]/40 border border-[#1E293B] rounded-2xl p-6">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
                                                    <div>
                                                        <div className="font-bold text-sm text-white flex items-center gap-2">
                                                            {submit.candidate_name}
                                                            <span className="text-[9px] font-black uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-400">{submit.role} ({submit.language})</span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 mt-0.5">{submit.candidate_email}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[9px] uppercase font-black tracking-widest text-slate-500">AI Code Score</div>
                                                        <div className="text-xl font-black text-purple-400 mt-1">{submit.score}/100</div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
                                                    <div className="space-y-2">
                                                        <div className="font-bold text-white uppercase text-[9px] tracking-wider">Candidate Code Submission</div>
                                                        <pre className="bg-[#060B16] border border-white/5 p-4 rounded-xl overflow-x-auto text-[#06B6D4] font-mono text-[11px] max-h-[640px]">
                                                            {submit.code}
                                                        </pre>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {/* Live Preview (Web languages only) */}
                                                        {['javascript', 'typescript', 'html', 'css'].includes(submit.language?.toLowerCase()) && (
                                                            <div className="space-y-2">
                                                                <div className="font-bold text-white uppercase text-[9px] tracking-wider flex items-center gap-1.5 text-emerald-400">
                                                                    <Play className="w-3.5 h-3.5" /> Interactive App Preview
                                                                </div>
                                                                <div className="bg-[#060B16] border border-white/5 rounded-xl overflow-hidden h-[180px] bg-slate-950 relative">
                                                                    <iframe
                                                                        title={`preview-${submit._id}`}
                                                                        sandbox="allow-scripts"
                                                                        srcDoc={`
                                                                            <!DOCTYPE html>
                                                                            <html>
                                                                            <head>
                                                                                <style>
                                                                                    body {
                                                                                        font-family: ui-sans-serif, system-ui, sans-serif;
                                                                                        color: #e2e8f0;
                                                                                        padding: 16px;
                                                                                        margin: 0;
                                                                                        background-color: #0b1329;
                                                                                    }
                                                                                    h1, h2, h3 { color: #fff; margin-top: 0; font-size: 1.1rem; }
                                                                                    input, button, select, textarea {
                                                                                        padding: 6px 10px;
                                                                                        margin: 4px;
                                                                                        border-radius: 6px;
                                                                                        border: 1px solid #1e293b;
                                                                                        background-color: #1e293b;
                                                                                        color: #fff;
                                                                                        outline: none;
                                                                                        font-size: 11px;
                                                                                    }
                                                                                    button {
                                                                                        background-color: #3b82f6;
                                                                                        border: none;
                                                                                        cursor: pointer;
                                                                                        font-weight: 600;
                                                                                    }
                                                                                    button:hover { background-color: #2563eb; }
                                                                                    ul { padding-left: 20px; font-size: 12px; margin-top: 8px; }
                                                                                    li { margin: 4px 0; }
                                                                                </style>
                                                                            </head>
                                                                            <body>
                                                                                <script>
                                                                                    try {
                                                                                        ${submit.code}
                                                                                    } catch (e) {
                                                                                        document.body.innerHTML += '<div style="color: #ef4444; font-size: 11px; margin-top: 10px;">Runtime Error: ' + e.message + '</div>';
                                                                                    }
                                                                                </script>
                                                                            </body>
                                                                            </html>
                                                                        `}
                                                                        className="w-full h-full border-0"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                         {/* Console Output */}
                                                         <div className="space-y-2">
                                                             <div className="font-bold text-white uppercase text-[9px] tracking-wider flex items-center gap-1.5">
                                                                 <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Code Execution Output
                                                             </div>
                                                             <pre className="bg-[#060B16] border border-white/5 p-4 rounded-xl overflow-x-auto text-slate-300 font-mono text-[11px] max-h-[110px] bg-slate-950">
                                                                 {submit.output || "(No console output logged)"}
                                                             </pre>
                                                         </div>

                                                         {/* AI Evaluation */}
                                                         <div className="space-y-2">
                                                             <div className="font-bold text-white uppercase text-[9px] tracking-wider mb-1 flex items-center gap-1.5">
                                                                 Evaluation Outcome:
                                                                 <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${submit.result === 'PASS' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                                                     {submit.result}
                                                                 </span>
                                                             </div>
                                                             <div className="bg-[#060B16] border border-[#1E293B] p-4 rounded-xl max-h-[220px] overflow-y-auto leading-relaxed text-slate-400 font-medium">
                                                                 {renderFeedbackDetails(submit.feedback)}
                                                             </div>
                                                         </div>
                                                     </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500">
                                                <Code className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <p className="text-slate-200 font-bold text-sm">No Coding Submissions Yet</p>
                                                <p className="text-xs text-slate-500 mt-1 max-w-sm">Assigned algorithmic challenges will automatically populate here once candidate submissions execute compile testing.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: PLACEMENTS */}
                    {activeTab === 'placements' && (
                        <div className="space-y-8">
                            <div className="bg-gradient-to-r from-indigo-950 to-slate-950 p-8 rounded-[2rem] border border-[#1E293B] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                                    <Award className="w-64 h-64" />
                                </div>
                                <h1 className="text-3xl font-black text-white tracking-tight uppercase">Placements Dashboard</h1>
                                <p className="text-slate-400 text-sm mt-1">View candidates who have been successfully placed and selected.</p>
                            </div>

                            {/* KPI Metrics Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-5">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Placed Candidates</p>
                                    <p className="text-3xl font-black text-emerald-400 mt-1">{placementsCount}</p>
                                </div>
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-5">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Placement Rate</p>
                                    <p className="text-3xl font-black text-cyan-400 mt-1">{applicationsList.length ? ((placementsCount / applicationsList.length) * 100).toFixed(1) : 0}%</p>
                                </div>
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-5">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Total Applicants</p>
                                    <p className="text-3xl font-black text-white mt-1">{applicationsList.length}</p>
                                </div>
                            </div>

                            {/* Placements List Table */}
                            <div className="bg-[#0F1728] border border-[#1E293B] rounded-[2rem] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#1E293B] text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                                <th className="px-6 py-4">Candidate</th>
                                                <th className="px-6 py-4">Job Role Placed</th>
                                                <th className="px-6 py-4">Company</th>
                                                <th className="px-6 py-4">ATS Match Score</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#1E293B]">
                                            {applicationsList
                                                .filter(a => a.status === 'selected')
                                                .map(app => (
                                                    <tr key={app._id} className="hover:bg-white/[0.01] transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="text-xs font-bold text-white">{app.candidate_name}</div>
                                                            <div className="text-[10px] text-slate-500 mt-0.5">{app.candidate_email}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-bold text-slate-300">
                                                            {app.job_title}
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-slate-400">
                                                            {app.company}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-xs font-black text-cyan-400">{app.ats_score || 0}/100</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => {
                                                                    const cand = candidates.find(c => c.email === app.candidate_email || c.name === app.candidate_name);
                                                                    if (cand) {
                                                                        setSelectedCandidate(cand);
                                                                        setActiveTab('candidates');
                                                                    } else {
                                                                        alert("Candidate details not found in directory.");
                                                                    }
                                                                }}
                                                                className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer"
                                                            >
                                                                View Profile
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            {applicationsList.filter(a => a.status === 'selected').length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-12 text-slate-500 text-xs font-semibold">No candidates have been marked as placed yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: AI REAL-TIME VOICE INTERVIEWS */}
                    {activeTab === 'ai-interviews' && (
                        <div className="space-y-8">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-cyan-950 via-slate-950 to-blue-950 p-8 rounded-[2rem] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                                <div className="space-y-2 relative z-10">
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest">
                                        <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" /> Real-Time Voice Sessions
                                    </span>
                                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">AI Voice Interview Pipeline</h1>
                                    <p className="text-slate-400 text-sm font-medium">Review real-time AI candidate voice/video sessions, synced transcripts, fit summaries, and signal buckets.</p>
                                </div>
                                <button
                                    onClick={fetchAiSessions}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-white/5 border border-white/10 hover:border-cyan-500/30 text-white transition-all select-none hover:bg-cyan-500/5 cursor-pointer"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" /> Refresh Sessions
                                </button>
                            </div>

                            {/* KPI Cards Row */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-5">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Total AI Sessions</p>
                                    <p className="text-3xl font-black text-white mt-1">{aiSessions.length}</p>
                                </div>
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-5">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Strong Fits</p>
                                    <p className="text-3xl font-black text-emerald-400 mt-1">{aiSessions.filter(s => s.signal_bucket === 'strong').length}</p>
                                </div>
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-5">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Worth A Look</p>
                                    <p className="text-3xl font-black text-amber-400 mt-1">{aiSessions.filter(s => s.signal_bucket === 'worth_a_look').length}</p>
                                </div>
                                <div className="bg-[#0F1728] border border-[#1E293B] rounded-2xl p-5">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Needs Improvement</p>
                                    <p className="text-3xl font-black text-rose-400 mt-1">{aiSessions.filter(s => s.signal_bucket === 'weak').length}</p>
                                </div>
                            </div>

                            {/* Sessions Table */}
                            <div className="bg-[#0F1728] border border-[#1E293B] rounded-[2rem] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#1E293B] text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                                <th className="px-6 py-4">Candidate</th>
                                                <th className="px-6 py-4">Role & Level</th>
                                                <th className="px-6 py-4">AI Fit Summary</th>
                                                <th className="px-6 py-4">Signal Bucket</th>
                                                <th className="px-6 py-4">Duration</th>
                                                <th className="px-6 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#1E293B]">
                                            {aiSessions.map(sess => (
                                                <tr key={sess.id} className="hover:bg-white/[0.01] transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs font-bold text-white">{sess.candidate_name}</div>
                                                        <div className="text-[10px] text-slate-500 mt-0.5">{sess.candidate_email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs font-bold text-slate-200">{sess.role_context}</div>
                                                        <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{sess.difficulty}</div>
                                                    </td>
                                                    <td className="px-6 py-4 max-w-xs">
                                                        <p className="text-xs text-slate-300 truncate">{sess.summary_text}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${sess.signal_bucket === 'strong' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : (sess.signal_bucket === 'weak' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400')}`}>
                                                            {sess.signal_bucket?.replace('_', ' ') || 'WORTH A LOOK'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                                                        {Math.floor((sess.duration_seconds || 0) / 60)}m {(sess.duration_seconds || 0) % 60}s
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => setReviewSession(sess)}
                                                            className="px-3.5 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                                                        >
                                                            <Play className="w-3.5 h-3.5 fill-current" /> Review & Transcript
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {aiSessions.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-12 text-slate-500 text-xs font-semibold">
                                                        No candidate AI voice interview sessions completed yet. Candidates can start sessions at /ai-interview.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: HR ANALYTICS DASHBOARD */}
                    {activeTab === 'hr-analytics' && (
                        <HRAnalyticsDashboard />
                    )}

                    {/* TAB: SYSTEM SETTINGS */}
                    {activeTab === 'settings' && (
                        <div className="bg-[#0F1728] border border-[#1E293B] p-8 rounded-[2rem] space-y-8 max-w-2xl">
                            <div className="border-b border-[#1E293B] pb-4">
                                <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2 text-white">
                                    <Settings className="w-5 h-5 text-cyan-400" /> Admin settings
                                </h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Account preferences</h4>
                                    <p className="text-xs text-[#94A3B8]">Review the logged-in administrator information details.</p>
                                    <div className="bg-[#060B16] p-4 rounded-xl border border-[#1E293B] space-y-3 mt-4">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Name</span>
                                            <span className="text-white font-bold">{adminInfo.name}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Email Address</span>
                                            <span className="text-white font-bold">{adminInfo.email}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Role Status</span>
                                            <span className="text-cyan-400 font-bold uppercase tracking-wider">HR Admin Privileges</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-[#1E293B] pt-6 space-y-4">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">System Appearance</h4>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-300 font-bold">Theme mode</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Control the design tokens rendering.</p>
                                        </div>
                                        <div className="bg-[#060B16] p-1 rounded-xl border border-white/5 flex gap-2">
                                            <button className="px-4 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-black uppercase tracking-wider border border-cyan-500/20">
                                                Dark Mode
                                            </button>
                                            <button className="px-4 py-1.5 rounded-lg text-slate-500 text-xs font-bold uppercase tracking-wider opacity-50 cursor-not-allowed">
                                                Light Mode
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* MODAL: INTERVIEW CONFIGURATION DIALOG */}
            {assignModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-[#0F1728] border border-[#1E293B] p-8 rounded-[2rem] w-full max-w-2xl shadow-2xl relative">
                        <button onClick={() => setAssignModal({ open: false, type: 'standard', candidate: null })} className="absolute top-6 right-6 text-slate-500 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-all">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-2">
                                ASSIGN OVERRIDE
                            </span>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                                Challenge for {assignModal.candidate?.name}
                            </h3>
                            <p className="text-slate-400 text-xs mt-1">Configure questions or coding tasks. Standard AI generation will be bypassed for this candidate.</p>
                        </div>

                        {/* Target Job Role Select */}
                        <div className="mb-6">
                            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2">Target Job Role</label>
                            <select
                                value={assignRole}
                                onChange={(e) => setAssignRole(e.target.value)}
                                className="w-full bg-[#060B16] border border-[#1E293B] focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                            >
                                <option value="Software Engineer">Software Engineer</option>
                                <option value="Frontend Developer">Frontend Developer</option>
                                <option value="Backend Developer">Backend Developer</option>
                                <option value="Full Stack Developer">Full Stack Developer</option>
                                <option value="Data Scientist">Data Scientist</option>
                                <option value="Python Developer">Python Developer</option>
                                <option value="Java Developer">Java Developer</option>
                                <option value="DevOps Engineer">DevOps Engineer</option>
                                {jobs.map(job => (
                                    <option key={job._id} value={job.title}>{job.title} ({job.company})</option>
                                ))}
                            </select>
                        </div>

                        {assignModal.type === 'standard' ? (
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500">Custom Technical/Behavioral Questions</label>
                                {manualQuestions.map((q, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <span className="text-[10px] font-black text-slate-500 bg-white/5 border border-white/5 w-6 h-6 flex items-center justify-center rounded-lg">{idx + 1}</span>
                                        <input
                                            type="text"
                                            value={q}
                                            onChange={(e) => {
                                                const updated = [...manualQuestions];
                                                updated[idx] = e.target.value;
                                                setManualQuestions(updated);
                                            }}
                                            className="flex-grow bg-[#060B16] border border-[#1E293B] focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs focus:outline-none placeholder:text-slate-700 text-white"
                                            placeholder="Enter custom question text..."
                                        />
                                        <button onClick={() => removeQuestionField(idx)} className="text-red-500 hover:text-red-400 p-1 hover:bg-white/5 rounded-lg">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={addQuestionField} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-cyan-400 hover:text-cyan-300 py-1.5 px-3 border border-cyan-500/10 rounded-xl hover:bg-cyan-500/5 transition-all mt-2">
                                    <Plus className="w-3.5 h-3.5" /> Add Question
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2">Challenge Title</label>
                                    <input
                                        type="text"
                                        value={codingChallenge.title}
                                        onChange={(e) => setCodingChallenge({ ...codingChallenge, title: e.target.value })}
                                        className="w-full bg-[#060B16] border border-[#1E293B] focus:border-purple-500/40 rounded-xl px-4 py-3 text-xs focus:outline-none placeholder:text-slate-700 text-white"
                                        placeholder="e.g. Find First Non-Repeating Character"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2">Programming Language</label>
                                        <select
                                            value={codingChallenge.language}
                                            onChange={(e) => setCodingChallenge({ ...codingChallenge, language: e.target.value })}
                                            className="w-full bg-[#060B16] border border-[#1E293B] focus:border-purple-500/40 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                                        >
                                            <option value="python">Python</option>
                                            <option value="javascript">JavaScript</option>
                                            <option value="typescript">TypeScript</option>
                                            <option value="java">Java</option>
                                            <option value="cpp">C++</option>
                                            <option value="c">C</option>
                                            <option value="csharp">C#</option>
                                            <option value="go">Go</option>
                                            <option value="rust">Rust</option>
                                            <option value="ruby">Ruby</option>
                                            <option value="php">PHP</option>
                                            <option value="bash">Bash</option>
                                            <option value="html">HTML</option>
                                            <option value="css">CSS</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2">Boilerplate code template</label>
                                        <input
                                            type="text"
                                            value={codingChallenge.boilerplate}
                                            onChange={(e) => setCodingChallenge({ ...codingChallenge, boilerplate: e.target.value })}
                                            className="w-full bg-[#060B16] border border-[#1E293B] focus:border-purple-500/40 rounded-xl px-4 py-3 text-xs focus:outline-none placeholder:text-slate-700 text-white font-mono"
                                            placeholder="def find_char(s):"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2">Problem Statement</label>
                                    <textarea
                                        rows="3"
                                        value={codingChallenge.description}
                                        onChange={(e) => setCodingChallenge({ ...codingChallenge, description: e.target.value })}
                                        className="w-full bg-[#060B16] border border-[#1E293B] focus:border-purple-500/40 rounded-xl px-4 py-3 text-xs focus:outline-none placeholder:text-slate-700 text-white"
                                        placeholder="Enter problem requirements..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2">Expected Input / Output validation rules</label>
                                    <textarea
                                        rows="2"
                                        value={codingChallenge.input_output}
                                        onChange={(e) => setCodingChallenge({ ...codingChallenge, input_output: e.target.value })}
                                        className="w-full bg-[#060B16] border border-[#1E293B] focus:border-purple-500/40 rounded-xl px-4 py-3 text-xs focus:outline-none placeholder:text-slate-700 text-white"
                                        placeholder="Input: 'aabccc' | Output: 'b'"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex justify-end gap-3 border-t border-white/5 pt-6">
                            <button
                                onClick={() => setAssignModal({ open: false, type: 'standard', candidate: null })}
                                className="px-6 py-3 rounded-xl text-xs font-bold bg-white/5 border border-white/5 hover:bg-white/10 transition-all uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignInterview}
                                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${assignModal.type === 'standard' ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400' : 'bg-purple-500 text-white hover:bg-purple-400'}`}
                            >
                                Confirm Assignment
                            </button>
                        </div>
                        {message.text && (
                            <div className={`mt-4 p-4 rounded-xl text-xs font-bold border flex gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                                <span>{message.text}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL: JOB SPECIFICATION CREATION DIALOG */}
            {jobModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-[#0F1728] border border-[#1E293B] p-8 rounded-[2rem] w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setJobModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-all">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-2">
                                ATTAINMENT SPECS
                            </span>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                                New Job Posting spec
                            </h3>
                            <p className="text-slate-400 text-xs mt-1">Specify applicant criteria and CGPA constraints. AI matching will be processed automatically.</p>
                        </div>

                        <form onSubmit={(e) => { handleCreateJob(e); setJobModalOpen(false); }} className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2">Job Title</label>
                                <input
                                    type="text"
                                    value={newJob.title}
                                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                    className="w-full bg-[#060B16] border border-[#1E293B] focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs focus:outline-none text-white placeholder:text-slate-700"
                                    placeholder="e.g. Lead Frontend Engineer"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2">Company Name</label>
                                <input
                                    type="text"
                                    value={newJob.company}
                                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                                    className="w-full bg-[#060B16] border border-[#1E293B] focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs focus:outline-none text-white placeholder:text-slate-700"
                                    placeholder="e.g. Placement AI Corp"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2">Required Skills (Comma-separated)</label>
                                <input
                                    type="text"
                                    value={newJob.skills}
                                    onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                                    className="w-full bg-[#060B16] border border-[#1E293B] focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs focus:outline-none text-white placeholder:text-slate-700"
                                    placeholder="Python, React, MongoDB, Flask"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2">Description</label>
                                <textarea
                                    rows="3"
                                    value={newJob.description}
                                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                    className="w-full bg-[#060B16] border border-[#1E293B] focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs focus:outline-none text-white placeholder:text-slate-700"
                                    placeholder="Specify job requirements, details..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2">CGPA Cutoff</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={newJob.cgpaCutoff}
                                        onChange={(e) => setNewJob({ ...newJob, cgpaCutoff: e.target.value })}
                                        className="w-full bg-[#060B16] border border-[#1E293B] focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs focus:outline-none text-white placeholder:text-slate-700"
                                        placeholder="e.g. 7.50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2">Vacancies Required</label>
                                    <input
                                        type="number"
                                        value={newJob.vacancies}
                                        onChange={(e) => setNewJob({ ...newJob, vacancies: e.target.value })}
                                        className="w-full bg-[#060B16] border border-[#1E293B] focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs focus:outline-none text-white placeholder:text-slate-700"
                                        placeholder="e.g. 5"
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setJobModalOpen(false)}
                                    className="px-6 py-3 rounded-xl text-xs font-bold bg-white/5 border border-white/5 hover:bg-white/10 transition-all uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 rounded-xl text-xs font-black bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all uppercase tracking-wider"
                                >
                                    Post Job Spec
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* FLOATING BULK ACTION BARS */}
            {activeTab === 'candidates' && selectedCandidateIds.length > 0 && (
                <BulkActionBar
                    selectedCount={selectedCandidateIds.length}
                    type="candidates"
                    onClearSelection={() => setSelectedCandidateIds([])}
                    onBulkAssign={handleBulkAssignModalOpen}
                    onBulkEmail={handleOpenCandidateBulkEmail}
                    onExportSelected={handleExportCandidatesCSV}
                />
            )}

            {activeTab === 'applications' && selectedAppIds.length > 0 && (
                <BulkActionBar
                    selectedCount={selectedAppIds.length}
                    type="applications"
                    onClearSelection={() => setSelectedAppIds([])}
                    onBulkStatusUpdate={handleBulkStatusUpdate}
                    onBulkEmail={handleOpenApplicationBulkEmail}
                    onExportSelected={handleExportApplicationsCSV}
                />
            )}

            {/* MODAL: BULK EMAIL COMPOSER */}
            {emailModal.open && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-[#0F1728] border border-[#1E293B] p-8 rounded-[2rem] w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button onClick={() => setEmailModal({ ...emailModal, open: false })} className="absolute top-6 right-6 text-slate-500 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-all">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-2">
                                BROADCAST DISPATCH
                            </span>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                                Send Bulk Email ({emailModal.recipientCount} Candidates)
                            </h3>
                            <p className="text-slate-400 text-xs mt-1">
                                Dispatches custom email notifications directly to the selected candidate inboxes and creates corresponding in-app alerts.
                            </p>
                        </div>

                        {/* Quick Templates */}
                        <div className="mb-5 space-y-2">
                            <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500">Quick Templates</label>
                            <div className="grid grid-cols-2 gap-2">
                                {EMAIL_TEMPLATES.map(tmpl => (
                                    <button
                                        key={tmpl.id}
                                        type="button"
                                        onClick={() => setEmailModal(prev => ({
                                            ...prev,
                                            template: tmpl.id,
                                            subject: tmpl.subject,
                                            body: tmpl.body
                                        }))}
                                        className={`text-left p-2.5 rounded-xl border text-xs font-bold transition-all ${
                                            emailModal.template === tmpl.id
                                                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                                                : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {tmpl.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSendBulkEmailSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2">Email Subject</label>
                                <input
                                    type="text"
                                    value={emailModal.subject}
                                    onChange={(e) => setEmailModal({ ...emailModal, subject: e.target.value })}
                                    className="w-full bg-[#060B16] border border-[#1E293B] focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs focus:outline-none text-white"
                                    placeholder="Enter email subject line..."
                                    required
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Message Body</label>
                                    <span className="text-[9px] text-cyan-400 font-mono">Variables: &#123;name&#125;, &#123;email&#125;</span>
                                </div>
                                <textarea
                                    rows="7"
                                    value={emailModal.body}
                                    onChange={(e) => setEmailModal({ ...emailModal, body: e.target.value })}
                                    className="w-full bg-[#060B16] border border-[#1E293B] focus:border-cyan-500/40 rounded-xl px-4 py-3 text-xs focus:outline-none text-white leading-relaxed font-sans"
                                    placeholder="Write your email body here..."
                                    required
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setEmailModal({ ...emailModal, open: false })}
                                    className="px-6 py-3 rounded-xl text-xs font-bold bg-white/5 border border-white/5 hover:bg-white/10 transition-all uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sendingEmail}
                                    className="px-8 py-3 rounded-xl text-xs font-black bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all uppercase tracking-wider flex items-center gap-2"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    {sendingEmail ? 'Dispatching...' : `Send to ${emailModal.recipientCount} Candidates`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: REAL-TIME AI VOICE INTERVIEW CANDIDATE REVIEW */}
            {reviewSession && (
                <AIInterviewReviewModal
                    sessionData={reviewSession}
                    onClose={() => { setReviewSession(null); fetchAiSessions(); }}
                />
            )}

            {/* MODAL: CANDIDATE INTERVIEW ANSWERS INSPECTOR */}
            {selectedInterviewAnswers && (
                <CandidateAnswersModal
                    sessionData={selectedInterviewAnswers}
                    onClose={() => setSelectedInterviewAnswers(null)}
                />
            )}
        </div>
    );
};

export default HRDashboard;

