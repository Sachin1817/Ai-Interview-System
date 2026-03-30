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
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            setError('Google sign-in failed.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
            {/* Ambient glows */}
            <div className="fixed top-[-10%] left-[-5%] w-80 h-80 rounded-full opacity-20 pointer-events-none bg-accent dark:bg-cyan-400 blur-[100px]"/>
            <div className="fixed bottom-[-10%] right-[-5%] w-96 h-96 rounded-full opacity-15 pointer-events-none bg-blue-500 dark:bg-indigo-500 blur-[100px]"/>

            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45 }}
                className="relative w-full max-w-md z-10 glass-panel p-10 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-2xl transition-all duration-300"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 mb-5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white dark:text-slate-900 text-sm shadow-lg bg-gradient-to-br from-cyan-400 to-blue-600">AI</div>
                        <span className="text-light-text dark:text-white font-bold text-lg tracking-tight">Interview System</span>
                    </div>
                    <h2 className="text-3xl font-black text-light-text dark:text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Sign in to continue your AI journey</p>
                </div>

                {/* Error */}
                {error && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-4 rounded-xl text-sm mb-6"
                        style={{background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171'}}>
                        <span>⚠️</span> {error}
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-slate-500 dark:text-slate-400">Email Address</label>
                        <input
                            {...register('email')}
                            className="w-full rounded-xl px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-light-text dark:text-white text-sm focus:outline-none focus:border-accent dark:focus:border-cyan-500 transition-all font-medium"
                            placeholder="name@example.com"
                        />
                        {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1 font-semibold">{errors.email.message}</p>}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Password</label>
                            <Link to="/forgot-password" title="Forgot Password" className="text-xs font-bold text-accent dark:text-blue-400 hover:underline">Forgot?</Link>
                        </div>
                        <input
                            type="password"
                            {...register('password')}
                            className="w-full rounded-xl px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-light-text dark:text-white text-sm focus:outline-none focus:border-accent dark:focus:border-cyan-500 transition-all font-medium"
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1 font-semibold">{errors.password.message}</p>}
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full font-bold py-3.5 rounded-xl text-white dark:text-slate-900 active:scale-95 transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-50 bg-gradient-to-r from-accent to-blue-600 shadow-lg shadow-accent/20 dark:from-cyan-500 dark:to-blue-600 dark:shadow-cyan-500/20"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '✦ Sign In'}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-7">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-white/5"></span></div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-3 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 font-bold">Or continue with</span>
                    </div>
                </div>

                {/* Google Button */}
                <button onClick={handleGoogleLogin} disabled={loading}
                    className="w-full font-semibold py-3 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-light-text dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10">
                    <GoogleIcon />
                    Sign in with Google
                </button>

                <p className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
                    Don't have an account? <Link to="/register" className="font-bold text-accent dark:text-blue-400 hover:underline">Create one free</Link>
                </p>
            </motion.div>
        </div>
    );
};


export default Login;


