import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, X, ChevronDown, CheckCircle, Send, Download, Mail, UserCheck, Trash2 } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'shortlisted', label: 'Shortlist Selected', color: 'text-cyan-400' },
    { value: 'interview_scheduled', label: 'Schedule Interview', color: 'text-purple-400' },
    { value: 'hired', label: 'Mark as Hired / Selected', color: 'text-emerald-400' },
    { value: 'rejected', label: 'Reject Selected', color: 'text-rose-400' },
];

const BulkActionBar = ({
    selectedCount,
    type = 'candidates', // 'candidates' | 'applications'
    onClearSelection,
    onBulkStatusUpdate,
    onBulkAssign,
    onBulkEmail,
    onExportSelected
}) => {
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

    if (selectedCount === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#0F1728]/95 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-4 shadow-2xl shadow-cyan-500/10 flex items-center gap-4 max-w-3xl w-full mx-auto"
            >
                {/* Count Badge */}
                <div className="flex items-center gap-2.5 pl-2">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <CheckSquare className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="text-xs font-black text-white uppercase tracking-wider">
                            {selectedCount} {type === 'candidates' ? 'Candidates' : 'Applications'}
                        </span>
                        <p className="text-[9px] text-slate-400">Selected for batch action</p>
                    </div>
                </div>

                <div className="w-px h-8 bg-white/10 mx-1" />

                {/* Actions */}
                <div className="flex items-center gap-2.5 flex-grow justify-end flex-wrap">
                    {/* Send Bulk Email Button */}
                    {onBulkEmail && (
                        <button
                            onClick={onBulkEmail}
                            className="px-3.5 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-xs font-black text-purple-300 hover:text-white uppercase tracking-wider flex items-center gap-1.5 transition-all"
                            title="Send Custom Bulk Email"
                        >
                            <Mail className="w-3.5 h-3.5 text-purple-400" />
                            <span>Send Email</span>
                        </button>
                    )}

                    {/* Status Dropdown for Applications */}
                    {type === 'applications' && onBulkStatusUpdate && (
                        <div className="relative">
                            <button
                                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                                className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-cyan-400 transition-all"
                            >
                                Update Status <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {statusDropdownOpen && (
                                <div className="absolute bottom-full mb-2 right-0 w-52 bg-[#0C1422] border border-[#1E293B] rounded-2xl p-2 shadow-2xl space-y-1">
                                    {STATUS_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => {
                                                onBulkStatusUpdate(opt.value);
                                                setStatusDropdownOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 flex items-center justify-between"
                                        >
                                            <span>{opt.label}</span>
                                            <span className={`text-[10px] font-mono ${opt.color}`}>●</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bulk Assign for Candidates */}
                    {type === 'candidates' && onBulkAssign && (
                        <button
                            onClick={onBulkAssign}
                            className="px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-cyan-400 transition-all"
                        >
                            <Send className="w-3.5 h-3.5" /> Bulk Assign Task
                        </button>
                    )}

                    {/* Export Selected */}
                    {onExportSelected && (
                        <button
                            onClick={onExportSelected}
                            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white uppercase tracking-wider flex items-center gap-1.5 transition-all"
                            title="Export Selected"
                        >
                            <Download className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                    )}

                    {/* Clear selection */}
                    <button
                        onClick={onClearSelection}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        title="Clear selection"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BulkActionBar;

