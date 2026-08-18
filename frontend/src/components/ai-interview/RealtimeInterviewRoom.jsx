import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, Sparkles, MessageSquare, AlertCircle, Clock, ShieldCheck, CheckCircle2, Bot, User, Send } from 'lucide-react';
import aiInterviewAPI from '../../services/aiInterviewApi';

const RealtimeInterviewRoom = ({ setupData, onInterviewFinish }) => {
    const { mediaStream, roleContext, difficulty, audioOnly } = setupData;

    const [sessionId, setSessionId] = useState(null);
    const [livekitToken, setLivekitToken] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('initializing'); // 'initializing' | 'active' | 'wrapping_up' | 'ended'
    const [aiState, setAiState] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking'
    
    const [turns, setTurns] = useState([]);
    const [candidateUtterance, setCandidateUtterance] = useState('');
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [showEndModal, setShowEndModal] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(audioOnly);

    const selfVideoRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const timerIntervalRef = useRef(null);
    const transcriptEndRef = useRef(null);
    const activeUtteranceRef = useRef('');
    const isAiSpeakingRef = useRef(false);
    const [textInput, setTextInput] = useState('');

    // Attach stream to video tag
    useEffect(() => {
        if (selfVideoRef.current && mediaStream && !isVideoOff) {
            selfVideoRef.current.srcObject = mediaStream;
        }
    }, [mediaStream, isVideoOff]);

    // Timer effect
    useEffect(() => {
        if (connectionStatus === 'active') {
            timerIntervalRef.current = setInterval(() => {
                setTimerSeconds(prev => prev + 1);
            }, 1000);
        } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [connectionStatus]);

    // Scroll to bottom of transcript
    useEffect(() => {
        if (transcriptEndRef.current) {
            transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [turns, candidateUtterance, aiState]);

    const hasInitializedRef = useRef(false);

    // ─── Initialize Session & Start AI Conversation ───
    useEffect(() => {
        if (hasInitializedRef.current) return;
        hasInitializedRef.current = true;

        const initSession = async () => {
            try {
                const res = await aiInterviewAPI.createSession({
                    role_context: roleContext,
                    difficulty: difficulty,
                    recording_type: audioOnly ? 'audio_only' : 'video'
                });

                if (res.data.success) {
                    const sid = res.data.session_id;
                    setSessionId(sid);
                    setLivekitToken(res.data.livekit_token);
                    setConnectionStatus('active');

                    // Update session status to in_progress
                    await aiInterviewAPI.updateStatus(sid, { status: 'in_progress' });

                    // Fire initial AI greeting / question
                    triggerAiTurn(sid, "");
                    setupSpeechRecognition(sid);
                }
            } catch (err) {
                console.error("Error creating AI interview session:", err);
            }
        };

        initSession();

        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) {}
            }
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);


    // ─── AI Interaction Engine ───
    const triggerAiTurn = async (sid, utteranceText) => {
        const currentSid = sid || sessionId;
        if (!currentSid) return;

        setAiState('thinking');

        try {
            const nowMs = timerSeconds * 1000;
            const res = await aiInterviewAPI.interact(currentSid, {
                utterance: utteranceText,
                timestamp_ms: nowMs
            });

            if (res.data.success) {
                const aiText = res.data.ai_text;
                const isWrapUp = res.data.is_wrap_up;

                // Update local turn list
                if (utteranceText) {
                    setTurns(prev => [...prev, { speaker: 'candidate', text: utteranceText, timestamp_ms: nowMs }]);
                }
                setTurns(prev => [...prev, { speaker: 'ai', text: aiText, timestamp_ms: nowMs + 500 }]);
                setCandidateUtterance('');
                setTextInput('');

                // Speak AI response
                speakAiText(aiText, () => {
                    if (isWrapUp) {
                        setConnectionStatus('wrapping_up');
                        handleFinishInterview(currentSid);
                    } else {
                        setAiState('listening');
                    }
                });
            }
        } catch (err) {
            console.error("Error interacting with AI:", err);
            setAiState('listening');
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!textInput.trim() || aiState === 'thinking') return;
        const msg = textInput.trim();
        setTextInput('');
        triggerAiTurn(sessionId, msg);
    };

    const silenceDebounceRef = useRef(null);
    const lastSubmittedTextRef = useRef('');

    // ─── Text-To-Speech (TTS) Engine with Echo Protection ───
    const speakAiText = (text, onEndCallback) => {
        if (!synthRef.current) {
            setAiState('listening');
            if (onEndCallback) onEndCallback();
            return;
        }

        isAiSpeakingRef.current = true;

        // Stop speech recognition while AI is speaking so mic doesn't re-capture speaker voice
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) {}
        }

        synthRef.current.cancel(); // cancel any active speech
        setAiState('speaking');

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05; // Slightly faster natural pacing
        utterance.pitch = 1.0;

        utterance.onend = () => {
            setTimeout(() => {
                isAiSpeakingRef.current = false;
                setAiState('listening');
                if (recognitionRef.current) {
                    try { recognitionRef.current.start(); } catch (e) {}
                }
                if (onEndCallback) onEndCallback();
            }, 200);
        };

        utterance.onerror = (e) => {
            console.error("TTS error:", e);
            setTimeout(() => {
                isAiSpeakingRef.current = false;
                setAiState('listening');
                if (recognitionRef.current) {
                    try { recognitionRef.current.start(); } catch (e) {}
                }
                if (onEndCallback) onEndCallback();
            }, 200);
        };

        synthRef.current.speak(utterance);
    };

    // ─── Speech-To-Text (STT) Recognition ───
    const setupSpeechRecognition = (sid) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Web Speech Recognition API not supported on this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognitionRef.current = recognition;

        recognition.onresult = (event) => {
            // Strictly ignore microphone input while AI is speaking to eliminate echo feedback
            if (isAiSpeakingRef.current) {
                return;
            }

            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            const currentText = (final || interim).trim();

            if (currentText && currentText !== lastSubmittedTextRef.current) {
                setCandidateUtterance(currentText);

                // Clear previous silence timer
                if (silenceDebounceRef.current) {
                    clearTimeout(silenceDebounceRef.current);
                }

                // If candidate pauses for 900ms after speaking, immediately submit answer
                silenceDebounceRef.current = setTimeout(() => {
                    if (!isAiSpeakingRef.current && currentText !== lastSubmittedTextRef.current) {
                        lastSubmittedTextRef.current = currentText;
                        triggerAiTurn(sid, currentText);
                    }
                }, 900);
            }
        };


        recognition.onerror = (event) => {
            if (event.error !== 'no-speech') {
                console.error("Speech recognition error:", event.error);
            }
        };

        recognition.onend = () => {
            // Restart if active and AI is not speaking
            if (connectionStatus === 'active' && recognitionRef.current && !isAiSpeakingRef.current) {
                try { recognitionRef.current.start(); } catch (e) {}
            }
        };

        try {
            recognition.start();
        } catch (e) {
            console.error("Failed to start speech recognition:", e);
        }
    };


    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);

    // Initialize MediaRecorder for recording candidate video/audio session
    useEffect(() => {
        if (mediaStream) {
            try {
                const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
                    ? 'video/webm;codecs=vp9,opus'
                    : (MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4');

                const recorder = new MediaRecorder(mediaStream, { mimeType });
                recordedChunksRef.current = [];

                recorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) {
                        recordedChunksRef.current.push(e.data);
                    }
                };

                recorder.start(1000);
                mediaRecorderRef.current = recorder;
            } catch (err) {
                console.error("MediaRecorder initialization error:", err);
            }
        }
    }, [mediaStream]);

    const [isSubmittingEnd, setIsSubmittingEnd] = useState(false);

    const stopRecordingAndGetUrl = () => {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                resolve(null);
            }, 2500);

            if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
                clearTimeout(timeout);
                if (recordedChunksRef.current.length > 0) {
                    try {
                        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                        return;
                    } catch (e) {
                        resolve(null);
                        return;
                    }
                }
                resolve(null);
                return;
            }

            mediaRecorderRef.current.onstop = () => {
                clearTimeout(timeout);
                try {
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                    if (blob.size > 0) {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    } else {
                        resolve(null);
                    }
                } catch (err) {
                    console.error("Error finalizing candidate real voice blob:", err);
                    resolve(null);
                }
            };

            try {
                mediaRecorderRef.current.stop();
            } catch (e) {
                clearTimeout(timeout);
                resolve(null);
            }
        });
    };

    // ─── End / Complete Interview ───
    const handleFinishInterview = async (explicitSid) => {
        const sid = explicitSid || sessionId;
        if (!sid) return;

        setIsSubmittingEnd(true);
        setConnectionStatus('ended');
        if (synthRef.current) synthRef.current.cancel();
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) {}
        }


        // Wait for real candidate voice & video recording blob to finalize
        const recUrl = await stopRecordingAndGetUrl();

        // Stop media tracks
        if (mediaStream) {
            mediaStream.getTracks().forEach(t => t.stop());
        }

        // Save session status & real candidate recording URL with fallback payload
        try {
            await aiInterviewAPI.updateStatus(sid, {
                status: 'completed',
                duration_seconds: timerSeconds,
                recording_url: recUrl
            });
        } catch (err) {
            console.warn("Retrying status update without heavy recording payload:", err);
            try {
                await aiInterviewAPI.updateStatus(sid, {
                    status: 'completed',
                    duration_seconds: timerSeconds
                });
            } catch (e) {
                console.error("Failed to update status:", e);
            }
        }

        // Trigger async AI summary generation
        let summaryRes = null;
        try {
            summaryRes = await aiInterviewAPI.generateSummary(sid);
        } catch (err) {
            console.error("Error generating session summary:", err);
        }

        if (onInterviewFinish) {
            onInterviewFinish(sid, summaryRes?.data?.summary);
        }
    };




    const formatTimer = (totalSecs) => {
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
            {/* Top Bar: Timer, Status, Live Indicators */}
            <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" /> Real-Time AI Interviewer
                    </div>
                    <span className="text-slate-400 text-xs font-bold border-l border-white/10 pl-3 hidden sm:inline">
                        Role: <span className="text-white">{roleContext}</span> ({difficulty})
                    </span>
                </div>

                {/* Recording Badge & Timer */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                        <span>REC ACTIVE</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs font-bold">
                        <Clock className="w-4 h-4 text-cyan-400" /> {formatTimer(timerSeconds)}
                    </div>

                    <button
                        onClick={() => setShowEndModal(true)}
                        className="px-4 py-2 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <PhoneOff className="w-4 h-4" /> End Interview
                    </button>
                </div>
            </div>

            {/* Main Layout: Self-View Video Tile + AI Avatar & Live Dialogue */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left: Video Self-View & Audio Controls (5 cols) */}
                <div className="lg:col-span-5 space-y-4 flex flex-col">
                    {/* Self-View Video Tile */}
                    <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-2xl flex-grow flex items-center justify-center">
                        {!isVideoOff && (
                            <video
                                ref={selfVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover transform -scale-x-100"
                            />
                        )}

                        {isVideoOff && (
                            <div className="text-center p-6">
                                <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-2 text-cyan-400">
                                    <User className="w-8 h-8" />
                                </div>
                                <span className="text-xs font-bold text-slate-300">Camera Paused (Audio Only)</span>
                            </div>
                        )}

                        {/* Candidate Name Badge Overlay */}
                        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-white text-xs font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Candidate Self-View
                        </div>

                        {/* Mute Overlay */}
                        {isMuted && (
                            <div className="absolute top-3 right-3 p-2 rounded-xl bg-red-500/80 backdrop-blur-md text-white">
                                <MicOff className="w-4 h-4" />
                            </div>
                        )}
                    </div>

                    {/* Quick Media Controls Bar */}
                    <div className="glass-card p-3 rounded-2xl border border-white/10 flex items-center justify-center gap-4">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${isMuted ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-slate-800 border-white/10 text-slate-300 hover:text-white'}`}
                        >
                            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            <span>{isMuted ? 'Unmute' : 'Mute Mic'}</span>
                        </button>

                        {!audioOnly && (
                            <button
                                onClick={() => setIsVideoOff(!isVideoOff)}
                                className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${isVideoOff ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-slate-800 border-white/10 text-slate-300 hover:text-white'}`}
                            >
                                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                                <span>{isVideoOff ? 'Turn Video On' : 'Pause Video'}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: AI Persona Avatar & Real-time Transcript Log (7 cols) */}
                <div className="lg:col-span-7 flex flex-col h-[520px] glass-card p-6 rounded-3xl border border-white/10">
                    {/* AI Avatar & Live State Indicator */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
                                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400">
                                        <Bot className="w-6 h-6" />
                                    </div>
                                </div>
                                <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${aiState === 'speaking' ? 'bg-green-400 animate-pulse' : (aiState === 'thinking' ? 'bg-amber-400 animate-ping' : 'bg-cyan-400')}`} />
                            </div>

                            <div>
                                <h4 className="text-sm font-black text-white">AI Placement Recruiter</h4>
                                <p className="text-[11px] text-cyan-400 font-bold tracking-wide uppercase">
                                    {aiState === 'speaking' && '🗣️ Speaking question...'}
                                    {aiState === 'thinking' && '🧠 Processing response...'}
                                    {aiState === 'listening' && '🎙️ Listening to you...'}
                                    {aiState === 'idle' && 'Initializing...'}
                                </p>
                            </div>
                        </div>

                        {/* Live Audio Waveform Simulation */}
                        <div className="flex items-center gap-1">
                            {[0.4, 0.9, 0.6, 1.0, 0.5].map((h, i) => (
                                <span 
                                    key={i} 
                                    className={`w-1 bg-cyan-400 rounded-full transition-all duration-300 ${aiState === 'speaking' ? 'animate-pulse' : 'h-2 opacity-30'}`}
                                    style={{ height: aiState === 'speaking' ? `${h * 24}px` : '8px' }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Live Transcript / Subtitles Scroll Container */}
                    <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {turns.map((turn, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-start gap-3 ${turn.speaker === 'candidate' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${turn.speaker === 'candidate' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-300 border border-white/10'}`}>
                                    {turn.speaker === 'candidate' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>

                                <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${turn.speaker === 'candidate' ? 'bg-cyan-500/10 text-cyan-100 border border-cyan-500/20 rounded-tr-none' : 'bg-slate-900/80 text-slate-200 border border-white/5 rounded-tl-none'}`}>
                                    <p className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                                        {turn.speaker === 'candidate' ? 'You' : 'AI Interviewer'}
                                    </p>
                                    <p className="whitespace-pre-wrap">{turn.text}</p>
                                </div>
                            </motion.div>
                        ))}

                        {/* Live Candidate Voice Typing Subtitle */}
                        {candidateUtterance && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 flex-row-reverse">
                                <div className="w-8 h-8 rounded-xl bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 flex items-center justify-center text-xs shrink-0 animate-pulse">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="max-w-[80%] p-4 rounded-2xl text-xs bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 italic">
                                    <p className="font-bold text-[10px] uppercase tracking-widest text-cyan-400 mb-1 flex items-center gap-1">
                                        <Mic className="w-3 h-3 animate-pulse" /> Live Speech Capture...
                                    </p>
                                    <p>{candidateUtterance}</p>
                                </div>
                            </motion.div>
                        )}

                        <div ref={transcriptEndRef} />
                    </div>

                    {/* Candidate Response Input Bar (Voice + Text Backup) */}
                    <form onSubmit={handleManualSubmit} className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                        <input
                            type="text"
                            placeholder={aiState === 'speaking' ? "AI is speaking..." : "Speak into your mic or type your answer here..."}
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            disabled={aiState === 'thinking'}
                            className="flex-grow bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                        />
                        <button
                            type="submit"
                            disabled={!textInput.trim() || aiState === 'thinking'}
                            className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                        >
                            <Send className="w-3.5 h-3.5" /> Send
                        </button>
                    </form>
                </div>
            </div>

            {/* End Confirmation Modal */}
            <AnimatePresence>
                {showEndModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-card max-w-md w-full p-6 rounded-3xl border border-white/10 shadow-2xl text-center space-y-4"
                        >
                            <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
                                <PhoneOff className="w-7 h-7" />
                            </div>

                            <h3 className="text-xl font-black text-white">Complete & End Interview?</h3>
                            <p className="text-slate-400 text-xs leading-relaxed">
                                Are you sure you want to end the session now? Our AI will compile your responses, transcript, and audio/video score card for recruiter review.
                            </p>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowEndModal(false)}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition-all border border-white/10"
                                >
                                    Continue Interview
                                </button>

                                <button
                                    onClick={() => {
                                        setShowEndModal(false);
                                        handleFinishInterview();
                                    }}
                                    className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-red-500/25"
                                >
                                    End & Submit
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submitting & Compiling Overlay */}
            {isSubmittingEnd && (
                <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="w-14 h-14 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
                    <div className="text-center space-y-1">
                        <h3 className="text-lg font-black text-white">Finalizing Interview & AI Assessment...</h3>
                        <p className="text-slate-400 text-xs">Compiling candidate video stream, voice recording, and AI score report. Please wait a moment.</p>
                    </div>
                </div>
            )}
        </div>
    );
};



export default RealtimeInterviewRoom;
