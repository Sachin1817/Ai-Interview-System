import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Mic, MicOff, Send, MessageSquare, Award, Clock,
    Sparkles, ArrowRight, CheckCircle, AlertTriangle, RefreshCw,
    Volume2, Shield, Flame, BookOpen, ChevronRight, Zap, Target
} from 'lucide-react';
import api from '../../services/api';

const QUICK_STARTERS = [
    "I'd like to build on that point by adding...",
    "While I see your perspective, let's consider...",
    "From a practical industry viewpoint...",
    "To synthesize what the group has discussed so far...",
    "Another critical factor we should not overlook is..."
];

const GDSimulator = () => {
    const [stage, setStage] = useState('setup'); // 'setup' | 'active' | 'results'
    const [topics, setTopics] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [customTopic, setCustomTopic] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(5);
    const [loading, setLoading] = useState(false);

    // Active session states
    const [sessionId, setSessionId] = useState(null);
    const [turns, setTurns] = useState([]);
    const [userSpeech, setUserSpeech] = useState('');
    const [activeSpeaker, setActiveSpeaker] = useState('moderator');
    const [isRecording, setIsRecording] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(300);

    // Results state
    const [evaluation, setEvaluation] = useState(null);

    const chatEndRef = useRef(null);

    // Load available topics on mount
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await api.get('/gd/topics');
                setTopics(res.data.topics || []);
                setParticipants(res.data.participants || []);
                if (res.data.topics?.length > 0) {
                    setSelectedTopic(res.data.topics[0]);
                }
            } catch (err) {
                console.error("Failed to load GD topics:", err);
            }
        };
        fetchTopics();
    }, []);

    // Auto scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [turns]);

    // Timer countdown
    useEffect(() => {
        if (stage !== 'active') return;
        const timer = setInterval(() => {
            setRemainingSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleConcludeGD();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [stage, sessionId]);

    const handleStartGD = async () => {
        const title = customTopic.trim() || selectedTopic?.title;
        if (!title) {
            alert('Please select or write a GD topic.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/gd/start', {
                topic_title: title,
                duration_minutes: durationMinutes
            });
            setSessionId(res.data.session_id);
            const initialTurns = res.data.initial_turns || [];
            setTurns(initialTurns);
            setRemainingSeconds(durationMinutes * 60);
            setStage('active');

            // Visually cycle through active speaker avatars during opening statements
            initialTurns.forEach((turn, idx) => {
                setTimeout(() => {
                    setActiveSpeaker(turn.sender_id);
                }, idx * 1000);
            });

        } catch (err) {
            console.error("Failed to start GD:", err);
            alert("Please login first to launch the GD Simulator.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendTurn = async (speechText = userSpeech) => {
        if (!speechText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        setActiveSpeaker('user');
        const speech = speechText.trim();
        setUserSpeech('');

        // Optimistically add candidate's message
        const optimisticTurn = {
            sender_id: 'user',
            sender_name: 'You (Candidate)',
            avatar: '🧑‍💻',
            role: 'You',
            text: speech,
            type: 'candidate'
        };
        setTurns(prev => [...prev, optimisticTurn]);

        try {
            const res = await api.post('/gd/turn', {
                session_id: sessionId,
                speech: speech,
                topic: selectedTopic?.title || customTopic
            });

            if (res.data.ai_responses?.length > 0) {
                // Add AI responses with small staggered delay for realism
                const responses = res.data.ai_responses;
                responses.forEach((resp, idx) => {
                    setTimeout(() => {
                        setActiveSpeaker(resp.sender_id);
                        setTurns(prev => [...prev, resp]);
                    }, (idx + 1) * 800);
                });
            }
        } catch (err) {
            console.error("Failed to process turn:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const recognitionRef = useRef(null);
    const baseSpeechRef = useRef('');

    const handleVoiceDictation = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser. Type your response below.');
            return;
        }

        if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
            return;
        }

        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new Recognition();
        rec.lang = 'en-US';
        rec.continuous = true;
        rec.interimResults = true;
        recognitionRef.current = rec;

        // Remember existing text when starting dictation
        baseSpeechRef.current = userSpeech ? userSpeech.trim() + ' ' : '';

        rec.onstart = () => setIsRecording(true);
        rec.onend = () => setIsRecording(false);
        rec.onerror = () => setIsRecording(false);

        rec.onresult = (e) => {
            let sessionTranscript = '';
            for (let i = 0; i < e.results.length; i++) {
                sessionTranscript += e.results[i][0].transcript;
            }
            setUserSpeech((baseSpeechRef.current + sessionTranscript).trim());
        };

        try {
            rec.start();
        } catch (err) {
            console.error("Speech start error:", err);
            setIsRecording(false);
        }
    };


    const handleConcludeGD = async () => {
        setLoading(true);
        try {
            const res = await api.post('/gd/evaluate', { session_id: sessionId });
            setEvaluation(res.data.evaluation);
            setStage('results');
        } catch (err) {
            console.error("Failed to evaluate GD:", err);
            alert("Error concluding GD session.");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="min-h-screen pt-36 md:pt-40 pb-20 px-6 lg:px-12 relative overflow-visible">
            <div className="blob blob-1 opacity-20" />

            <div className="max-w-6xl mx-auto relative z-10">

                {/* ══════════════ STAGE 1: SETUP ══════════════ */}
                {stage === 'setup' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                        {/* Header */}
                        <header className="text-center max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest mb-4 shadow-glow-purple">
                                <Users className="w-4 h-4 text-cyan-400" /> CAMPUS PLACEMENT GD SIMULATOR
                            </div>
                            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
                                Virtual <span className="hero-gradient">Group Discussion</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-base font-medium">
                                Practice real-time multi-peer discussions with AI candidates and an active Moderator. Master interjections, content articulation, and consensus building.
                            </p>
                        </header>

                        {/* Topics Selection Grid */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <Flame className="w-4 h-4 text-amber-400" /> Select A Trending Topic
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {topics.map(t => {
                                    const isSelected = selectedTopic?.id === t.id && !customTopic;
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => { setSelectedTopic(t); setCustomTopic(''); }}
                                            className={`p-6 rounded-3xl border cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-cyan-500/10 border-cyan-500 shadow-glow-cyan scale-[1.02]'
                                                    : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 hover:border-cyan-500/30'
                                            }`}
                                        >
                                            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                                                {t.category}
                                            </span>
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white mt-3 leading-snug">
                                                {t.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                                                {t.summary}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Custom Topic Input */}
                        <div className="glass-panel p-6 rounded-3xl space-y-3">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-300">Or Propose A Custom Topic</label>
                            <input
                                type="text"
                                value={customTopic}
                                onChange={e => { setCustomTopic(e.target.value); setSelectedTopic(null); }}
                                placeholder="e.g. Is Artificial General Intelligence an existential risk or ultimate productivity boon?"
                                className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                            />
                        </div>

                        {/* Virtual Roundtable Peers Preview */}
                        <div className="glass-panel p-6 rounded-3xl space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-400" /> Your Co-Discussants in the Room
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {participants.map(p => (
                                    <div key={p.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
                                        <div className="text-3xl mb-1">{p.avatar}</div>
                                        <p className="text-xs font-bold text-white">{p.name}</p>
                                        <p className="text-[10px] text-cyan-400 font-mono">{p.role}</p>
                                        <p className="text-[9px] text-slate-500 leading-tight pt-1">{p.style}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Launch Action */}
                        <div className="text-center pt-4">
                            <button
                                onClick={handleStartGD}
                                disabled={loading}
                                className="premium-button px-12 py-5 text-sm uppercase tracking-widest shadow-glow-primary"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-3">
                                        <RefreshCw className="w-4 h-4 animate-spin" /> Entering Virtual GD Room...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-3">
                                        Enter GD Room <ArrowRight className="w-5 h-5" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ══════════════ STAGE 2: LIVE ROUNDTABLE ══════════════ */}
                {stage === 'active' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Room Bar */}
                        <div className="glass-panel p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Live GD Round</span>
                                <h3 className="text-base font-black text-white mt-0.5">
                                    {selectedTopic?.title || customTopic}
                                </h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-white/10 font-mono font-black text-sm text-cyan-400">
                                    <Clock className="w-4 h-4 text-cyan-400" />
                                    {formatTime(remainingSeconds)}
                                </div>
                                <button
                                    onClick={handleConcludeGD}
                                    className="px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                                >
                                    Conclude GD
                                </button>
                            </div>
                        </div>

                        {/* Roundtable Avatars Bar */}
                        <div className="grid grid-cols-5 gap-3">
                            <div className={`p-3 rounded-2xl border text-center transition-all ${
                                activeSpeaker === 'moderator' ? 'bg-amber-500/10 border-amber-500 shadow-glow-amber scale-105' : 'bg-white/5 border-white/5'
                            }`}>
                                <div className="text-2xl">🎓</div>
                                <p className="text-[10px] font-black text-white mt-1">Moderator</p>
                                <p className="text-[8px] text-amber-400">Dr. Raman</p>
                            </div>

                            {participants.map(p => {
                                const isSpeaking = activeSpeaker === p.id;
                                return (
                                    <div
                                        key={p.id}
                                        className={`p-3 rounded-2xl border text-center transition-all ${
                                            isSpeaking ? 'bg-cyan-500/10 border-cyan-500 shadow-glow-cyan scale-105' : 'bg-white/5 border-white/5'
                                        }`}
                                    >
                                        <div className="text-2xl relative inline-block">
                                            {p.avatar}
                                            {isSpeaking && (
                                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-white mt-1 truncate">{p.name.split(' ')[0]}</p>
                                        <p className="text-[8px] text-slate-500 truncate">{p.role}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Live Conversation Stream */}
                        <div className="glass-panel p-6 rounded-[2.5rem] h-[380px] overflow-y-auto space-y-4 custom-scrollbar">
                            {turns.map((t, idx) => {
                                const isUser = t.type === 'candidate';
                                const isMod = t.type === 'moderator';

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {!isUser && (
                                            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">
                                                {t.avatar || '🗣️'}
                                            </div>
                                        )}
                                        <div className={`max-w-[75%] rounded-2xl p-4 ${
                                            isUser
                                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-medium'
                                                : isMod
                                                ? 'bg-amber-500/10 border border-amber-500/20 text-slate-200'
                                                : 'bg-slate-900/80 border border-white/10 text-slate-200'
                                        }`}>
                                            <div className="flex items-center justify-between gap-3 mb-1.5">
                                                <span className={`text-[10px] font-black uppercase tracking-wider ${isUser ? 'text-slate-950' : 'text-cyan-400'}`}>
                                                    {t.sender_name}
                                                </span>
                                                {t.agreement_type && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest bg-white/10 px-1.5 py-0.5 rounded text-slate-300">
                                                        {t.agreement_type.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs leading-relaxed">{t.text}</p>
                                        </div>
                                        {isUser && (
                                            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-xl shrink-0">
                                                🧑‍💻
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Quick Interjection Prompts */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-400" /> Starters:
                            </span>
                            {QUICK_STARTERS.map((s, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setUserSpeech(s + ' ')}
                                    className="text-[10px] bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-300 px-3 py-1 rounded-xl transition-all"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Input & Speak Bar */}
                        <div className="flex gap-3 items-center">
                            <button
                                type="button"
                                onClick={handleVoiceDictation}
                                className={`p-4 rounded-2xl border transition-all ${
                                    isRecording
                                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30'
                                }`}
                                title="Voice Input"
                            >
                                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>

                            <input
                                type="text"
                                value={userSpeech}
                                onChange={e => setUserSpeech(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendTurn()}
                                placeholder="Type your contribution or interjection here..."
                                className="flex-grow bg-slate-950/80 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                            />

                            <button
                                type="button"
                                onClick={() => handleSendTurn()}
                                disabled={isSubmitting || !userSpeech.trim()}
                                className="premium-button px-8 py-4 text-xs font-black uppercase tracking-wider"
                            >
                                {isSubmitting ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Speak <Send className="w-4 h-4" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ══════════════ STAGE 3: EVALUATION REPORT ══════════════ */}
                {stage === 'results' && evaluation && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        {/* Top Verdict Banner */}
                        <div className="glass-panel p-10 rounded-[3rem] text-center space-y-3 relative overflow-hidden">
                            <div className={`text-6xl font-black tracking-tighter ${
                                Number(evaluation.overall_score) >= 7 ? 'text-emerald-400' :
                                Number(evaluation.overall_score) >= 5 ? 'text-cyan-400' :
                                Number(evaluation.overall_score) >= 3 ? 'text-amber-400' : 'text-rose-400'
                            }`}>
                                {evaluation.overall_score}<span className="text-2xl text-slate-500">/10</span>
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                GD Placement Verdict: <span className={
                                    evaluation.verdict?.includes('Clear') ? 'text-emerald-400' :
                                    evaluation.verdict?.includes('Borderline') ? 'text-amber-400' : 'text-rose-400'
                                }>{evaluation.verdict}</span>
                            </h2>
                            <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
                                {evaluation.summary}
                            </p>
                        </div>

                        {/* 4 Pillars Scorecard */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: 'Content Depth', score: evaluation.content_depth, color: 'text-cyan-400', icon: BookOpen },
                                { label: 'Leadership / Initiation', score: evaluation.leadership_initiative, color: 'text-amber-400', icon: Target },
                                { label: 'Active Listening', score: evaluation.active_listening, color: 'text-purple-400', icon: Volume2 },
                                { label: 'Decorum & Tone', score: evaluation.articulation_decorum, color: 'text-emerald-400', icon: Shield },
                            ].map((pillar, i) => (
                                <div key={i} className="glass-card p-6 rounded-3xl text-center space-y-2 border-white/5">
                                    <div className="w-10 h-10 rounded-2xl bg-white/5 mx-auto flex items-center justify-center">
                                        <pillar.icon className={`w-5 h-5 ${pillar.color}`} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{pillar.label}</p>
                                    <p className={`text-3xl font-black ${pillar.color}`}>{pillar.score}</p>
                                </div>
                            ))}
                        </div>

                        {/* Strengths & Improvements */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card p-8 rounded-3xl border-white/5 space-y-4">
                                <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" /> Key Strengths
                                </h3>
                                <ul className="space-y-2.5">
                                    {evaluation.top_strengths?.map((s, i) => (
                                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                                            <span className="text-emerald-400 font-bold">•</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="glass-card p-8 rounded-3xl border-white/5 space-y-4">
                                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> Recommended Improvements
                                </h3>
                                <ul className="space-y-2.5">
                                    {evaluation.key_improvements?.map((imp, i) => (
                                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
                                            <span className="text-amber-400 font-bold">•</span> {imp}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-center gap-4 pt-4">
                            <button
                                onClick={() => { setStage('setup'); setEvaluation(null); }}
                                className="premium-button px-8 py-4 text-xs font-black uppercase tracking-widest"
                            >
                                Start New GD Round
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default GDSimulator;
