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
        <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'}}>
            {/* Ambient glows */}
            <div className="fixed top-[-10%] left-[-5%] w-80 h-80 rounded-full opacity-20 pointer-events-none" style={{background: 'radial-gradient(circle, #38bdf8, transparent)'}}/>
            <div className="fixed bottom-[-10%] right-[-5%] w-96 h-96 rounded-full opacity-15 pointer-events-none" style={{background: 'radial-gradient(circle, #818cf8, transparent)'}}/>

            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45 }}
                className="relative w-full max-w-md z-10"
                style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(96, 165, 250, 0.15)',
                    borderRadius: '1.75rem',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                    padding: '2.5rem'
                }}
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 mb-5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-slate-900 text-sm shadow-lg" style={{background: 'linear-gradient(135deg, #38bdf8, #818cf8)'}}>AI</div>
                        <span className="text-white font-bold text-lg tracking-tight">Interview System</span>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-400 text-sm">Sign in to continue your AI journey</p>
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
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{color: '#94a3b8'}}>Email Address</label>
                        <input
                            {...register('email')}
                            className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all"
                            style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(96,165,250,0.2)', color: 'white'}}
                            onFocus={e => e.target.style.border = '1px solid rgba(96,165,250,0.6)'}
                            onBlur={e => e.target.style.border = '1px solid rgba(96,165,250,0.2)'}
                            placeholder="name@example.com"
                        />
                        {errors.email && <p className="text-red-400 text-[10px] mt-1 ml-1 font-semibold">{errors.email.message}</p>}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold uppercase tracking-widest" style={{color: '#94a3b8'}}>Password</label>
                            <Link to="/forgot-password" className="text-xs font-bold" style={{color: '#60a5fa'}}>Forgot?</Link>
                        </div>
                        <input
                            type="password"
                            {...register('password')}
                            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                            style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(96,165,250,0.2)', color: 'white'}}
                            onFocus={e => e.target.style.border = '1px solid rgba(96,165,250,0.6)'}
                            onBlur={e => e.target.style.border = '1px solid rgba(96,165,250,0.2)'}
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-red-400 text-[10px] mt-1 ml-1 font-semibold">{errors.password.message}</p>}
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full font-bold py-3.5 rounded-xl text-slate-900 active:scale-95 transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{background: 'linear-gradient(135deg, #38bdf8, #818cf8)', boxShadow: '0 8px 24px rgba(56,189,248,0.25)'}}>
                        {loading ? <div className="w-5 h-5 border-2 border-slate-700/30 border-t-slate-900 rounded-full animate-spin"></div> : '✦ Sign In'}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-7">
                    <div className="absolute inset-0 flex items-center"><span className="w-full" style={{borderTop: '1px solid rgba(255,255,255,0.08)'}}></span></div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="px-3 text-slate-500 font-medium" style={{background: 'rgba(15,23,42,0.75)'}}>Or continue with</span>
                    </div>
                </div>

                {/* Google Button */}
                <button onClick={handleGoogleLogin} disabled={loading}
                    className="w-full font-semibold py-3 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                    style={{background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0'}}>
                    <GoogleIcon />
                    Sign in with Google
                </button>

                <p className="text-center mt-8 text-sm" style={{color: '#64748b'}}>
                    Don't have an account? <Link to="/register" className="font-bold hover:underline" style={{color: '#60a5fa'}}>Create one free</Link>
                </p>
            </motion.div>
        </div>
    );
};


export default Login;


