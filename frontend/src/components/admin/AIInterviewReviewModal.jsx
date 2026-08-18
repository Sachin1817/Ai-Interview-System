import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Film, FileText, CheckCircle2, AlertTriangle, Star, Clock, MessageSquare, Send, User, Bot, Tag, ShieldCheck } from 'lucide-react';
import aiInterviewAPI from '../../services/aiInterviewApi';

const AIInterviewReviewModal = ({ sessionData, onClose }) => {
    const [summary, setSummary] = useState(null);
    const [turns, setTurns] = useState([]);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [activeTab, setActiveTab] = useState('transcript'); // 'transcript' | 'questions' | 'highlights' | 'notes'
    const [currentTimeMs, setCurrentTimeMs] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const mediaRef = useRef(null);

    useEffect(() => {
        if (!sessionData?.id) return;

        const fetchData = async () => {
            try {
                const [sumRes, turnRes, noteRes] = await Promise.all([
                    aiInterviewAPI.getSummary(sessionData.id).catch(() => ({ data: null })),
                    aiInterviewAPI.getTurns(sessionData.id).catch(() => ({ data: [] })),
                    aiInterviewAPI.getNotes(sessionData.id).catch(() => ({ data: [] }))
                ]);

                if (sumRes.data) setSummary(sumRes.data);
                if (turnRes.data) setTurns(turnRes.data);
                if (noteRes.data) setNotes(noteRes.data);
            } catch (err) {
                console.error("Error fetching review detail data:", err);
            }
        };

        fetchData();
    }, [sessionData]);

    const handleSeekTo = (timestampMs, textToSpeak = '') => {
        const secs = timestampMs / 1000;
        setCurrentTimeMs(timestampMs);
        if (mediaRef.current && sessionData?.recording_url) {
            mediaRef.current.currentTime = secs;
            mediaRef.current.play();
            setIsPlaying(true);
        } else if (textToSpeak && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(textToSpeak);
            window.speechSynthesis.speak(u);
        }
    };


    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim() || !sessionData?.id) return;

        try {
            const res = await aiInterviewAPI.addNote(sessionData.id, { note_text: newNote.trim() });
            if (res.data.success) {
                setNotes(prev => [res.data.note, ...prev]);
                setNewNote('');
            }
        } catch (err) {
            console.error("Error adding note:", err);
        }
    };

    const filteredTurns = turns.filter(t => 
        !searchTerm || t.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const signalColors = {
        strong: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        worth_a_look: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        weak: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="glass-card max-w-5xl w-full max-h-[90vh] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Modal Header */}
                <div className="p-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 bg-slate-900/60">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black">
                            <Film className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-xl font-black text-white">{sessionData?.candidate_name || 'Candidate'}</h3>
                                <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${signalColors[sessionData?.signal_bucket] || signalColors.worth_a_look}`}>
                                    {sessionData?.signal_bucket?.replace('_', ' ') || 'WORTH A LOOK'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Role: <strong className="text-slate-200">{sessionData?.role_context}</strong> ({sessionData?.difficulty}) • {sessionData?.candidate_email}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Content Body */}
                <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 custom-scrollbar">
                    {/* Left Side: Video/Audio Player & AI Summary (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Synced Video / Audio Player */}
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-inner flex items-center justify-center">
                            {sessionData?.recording_url ? (
                                <video
                                    ref={mediaRef}
                                    src={sessionData.recording_url}
                                    controls
                                    className="w-full h-full object-cover"
                                    onTimeUpdate={(e) => setCurrentTimeMs(Math.round(e.target.currentTime * 1000))}
                                />
                            ) : (
                                <div className="text-center p-6 space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                                        <Film className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-200">Interactive Audio & Transcript Replay</p>
                                        <p className="text-[11px] text-slate-400 mt-1">Click any transcript turn on the right to play the spoken audio aloud.</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (turns.length > 0 && window.speechSynthesis) {
                                                window.speechSynthesis.cancel();
                                                turns.forEach(t => {
                                                    const u = new SpeechSynthesisUtterance(`${t.speaker}: ${t.text}`);
                                                    window.speechSynthesis.speak(u);
                                                });
                                            }
                                        }}
                                        className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center gap-2 mx-auto cursor-pointer"
                                    >
                                        <Play className="w-4 h-4 fill-current" /> Play Full Audio Dialogue
                                    </button>
                                </div>
                            )}
                        </div>


                        {/* Summary Overview */}
                        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
                            <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> AI Fit Assessment
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                {summary?.summary_text || sessionData?.summary_text || 'No summary available.'}
                            </p>
                        </div>

                        {/* Flags */}
                        {summary?.flags && summary.flags.length > 0 && (
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
                                <div className="font-bold uppercase tracking-wider flex items-center gap-2 text-amber-400">
                                    <AlertTriangle className="w-4 h-4" /> Recruiter Flags
                                </div>
                                <ul className="list-disc list-inside space-y-1 text-slate-300">
                                    {summary.flags.map((f, idx) => (
                                        <li key={idx}>
                                            {typeof f === 'object' && f !== null
                                                ? (f.description || f.topic || JSON.stringify(f))
                                                : String(f)}
                                        </li>
                                    ))}
                                </ul>

                            </div>
                        )}
                    </div>

                    {/* Right Side: Tabbed Interactive Detail Views (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col glass-card rounded-2xl border border-white/5 overflow-hidden">
                        {/* Tab Switcher */}
                        <div className="flex border-b border-white/5 bg-slate-900/60 p-2 gap-2">
                            {[
                                { id: 'transcript', label: 'Synced Transcript', icon: MessageSquare },
                                { id: 'questions', label: 'Question Scores', icon: Star },
                                { id: 'highlights', label: 'Highlights', icon: Clock },
                                { id: 'notes', label: `Notes (${notes.length})`, icon: Tag }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-md' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Tab 1: Synced Transcript */}
                        {activeTab === 'transcript' && (
                            <div className="p-4 flex flex-col h-[400px]">
                                <input
                                    type="text"
                                    placeholder="Search transcript utterances..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mb-3 focus:outline-none focus:border-cyan-500/50"
                                />

                                <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                    {filteredTurns.map((t, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleSeekTo(t.timestamp_ms, `${t.speaker}: ${t.text}`)}
                                            className="p-3 rounded-xl bg-slate-900/60 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group space-y-1"
                                        >

                                            <div className="flex items-center justify-between text-[10px]">
                                                <span className={`font-black uppercase tracking-wider ${t.speaker === 'candidate' ? 'text-cyan-400' : 'text-slate-400'}`}>
                                                    {t.speaker === 'candidate' ? 'Candidate' : 'AI Interviewer'}
                                                </span>
                                                <span className="text-slate-500 font-mono group-hover:text-cyan-400">
                                                    @{Math.round(t.timestamp_ms / 1000)}s • Click to Seek ➔
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-200">{t.text}</p>
                                        </div>
                                    ))}
                                    {filteredTurns.length === 0 && (
                                        <p className="text-xs text-slate-500 text-center pt-8">No transcript turns recorded.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Question Scores */}
                        {activeTab === 'questions' && (
                            <div className="p-4 overflow-y-auto h-[400px] space-y-3 custom-scrollbar">
                                {summary?.per_question_scores?.map((qs, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-cyan-400">Q{i + 1}: {qs.question}</span>
                                            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                                Score: {qs.score}/10
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-300 italic">"{qs.answer}"</p>
                                        <p className="text-xs text-slate-400 pt-1 border-t border-white/5">
                                            <strong className="text-slate-200">AI Evaluation:</strong> {qs.feedback}
                                        </p>
                                    </div>
                                ))}
                                {(!summary?.per_question_scores || summary.per_question_scores.length === 0) && (
                                    <p className="text-xs text-slate-500 text-center pt-8">No per-question scores generated.</p>
                                )}
                            </div>
                        )}

                        {/* Tab 3: Highlights */}
                        {activeTab === 'highlights' && (
                            <div className="p-4 overflow-y-auto h-[400px] space-y-3 custom-scrollbar">
                                {summary?.highlight_clips?.map((clip, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleSeekTo(clip.timestamp_ms)}
                                        className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-white">{clip.topic}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{clip.note}</p>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20 shrink-0">
                                            @{Math.round(clip.timestamp_ms / 1000)}s
                                        </span>
                                    </div>
                                ))}
                                {(!summary?.highlight_clips || summary.highlight_clips.length === 0) && (
                                    <p className="text-xs text-slate-500 text-center pt-8">No highlight clip moments found.</p>
                                )}
                            </div>
                        )}

                        {/* Tab 4: Recruiter Notes */}
                        {activeTab === 'notes' && (
                            <div className="p-4 flex flex-col h-[400px]">
                                <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Add recruiter note or observation..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        className="flex-grow bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                                    >
                                        <Send className="w-3.5 h-3.5" /> Save Note
                                    </button>
                                </form>

                                <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {notes.map((n, i) => (
                                        <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs space-y-1">
                                            <p className="text-slate-200">{n.note_text}</p>
                                            <p className="text-[10px] text-slate-500">Added {new Date(n.created_at).toLocaleString()}</p>
                                        </div>
                                    ))}
                                    {notes.length === 0 && (
                                        <p className="text-xs text-slate-500 text-center pt-8">No recruiter notes added yet.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AIInterviewReviewModal;
