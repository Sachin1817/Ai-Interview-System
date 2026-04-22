import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const schema = yup.object({
    email: yup.string().email('Invalid email').required('Email is required'),
}).required();

const ForgotPassword = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await resetPassword(data.email);
            setMessage('Password reset email sent. Please check your inbox.');
        } catch (err) {
            setError('Failed to send reset email. Verify your email address.');
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
                        <div className="inline-flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-slate-900 text-lg shadow-glow-cyan bg-premium-gradient">AI</div>
                            <span className="text-slate-900 dark:text-white font-black text-2xl tracking-tighter uppercase">Interview Pro</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Reset Key</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">We'll send you a secure link to your identifier.</p>
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-3 p-5 rounded-2xl text-sm mb-8 bg-red-500/10 border border-red-500/20 text-red-500 font-bold">
                            <span className="text-lg">⚠️</span> {error}
                        </motion.div>
                    )}

                    {message && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            className="flex items-center gap-3 p-5 rounded-2xl text-sm mb-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold">
                            <span className="text-lg">📧</span> {message}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-[0.2em] mb-3 text-slate-500 dark:text-slate-500 ml-1">Email Identifier</label>
                            <input
                                {...register('email')}
                                className="premium-input"
                                placeholder="name@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-[10px] mt-2 ml-2 font-black uppercase tracking-wider">{errors.email.message}</p>}
                        </div>

                        <button type="submit" disabled={loading} className="premium-button w-full mt-4">
                            {loading ? <div className="w-6 h-6 border-4 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div> : '✦ SEND SECURE LINK'}
                        </button>
                    </form>

                    <div className="text-center mt-12 text-sm font-medium text-slate-500">
                        Remember it? <Link to="/login" className="font-black text-cyan-500 hover:text-cyan-400 transition-colors uppercase tracking-widest ml-1">Go Back</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
