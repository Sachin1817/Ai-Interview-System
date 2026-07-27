import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, CheckCircle2, Loader2, Cpu, Bot, Terminal, Activity } from 'lucide-react';

const AILoadingOverlay = ({ 
    statuses = [], 
    subtitle = "Neural Core Engaged", 
    iconType = "robot", // robot, brain, cpu, terminal, activity
    themeColor = "cyan" // cyan, purple, rose, emerald, indigo
}) => {
    const [progress, setProgress] = useState(0);
    const [activeStep, setActiveStep] = useState(0);

    // Simulated progress bar increment with an easing curve
    useEffect(() => {
        let startTime = Date.now();
        const duration = 6500; // Simulated time to reach 98%
        
        const updateProgress = () => {
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime >= duration) {
                setProgress(98);
                setActiveStep(statuses.length - 1);
                return;
            }
            
            // Logarithmic progress curve (starts fast, slows down)
            const percent = Math.min(98, Math.round(98 * (1 - Math.pow(1 - elapsedTime / duration, 3.5))));
            setProgress(percent);
            
            // Map progress to activeStep
            if (statuses.length > 0) {
                const stepPercent = 98 / statuses.length;
                const currentStep = Math.min(statuses.length - 1, Math.floor(percent / stepPercent));
                setActiveStep(currentStep);
            }
            
            requestAnimationFrame(updateProgress);
        };
        
        const animFrame = requestAnimationFrame(updateProgress);
        return () => cancelAnimationFrame(animFrame);
    }, [statuses.length]);

    // Premium Color Themes mapping
    const themeStyles = {
        cyan: {
            text: 'text-cyan-400',
            bg: 'bg-cyan-500',
            border: 'border-cyan-500/30',
            glow: 'shadow-[0_0_30px_rgba(6,182,212,0.4)]',
            gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
            particle: 'bg-cyan-400',
        },
        purple: {
            text: 'text-purple-400',
            bg: 'bg-purple-500',
            border: 'border-purple-500/30',
            glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]',
            gradient: 'from-purple-500 via-pink-600 to-indigo-600',
            particle: 'bg-purple-400',
        },
        rose: {
            text: 'text-rose-400',
            bg: 'bg-rose-500',
            border: 'border-rose-500/30',
            glow: 'shadow-[0_0_30px_rgba(244,63,94,0.4)]',
            gradient: 'from-rose-500 via-pink-500 to-purple-600',
            particle: 'bg-rose-400',
        },
        emerald: {
            text: 'text-emerald-400',
            bg: 'bg-emerald-500',
            border: 'border-emerald-500/30',
            glow: 'shadow-[0_0_30px_rgba(16,185,129,0.4)]',
            gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
            particle: 'bg-emerald-400',
        },
        indigo: {
            text: 'text-indigo-400',
            bg: 'bg-indigo-500',
            border: 'border-indigo-500/30',
            glow: 'shadow-[0_0_30px_rgba(99,102,241,0.4)]',
            gradient: 'from-indigo-500 via-purple-600 to-pink-600',
            particle: 'bg-indigo-400',
        }
    };

    const currentTheme = themeStyles[themeColor] || themeStyles.cyan;

    // Render corresponding core icon
    const renderIcon = () => {
        const iconClass = "w-10 h-10 text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)]";
        switch (iconType) {
            case 'brain':
                return <BrainCircuit className={iconClass} />;
            case 'cpu':
                return <Cpu className={iconClass} />;
            case 'terminal':
                return <Terminal className={iconClass} />;
            case 'activity':
                return <Activity className={iconClass} />;
            case 'robot':
            default:
                return <Bot className={iconClass} />;
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/98 backdrop-blur-3xl overflow-hidden"
            style={{ backgroundColor: 'rgba(2, 6, 23, 0.98)' }}
        >
            {/* Cyber 3D Grid Overlay */}
            <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '100px 100px',
                    transform: 'perspective(600px) rotateX(60deg) translateY(-100px)',
                    transformOrigin: 'top',
                }}
            />
            
            {/* Ambient Background Glows */}
            <div className={`absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full filter blur-[150px] opacity-20 animate-pulse ${currentTheme.bg}`} style={{ animationDuration: '6s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full filter blur-[150px] opacity-15 bg-purple-600/30 animate-pulse" style={{ animationDuration: '9s' }} />

            {/* Core Animation Container */}
            <div className="relative w-80 h-80 mb-8 flex items-center justify-center">
                {/* Glow Backdrop */}
                <div className={`absolute inset-16 rounded-full blur-[70px] opacity-30 ${currentTheme.bg}`} />
                
                {/* Outer Gyro Ring (Rotating Clockwise) */}
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-0 rounded-full border-[3px] border-dashed ${currentTheme.border} opacity-40`}
                />
                
                {/* Middle Gyro Ring (Rotating Counter-Clockwise) */}
                <motion.div 
                    animate={{ rotate: -360 }} 
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-5 rounded-full border border-dashed border-purple-500/20 opacity-50"
                />

                {/* High-Tech Rotating Segment Ring */}
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                    className={`absolute inset-10 rounded-full border-[4px] border-t-transparent border-b-transparent border-l-cyan-400 border-r-purple-500 opacity-70 ${currentTheme.glow}`}
                />
                
                {/* Scanning Radar Sector */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-10 rounded-full pointer-events-none opacity-10"
                    style={{
                        background: 'conic-gradient(from 0deg, rgba(34, 211, 238, 0.4) 0deg, transparent 120deg, transparent 360deg)'
                    }}
                />

                {/* Center Core Capsule (Breathing & Glowing) */}
                <motion.div 
                    animate={{ scale: [1, 1.06, 1] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute inset-20 bg-gradient-to-br ${currentTheme.gradient} rounded-[2.5rem] flex items-center justify-center shadow-2xl ${currentTheme.glow}`}
                >
                    {/* Inner Glass Orb */}
                    <div className="absolute inset-1 rounded-[2.3rem] bg-slate-950/50 backdrop-blur-md flex items-center justify-center">
                        <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            {renderIcon()}
                        </motion.div>
                    </div>
                    
                    {/* Vertical Scanning Laser Line */}
                    <motion.div
                        animate={{ top: ['8%', '92%', '8%'] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                        className={`absolute left-3 right-3 h-0.5 opacity-80 ${currentTheme.particle} shadow-[0_0_12px_#fff]`}
                    />
                </motion.div>
                
                {/* High-Tech Orbiting Nodes */}
                {[...Array(8)].map((_, i) => {
                    const angle = (i * 45) * Math.PI / 180;
                    const radius = 145;
                    return (
                        <motion.div 
                            key={i}
                            animate={{ 
                                opacity: [0.2, 0.9, 0.2], 
                                scale: [0.7, 1.3, 0.7],
                                x: [
                                    Math.cos(angle) * (radius - 15),
                                    Math.cos(angle + 0.12) * (radius + 10),
                                    Math.cos(angle) * (radius - 15)
                                ],
                                y: [
                                    Math.sin(angle) * (radius - 15),
                                    Math.sin(angle + 0.12) * (radius + 10),
                                    Math.sin(angle) * (radius - 15)
                                ]
                            }}
                            transition={{ duration: 5 + (i % 3), repeat: Infinity, delay: i * 0.4 }}
                            className={`absolute top-[48.5%] left-[48.5%] w-2 h-2 rounded-full ${currentTheme.particle} ${currentTheme.glow}`}
                        />
                    );
                })}
            </div>

            {/* Content & Progress Display */}
            <div className="text-center space-y-6 max-w-lg px-8 relative z-10">
                <div className="space-y-1">
                    <p className={`text-xs font-black uppercase tracking-[0.4em] ${currentTheme.text} animate-pulse`}>
                        {subtitle}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-5xl font-extrabold text-white tracking-tighter tabular-nums">{progress}%</span>
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest pt-3">Synthesizing</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-80 h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative mx-auto">
                    <motion.div 
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${currentTheme.gradient} relative rounded-full`}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        <div className={`absolute right-0 top-0 bottom-0 w-2 blur-[3px] bg-white`} />
                    </motion.div>
                </div>

                {/* Checklist (Real-time progression) */}
                <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 text-left space-y-4 backdrop-blur-xl w-[26rem] mx-auto shadow-2xl">
                    {statuses.map((status, i) => {
                        const isDone = i < activeStep;
                        const isActive = i === activeStep;
                        const isPending = i > activeStep;

                        return (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className={`flex items-center gap-3 transition-all duration-500 ${
                                    isDone ? 'text-slate-400' : isActive ? 'text-white' : 'text-slate-600'
                                }`}
                            >
                                {isDone ? (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 shadow-[0_0_12px_rgba(52,211,153,0.3)]" />
                                    </motion.div>
                                ) : isActive ? (
                                    <Loader2 className={`w-5 h-5 ${currentTheme.text} animate-spin shrink-0`} />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border border-slate-800 flex items-center justify-center shrink-0">
                                        <span className="text-[9px] font-black text-slate-600">{i + 1}</span>
                                    </div>
                                )}
                                
                                <span className={`text-[11px] font-black uppercase tracking-wider ${
                                    isActive ? 'font-black tracking-widest text-cyan-400' : 'font-medium'
                                }`}>
                                    {status}
                                </span>

                                {isActive && (
                                    <motion.span 
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="text-[8px] font-black px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400 uppercase tracking-widest shrink-0 ml-auto"
                                    >
                                        Active
                                    </motion.span>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default AILoadingOverlay;
