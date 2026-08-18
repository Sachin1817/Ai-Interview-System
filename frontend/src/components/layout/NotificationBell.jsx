import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Briefcase, Info, AlertTriangle, CheckCircle, ExternalLink, Calendar } from 'lucide-react';
import api from '../../services/api';

const typeConfig = {
    success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Success' },
    warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Alert' },
    error: { icon: X, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Urgent' },
    info: { icon: Info, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', label: 'Notification' },
};

function parseSafeDate(isoStr) {
    if (!isoStr) return new Date();
    let str = isoStr;
    if (typeof str === 'string' && !str.endsWith('Z') && !str.includes('+')) {
        str += 'Z';
    }
    return new Date(str);
}

function timeAgo(isoStr) {
    if (!isoStr) return 'Just now';
    const date = parseSafeDate(isoStr);
    const diff = Math.max(0, Date.now() - date.getTime());
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

function formatExactDate(isoStr) {
    if (!isoStr) return '';
    const date = parseSafeDate(isoStr);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [selectedNotif, setSelectedNotif] = useState(null);
    const panelRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const { data } = await api.get('/notifications/');
            setNotifications(data.notifications || []);
            setUnread(data.unread_count || 0);
        } catch {
            // Silently fail if not logged in
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // poll every 30s
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close on outside click
    useEffect(() => {
        const handler = e => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markRead = async (id) => {
        await api.put(`/notifications/${id}/read`).catch(() => {});
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        setUnread(prev => Math.max(prev - 1, 0));
    };

    const markAllRead = async () => {
        await api.put('/notifications/read-all').catch(() => {});
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnread(0);
    };

    const handleOpenNotifDetail = (notif) => {
        setSelectedNotif(notif);
        if (!notif.read) {
            markRead(notif._id);
        }
    };

    const dismiss = async (e, id) => {
        e.stopPropagation();
        await api.delete(`/notifications/${id}`).catch(() => {});
        setNotifications(prev => prev.filter(n => n._id !== id));
        if (selectedNotif?._id === id) setSelectedNotif(null);
        setUnread(prev => {
            const removed = notifications.find(n => n._id === id);
            return removed && !removed.read ? Math.max(prev - 1, 0) : prev;
        });
    };

    return (
        <>
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
                className="relative p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all"
                title="Notifications"
            >
                <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                {unread > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-cyan-500 text-slate-950 text-[10px] font-black rounded-full shadow-lg shadow-cyan-500/40"
                    >
                        {unread > 9 ? '9+' : unread}
                    </motion.span>
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        className="absolute right-0 mt-3 w-84 bg-slate-950 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-[200] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm font-black text-white">Notifications</span>
                                {unread > 0 && (
                                    <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-black border border-cyan-500/20">
                                        {unread} new
                                    </span>
                                )}
                            </div>
                            {unread > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" /> All read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-3">
                                    <Briefcase className="w-8 h-8 text-slate-700" />
                                    <p className="text-slate-600 text-xs font-bold">No notifications yet</p>
                                </div>
                            ) : (
                                notifications.map(n => {
                                    const cfg = typeConfig[n.type] || typeConfig.info;
                                    const Icon = cfg.icon;
                                    return (
                                        <div
                                            key={n._id}
                                            onClick={() => handleOpenNotifDetail(n)}
                                            className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!n.read ? 'bg-cyan-500/[0.03]' : ''}`}
                                        >
                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg} border ${cfg.border}`}>
                                                <Icon className={`w-4 h-4 ${cfg.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs leading-snug line-clamp-2 ${n.read ? 'text-slate-400' : 'text-white font-semibold'}`}>
                                                    {n.message.split('\n')[0]}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-cyan-400 font-bold">{timeAgo(n.created_at)}</span>
                                                    <span className="text-[9px] text-slate-500">· Click to preview</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {!n.read && <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />}
                                                <button
                                                    onClick={e => dismiss(e, n._id)}
                                                    className="p-1 rounded hover:bg-white/10 transition-colors"
                                                    title="Dismiss"
                                                >
                                                    <X className="w-3 h-3 text-slate-600 hover:text-slate-300" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* NOTIFICATION PREVIEW MODAL — Teleported to document.body to prevent parent navbar clipping */}
        {typeof document !== 'undefined' && createPortal(
            <AnimatePresence>
                {selectedNotif && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0F1728] border border-[#1E293B] p-7 rounded-[2rem] w-full max-w-lg shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar"
                        >
                            <button
                                onClick={() => setSelectedNotif(null)}
                                className="absolute top-6 right-6 text-slate-500 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3.5 mb-6">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${typeConfig[selectedNotif.type]?.bg || 'bg-cyan-500/10'} border ${typeConfig[selectedNotif.type]?.border || 'border-cyan-500/20'}`}>
                                    {React.createElement(typeConfig[selectedNotif.type]?.icon || Info, {
                                        className: `w-5 h-5 ${typeConfig[selectedNotif.type]?.color || 'text-cyan-400'}`
                                    })}
                                </div>
                                <div>
                                    <span className="inline-block text-[9px] font-black uppercase tracking-widest text-cyan-400">
                                        {typeConfig[selectedNotif.type]?.label || 'NOTIFICATION'}
                                    </span>
                                    <h3 className="text-lg font-black text-white leading-tight">Notification Details</h3>
                                </div>
                            </div>

                            <div className="bg-[#060B16] border border-[#1E293B] rounded-2xl p-5 mb-6 space-y-4 shadow-inner">
                                <div className="text-sm font-medium text-slate-200 leading-relaxed whitespace-pre-line">
                                    {selectedNotif.message}
                                </div>

                                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-cyan-400" />
                                        <span>{formatExactDate(selectedNotif.created_at)}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                                        {timeAgo(selectedNotif.created_at)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setSelectedNotif(null)}
                                    className="px-7 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>,
            document.body
        )}
        </>
    );
};

export default NotificationBell;


