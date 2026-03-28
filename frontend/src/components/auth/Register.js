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
        <div className="min-h-screen flex items-center justify-center p-4 py-8" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'}}>
            {/* Ambient glows */}
            <div className="fixed top-[-10%] right-[-5%] w-80 h-80 rounded-full opacity-20 pointer-events-none" style={{background: 'radial-gradient(circle, #818cf8, transparent)'}}/>
            <div className="fixed bottom-[-10%] left-[-5%] w-96 h-96 rounded-full opacity-15 pointer-events-none" style={{background: 'radial-gradient(circle, #34d399, transparent)'}}/>

            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45 }}
                className="relative w-full max-w-xl z-10 my-4"
                style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(129, 140, 248, 0.15)',
                    borderRadius: '1.75rem',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                    padding: '2.5rem'
                }}
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 mb-5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-slate-900 text-sm shadow-lg" style={{background: 'linear-gradient(135deg, #34d399, #818cf8)'}}>AI</div>
                        <span className="text-white font-bold text-lg tracking-tight">Interview System</span>
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">Join AI Interviewer</h2>
                    <p className="text-slate-400 text-sm">Start your journey to a dream career today</p>
                </div>

                {/* Error */}
                {error && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-4 rounded-xl text-sm mb-6"
                        style={{background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171'}}>
                        <span>⚠️</span> {error}
                    </motion.div>
                )}

                {/* Success */}
                {success && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 p-4 rounded-xl text-sm mb-6"
                        style={{background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399'}}>
                        <span>📧</span> {success}
                    </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Full Name */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{color: '#94a3b8'}}>Full Name</label>
                        <input {...register('name')} autoComplete="off"
                            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                            style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(129,140,248,0.2)', color: 'white'}}
                            onFocus={e => e.target.style.border = '1px solid rgba(129,140,248,0.6)'}
                            onBlur={e => e.target.style.border = '1px solid rgba(129,140,248,0.2)'}
                            placeholder="John Doe" />
                        {errors.name && <p className="text-red-400 text-[10px] mt-1 ml-1 font-semibold">{errors.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{color: '#94a3b8'}}>Email Address</label>
                        <input {...register('email')} autoComplete="off"
                            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                            style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(129,140,248,0.2)', color: 'white'}}
                            onFocus={e => e.target.style.border = '1px solid rgba(129,140,248,0.6)'}
                            onBlur={e => e.target.style.border = '1px solid rgba(129,140,248,0.2)'}
                            placeholder="name@example.com" />
                        {errors.email && <p className="text-red-400 text-[10px] mt-1 ml-1 font-semibold">{errors.email.message}</p>}
                    </div>

                    {/* Branch */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{color: '#94a3b8'}}>Branch</label>
                        <select {...register('branch')}
                            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all cursor-pointer"
                            style={{background: 'rgba(30,27,74,0.9)', border: '1px solid rgba(129,140,248,0.2)', color: 'white'}}
                            onFocus={e => e.target.style.border = '1px solid rgba(129,140,248,0.6)'}
                            onBlur={e => e.target.style.border = '1px solid rgba(129,140,248,0.2)'}>
                            {branches.map(b => <option key={b} value={b} style={{background: '#1e1b4b'}}>{b}</option>)}
                        </select>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{color: '#94a3b8'}}>Password</label>
                        <input type="password" {...register('password')} autoComplete="new-password"
                            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                            style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(129,140,248,0.2)', color: 'white'}}
                            onFocus={e => e.target.style.border = '1px solid rgba(129,140,248,0.6)'}
                            onBlur={e => e.target.style.border = '1px solid rgba(129,140,248,0.2)'}
                            placeholder="••••••••" />
                        {errors.password && <p className="text-red-400 text-[10px] mt-1 ml-1 font-semibold">{errors.password.message}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{color: '#94a3b8'}}>Confirm Password</label>
                        <input type="password" {...register('confirmPassword')} autoComplete="new-password"
                            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                            style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(129,140,248,0.2)', color: 'white'}}
                            onFocus={e => e.target.style.border = '1px solid rgba(129,140,248,0.6)'}
                            onBlur={e => e.target.style.border = '1px solid rgba(129,140,248,0.2)'}
                            placeholder="••••••••" />
                        {errors.confirmPassword && <p className="text-red-400 text-[10px] mt-1 ml-1 font-semibold">{errors.confirmPassword.message}</p>}
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                        className="md:col-span-2 w-full font-bold py-3.5 rounded-xl text-slate-900 active:scale-95 transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{background: 'linear-gradient(135deg, #34d399, #818cf8)', boxShadow: '0 8px 24px rgba(52,211,153,0.2)'}}>
                        {loading ? <div className="w-5 h-5 border-2 border-slate-700/30 border-t-slate-900 rounded-full animate-spin"></div> : '✦ Create Free Account'}
                    </button>
                </form>

                <p className="text-center mt-8 text-sm" style={{color: '#64748b'}}>
                    Already have an account? <Link to="/login" className="font-bold hover:underline" style={{color: '#818cf8'}}>Log in</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;

