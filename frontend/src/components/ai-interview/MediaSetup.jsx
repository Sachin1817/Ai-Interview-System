import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mic, Volume2, CheckCircle2, AlertCircle, RefreshCw, Video, VideoOff, Settings2, Play } from 'lucide-react';

const MediaSetup = ({ onSetupComplete, initialRole = 'Software Engineer', initialDifficulty = 'Intermediate' }) => {
    const [stream, setStream] = useState(null);
    const [devices, setDevices] = useState({ video: [], audio: [] });
    const [selectedVideo, setSelectedVideo] = useState('');
    const [selectedAudio, setSelectedAudio] = useState('');
    const [audioLevel, setAudioLevel] = useState(0);
    const [permissionStatus, setPermissionStatus] = useState('idle'); // 'idle' | 'requesting' | 'granted' | 'denied'
    const [errorMessage, setErrorMessage] = useState('');
    const [audioOnlyMode, setAudioOnlyMode] = useState(false);
    
    // Role selection state
    const [roleContext, setRoleContext] = useState(initialRole);
    const [difficulty, setDifficulty] = useState(initialDifficulty);

    const videoRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animFrameRef = useRef(null);

    const rolesList = [
        'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Engineer',
        'Data Scientist', 'DevOps / Cloud Engineer', 'Cybersecurity Specialist', 'Product Manager'
    ];

    const difficultyList = ['Beginner', 'Intermediate', 'Advanced'];

    // Enumerate devices
    const getDevices = async () => {
        try {
            const deviceList = await navigator.mediaDevices.enumerateDevices();
            const videoDevs = deviceList.filter(d => d.kind === 'videoinput');
            const audioDevs = deviceList.filter(d => d.kind === 'audioinput');
            
            setDevices({ video: videoDevs, audio: audioDevs });
            
            if (videoDevs.length > 0 && !selectedVideo) setSelectedVideo(videoDevs[0].deviceId);
            if (audioDevs.length > 0 && !selectedAudio) setSelectedAudio(audioDevs[0].deviceId);
        } catch (err) {
            console.error("Error enumerating devices:", err);
        }
    };

    // Request permissions and start stream
    const initMedia = async (videoDeviceId = selectedVideo, audioDeviceId = selectedAudio, forceAudioOnly = audioOnlyMode) => {
        setPermissionStatus('requesting');
        setErrorMessage('');

        // Clean existing stream
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
            video: forceAudioOnly ? false : (videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true)
        };

        try {
            const userStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(userStream);
            setPermissionStatus('granted');

            if (videoRef.current && !forceAudioOnly) {
                videoRef.current.srcObject = userStream;
            }

            // Audio level metering via Web Audio API
            setupAudioMeter(userStream);
            await getDevices();
        } catch (err) {
            console.error("Media permission error:", err);
            setPermissionStatus('denied');
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setErrorMessage("Camera/Microphone access was denied. Please allow permissions in your browser address bar.");
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setErrorMessage("No camera or microphone found on your device.");
            } else {
                setErrorMessage(err.message || "Failed to initialize camera/microphone.");
            }
        }
    };

    const setupAudioMeter = (mediaStream) => {
        try {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContext();
            audioContextRef.current = audioCtx;

            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            const source = audioCtx.createMediaStreamSource(mediaStream);
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateMeter = () => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                const level = Math.min(100, Math.round((average / 128) * 100));
                setAudioLevel(level);

                animFrameRef.current = requestAnimationFrame(updateMeter);
            };

            updateMeter();
        } catch (e) {
            console.error("Audio meter setup error:", e);
        }
    };

    const stopAllMediaTracks = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setPermissionStatus('idle');
    };

    useEffect(() => {
        getDevices();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);


    const handleDeviceChange = (type, deviceId) => {
        if (type === 'video') {
            setSelectedVideo(deviceId);
            initMedia(deviceId, selectedAudio, audioOnlyMode);
        } else {
            setSelectedAudio(deviceId);
            initMedia(selectedVideo, deviceId, audioOnlyMode);
        }
    };

    const toggleAudioOnly = () => {
        const nextMode = !audioOnlyMode;
        setAudioOnlyMode(nextMode);
        initMedia(selectedVideo, selectedAudio, nextMode);
    };

    const handleStartInterview = () => {
        if (permissionStatus !== 'granted') return;
        onSetupComplete({
            mediaStream: stream,
            roleContext,
            difficulty,
            audioOnly: audioOnlyMode,
            selectedVideo,
            selectedAudio
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-widest mb-3">
                        <Settings2 className="w-4 h-4" /> System & Media Check
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                        Camera & Microphone Setup
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Confirm your camera and mic are working clearly before entering the real-time AI interview.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Video Self-View Preview */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-inner flex items-center justify-center group">
                            {!audioOnlyMode && (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover transform -scale-x-100"
                                />
                            )}

                            {audioOnlyMode && (
                                <div className="text-center p-6">
                                    <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3 text-cyan-400">
                                        <Mic className="w-8 h-8 animate-pulse" />
                                    </div>
                                    <p className="text-white font-bold text-sm">Audio-Only Mode Enabled</p>
                                    <p className="text-slate-400 text-xs mt-1">Your microphone stream will be recorded for voice analysis.</p>
                                </div>
                            )}

                            {permissionStatus === 'idle' && (
                                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-cyan-400 gap-3">
                                    <div className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                                        <Camera className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">Camera & Mic Permissions Required</p>
                                        <p className="text-slate-400 text-xs mt-1 max-w-xs">Click the button below to explicitly prompt your browser for camera and microphone access.</p>
                                    </div>
                                    <button
                                        onClick={() => initMedia()}
                                        className="mt-2 px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
                                    >
                                        <Camera className="w-4 h-4" /> Allow Camera & Mic Access
                                    </button>
                                </div>
                            )}

                            {permissionStatus === 'requesting' && (
                                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-cyan-400 gap-3">
                                    <RefreshCw className="w-8 h-8 animate-spin" />
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-300">Requesting Permissions...</span>
                                </div>
                            )}


                            {permissionStatus === 'denied' && (
                                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-red-400 gap-2">
                                    <AlertCircle className="w-10 h-10 mb-1" />
                                    <span className="font-bold text-sm text-white">Access Denied</span>
                                    <p className="text-xs text-slate-400 max-w-xs">{errorMessage}</p>
                                    <button 
                                        onClick={() => initMedia()}
                                        className="mt-3 px-4 py-2 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" /> Grant Permission & Retry
                                    </button>
                                </div>
                            )}

                            {/* Stream Indicator Badge */}
                            {permissionStatus === 'granted' && (
                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                    {audioOnlyMode ? 'MIC LIVE' : 'CAM & MIC LIVE'}
                                </div>
                            )}
                        </div>

                        {/* Audio Meter Bar */}
                        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                                <span className="flex items-center gap-2">
                                    <Volume2 className="w-4 h-4 text-cyan-400" /> Mic Input Sensitivity
                                </span>
                                <span className={audioLevel > 15 ? 'text-emerald-400' : 'text-slate-500'}>
                                    {audioLevel > 15 ? 'Sound Detected' : 'Speak to test...'}
                                </span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-white/5">
                                <div 
                                    className="bg-gradient-to-r from-cyan-500 via-emerald-400 to-green-500 h-full rounded-full transition-all duration-75"
                                    style={{ width: `${audioLevel}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Controls & Role Selection */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Device Selectors */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Audio / Video Options</h3>

                            {!audioOnlyMode && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-2">
                                        <Camera className="w-3.5 h-3.5 text-cyan-400" /> Camera Source
                                    </label>
                                    <select 
                                        value={selectedVideo}
                                        onChange={(e) => handleDeviceChange('video', e.target.value)}
                                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                                    >
                                        {devices.video.map((d, i) => (
                                            <option key={d.deviceId || i} value={d.deviceId}>
                                                {d.label || `Camera ${i + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-2">
                                    <Mic className="w-3.5 h-3.5 text-cyan-400" /> Microphone Source
                                </label>
                                <select 
                                    value={selectedAudio}
                                    onChange={(e) => handleDeviceChange('audio', e.target.value)}
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                                >
                                    {devices.audio.map((d, i) => (
                                        <option key={d.deviceId || i} value={d.deviceId}>
                                            {d.label || `Microphone ${i + 1}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Audio Only Fallback Toggle */}
                            <button
                                onClick={toggleAudioOnly}
                                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${audioOnlyMode ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'}`}
                            >
                                <span className="flex items-center gap-2">
                                    {audioOnlyMode ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                                    {audioOnlyMode ? 'Audio-Only Mode Active' : 'Switch to Audio-Only Mode'}
                                </span>
                                <span className="text-[10px] uppercase tracking-wider">{audioOnlyMode ? 'ON' : 'OFF'}</span>
                            </button>
                        </div>

                        {/* Interview Context Selector */}
                        <div className="space-y-4 pt-2 border-t border-white/5">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Interview Profile</h3>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">Target Engineering Role</label>
                                <select 
                                    value={roleContext}
                                    onChange={(e) => setRoleContext(e.target.value)}
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                                >
                                    {rolesList.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">Challenge Level</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {difficultyList.map(diff => (
                                        <button
                                            key={diff}
                                            onClick={() => setDifficulty(diff)}
                                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${difficulty === diff ? 'bg-gradient-to-r from-cyan-500 to-blue-600 border-cyan-400 text-slate-950 font-black shadow-lg shadow-cyan-500/20' : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'}`}
                                        >
                                            {diff}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Start Button */}
                        <button
                            disabled={permissionStatus !== 'granted'}
                            onClick={handleStartInterview}
                            className={`w-full py-4 rounded-2xl font-black text-sm tracking-wider uppercase flex items-center justify-center gap-3 transition-all shadow-xl ${permissionStatus === 'granted' ? 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-cyan-500/25 cursor-pointer transform hover:-translate-y-0.5' : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'}`}
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Start Real-Time AI Interview
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MediaSetup;
