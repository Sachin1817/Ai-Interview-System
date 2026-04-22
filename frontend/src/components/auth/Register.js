import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';

const schema = yup.object({
    name: yup.string().required('Full name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
    branch: yup.string().required('Branch is required'),
}).required();

const branches = [
    'CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical', 'Aerospace'
];

const Register = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { branch: 'CSE' }
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, sendVerification } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            // 1. Firebase Signup
            const userCredential = await signup(data.email, data.password);
            
            // 2. Send Verification Email
            await sendVerification();
            setSuccess('Verification email sent! Please check your inbox before logging in.');

            // 3. Backend Sync (Optional)
            try {
                await authAPI.register({
                    name: data.name,
                    email: data.email,
                    branch: data.branch,
                    firebaseUid: userCredential.user.uid
                });
            } catch (backendErr) {
                console.warn("Backend sync failed, but user created in Firebase", backendErr);
            }

            // Don't auto-redirect, let them read the success message
            setTimeout(() => {
                if (!error) navigate('/login');
            }, 5000);
            
        } catch (err) {
            console.error("Registration error:", err);
            let msg = 'Registration failed. Try again.';
            if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered.';
            else if (err.code === 'auth/weak-password') msg = 'Password is too weak.';
            else if (err.code === 'auth/operation-not-allowed') msg = 'Email/Password sign-in is disabled in Firebase console.';
            else if (err.code) msg = `Error (${err.code}): ${err.message}`;
            else msg = err.message || 'An unknown error occurred.';
            setError(msg);
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
                className="relative w-full max-w-3xl z-10"
            >
                <div className="glass-panel p-12 rounded-[3.5rem] border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-slate-900 text-lg shadow-glow-cyan bg-premium-gradient">AI</div>
                            <span className="text-slate-900 dark:text-white font-black text-2xl tracking-tighter uppercase">Interview Pro</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Create Profile</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Join the next generation of placement prep.</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-3 p-5 rounded-2xl text-sm mb-8 bg-red-500/10 border border-red-500/20 text-red-500 font-bold">
                            <span className="text-lg">⚠️</span> {error}
                        </motion.div>
                    )}

                    {/* Success */}
                    {success && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-3 p-5 rounded-2xl text-sm mb-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold">
                            <span className="text-lg">📧</span> {success}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black uppercase tracking-[0.2em] mb-3 text-slate-500 dark:text-slate-500 ml-1">Full Name</label>
                                <input {...register('name')} className="premium-input" placeholder="e.g. Alex Johnson" />
                                {errors.name && <p className="text-red-500 text-[10px] mt-2 ml-2 font-black uppercase tracking-wider">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-[0.2em] mb-3 text-slate-500 dark:text-slate-500 ml-1">Email Identifier</label>
                                <input {...register('email')} className="premium-input" placeholder="alex@carrier.ai" />
                                {errors.email && <p className="text-red-500 text-[10px] mt-2 ml-2 font-black uppercase tracking-wider">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-[0.2em] mb-3 text-slate-500 dark:text-slate-500 ml-1">Specialization</label>
                                <select {...register('branch')} className="premium-input appearance-none cursor-pointer">
                                    {branches.map(b => (
                                        <option key={b} value={b} className="bg-slate-900">{b}</option>
                                    ))}
                                </select>
                                {errors.branch && <p className="text-red-500 text-[10px] mt-2 ml-2 font-black uppercase tracking-wider">{errors.branch.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-[0.2em] mb-3 text-slate-500 dark:text-slate-500 ml-1">Security Key</label>
                                <input type="password" {...register('password')} className="premium-input" placeholder="••••••••" />
                                {errors.password && <p className="text-red-500 text-[10px] mt-2 ml-2 font-black uppercase tracking-wider">{errors.password.message}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-[0.2em] mb-3 text-slate-500 dark:text-slate-500 ml-1">Confirm Key</label>
                                <input type="password" {...register('confirmPassword')} className="premium-input" placeholder="••••••••" />
                                {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-2 ml-2 font-black uppercase tracking-wider">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="premium-button w-full mt-4">
                            {loading ? <div className="w-6 h-6 border-4 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div> : '✦ ESTABLISH ACCOUNT'}
                        </button>
                    </form>

                    <p className="text-center mt-12 text-sm font-medium text-slate-500">
                        Already registered? <Link to="/login" className="font-black text-cyan-500 hover:text-cyan-400 transition-colors uppercase tracking-widest ml-1">Sign In</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
