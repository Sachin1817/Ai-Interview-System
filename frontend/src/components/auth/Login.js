import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { authAPI } from '../../services/api';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles, TrendingUp, Cpu, Award } from 'lucide-react';

// Inline Google SVG to avoid broken image issues
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" className="mr-3">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
);

const schema = yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
}).required();

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const userCredential = await login(data.email, data.password);
            
            // Check if email is verified
            // if (!userCredential.user.emailVerified) {
            //     setError('Please verify your email before logging in. Check your inbox.');
            //     setLoading(false);
            //     return;
            // }

            // Sync with backend to get a valid backend JWT
            try {
                const response = await authAPI.login({
                    email: data.email,
                    password: data.password
                });
                
                if (response.data && response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
            } catch (syncErr) {
                console.warn("Backend login sync failed", syncErr);
            }

            navigate('/');
        } catch (err) {
            console.error("Login error:", err);
            let msg = 'Invalid email or password. Please try again.';
            if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
            else if (err.code === 'auth/wrong-password') msg = 'Incorrect password.';
            else if (err.code === 'auth/too-many-requests') msg = 'Too many failed attempts. Try again later.';
            else if (err.code) msg = `Error (${err.code}): ${err.message}`;
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const userCredential = await loginWithGoogle();
            const user = userCredential.user;

            // Sync with backend to get a valid backend JWT
            try {
                const response = await authAPI.register({
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    branch: 'CSE', // Default branch for Google users
                    firebaseUid: user.uid
                });
                
                if (response.data && response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
            } catch (syncErr) {
                console.warn("Backend sync failed after Google Login", syncErr);
            }

            navigate('/');
        } catch (err) {
            setError('Google sign-in failed.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-950 text-white font-sans overflow-hidden relative">
            {/* Cyber 3D Grid Overlay */}
            <div 
                className="absolute inset-0 opacity-[0.02] pointer-events-none z-0"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '80px 80px',
                    transform: 'perspective(800px) rotateX(55deg) translateY(-100px)',
                    transformOrigin: 'top',
                }}
            />

            {/* Centered Login Card Container */}
            <div className="w-full min-h-screen flex items-center justify-center p-6 md:p-12 relative z-10">
                {/* Background glows */}
                <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full filter blur-[150px] opacity-15 bg-cyan-500 pointer-events-none animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full filter blur-[150px] opacity-10 bg-purple-600 pointer-events-none animate-pulse" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
                    style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        {/* Brand Logo */}
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-glow-cyan">AI</div>
                            <span className="font-black text-base tracking-widest uppercase text-white">Interview Pro</span>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">Welcome Back</h2>
                        <p className="text-slate-400 text-sm font-semibold tracking-wide">Continue your journey to placement success.</p>
                    </div>

                    {/* Error Alerts */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }} 
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-start gap-3 p-4 rounded-2xl text-xs bg-red-500/10 border border-red-500/20 text-red-400 font-bold mb-6"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1">Email Identifier</label>
                            <div className="relative flex items-center group">
                                <div className="absolute left-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-300">
                                    <Mail className="w-4.5 h-4.5" />
                                </div>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className="w-full bg-white/[0.03] border border-white/5 focus:border-cyan-500/40 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300 placeholder:text-slate-600 text-white"
                                    placeholder="alex@career.ai"
                                />
                            </div>
                            {errors.email && (
                                <motion.p 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="text-red-400 text-[10px] mt-1 ml-2 font-black uppercase tracking-wider"
                                >
                                    {errors.email.message}
                                </motion.p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Security Key</label>
                                <Link 
                                    to="/forgot-password" 
                                    className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors"
                                >
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative flex items-center group">
                                <div className="absolute left-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-300">
                                    <Lock className="w-4.5 h-4.5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register('password')}
                                    className="w-full bg-white/[0.03] border border-white/5 focus:border-cyan-500/40 rounded-2xl pl-12 pr-12 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300 placeholder:text-slate-600 text-white"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    className="absolute right-4 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <motion.p 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="text-red-400 text-[10px] mt-1 ml-2 font-black uppercase tracking-wider"
                                >
                                    {errors.password.message}
                                </motion.p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="premium-button w-full mt-2 py-4 text-xs font-black uppercase tracking-widest relative overflow-hidden group active:scale-[0.98] transition-transform shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-3 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    ✦ SECURE SIGN IN <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/5"></span>
                        </div>
                        <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em]">
                            <span className="px-4 bg-slate-900/10 text-slate-500 font-black backdrop-blur-xl">Fast Track</span>
                        </div>
                    </div>

                    {/* Google Button */}
                    <button 
                        onClick={handleGoogleLogin} 
                        disabled={loading}
                        className="w-full font-black py-4 rounded-2xl active:scale-[0.97] transition-all flex items-center justify-center bg-white/[0.03] border border-white/10 text-slate-200 hover:bg-white/[0.06] hover:border-white/20 shadow-sm uppercase text-[10px] tracking-widest"
                    >
                        <GoogleIcon />
                        Log in with Google
                    </button>

                    {/* Join Link */}
                    <p className="text-center mt-10 text-xs font-medium text-slate-400">
                        New to the platform? 
                        <Link 
                            to="/register" 
                            className="font-black text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest ml-1.5"
                        >
                            Join Now
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
