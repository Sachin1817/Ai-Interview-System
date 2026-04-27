import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';

// Inline Google SVG to avoid broken image issues
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
);
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { authAPI } from '../../services/api';

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
            if (!userCredential.user.emailVerified) {
                setError('Please verify your email before logging in. Check your inbox.');
                setLoading(false);
                return;
            }

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
                // Even if sync fails, we might still have a Firebase user, 
                // but features requiring backend will be limited to guest mode.
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
        <div className="min-h-screen pt-40 pb-20 flex items-center justify-center p-6 relative overflow-hidden bg-light-bg dark:bg-dark-bg transition-colors duration-500">
            {/* Ambient glows */}
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative w-full max-w-xl z-10"
            >
                <div className="glass-panel p-12 rounded-[3rem] border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <motion.div 
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-4 mb-8"
                        >
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-slate-900 text-lg shadow-glow-cyan bg-premium-gradient">AI</div>
                            <span className="text-slate-900 dark:text-white font-black text-2xl tracking-tighter uppercase">Interview Pro</span>
                        </motion.div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Welcome Back</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Continue your journey to success.</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-3 p-5 rounded-2xl text-sm mb-8 bg-red-500/10 border border-red-500/20 text-red-500 font-bold">
                            <span className="text-lg">⚠️</span> {error}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-[0.2em] mb-3 text-slate-500 dark:text-slate-500 ml-1">Email Identifier</label>
                            <input
                                {...register('email')}
                                className="premium-input"
                                placeholder="e.g. alex@career.ai"
                            />
                            {errors.email && <p className="text-red-500 text-[10px] mt-2 ml-2 font-black uppercase tracking-wider">{errors.email.message}</p>}
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3 ml-1">
                                <label className="block text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500">Security Key</label>
                                <Link to="/forgot-password" title="Forgot Password" className="text-xs font-black text-cyan-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">Forgot?</Link>
                            </div>
                            <input
                                type="password"
                                {...register('password')}
                                className="premium-input"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="text-red-500 text-[10px] mt-2 ml-2 font-black uppercase tracking-wider">{errors.password.message}</p>}
                        </div>

                        <button type="submit" disabled={loading} className="premium-button w-full mt-4">
                            {loading ? <div className="w-6 h-6 border-4 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div> : '✦ SECURE SIGN IN'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-white/5"></span></div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em]">
                            <span className="px-4 bg-white dark:bg-slate-900 text-slate-400 font-black">Fast Track</span>
                        </div>
                    </div>

                    {/* Google Button */}
                    <button onClick={handleGoogleLogin} disabled={loading}
                        className="w-full font-black py-4 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm uppercase text-xs tracking-widest">
                        <GoogleIcon />
                        Log in with Google
                    </button>

                    <p className="text-center mt-12 text-sm font-medium text-slate-500">
                        New to the platform? <Link to="/register" className="font-black text-cyan-500 hover:text-cyan-400 transition-colors uppercase tracking-widest ml-1">Join Now</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};


export default Login;


