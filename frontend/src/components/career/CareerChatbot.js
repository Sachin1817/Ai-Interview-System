import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Loader2, Sparkles, User, Bot } from 'lucide-react';
import api from '../../services/api';

const CareerChatbot = ({ context, isInline = false }) => {
    const [isOpen, setIsOpen] = useState(isInline); // Always open if inline
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'assistant', content: "Hi! I'm your AI Career Coach. How can I help you today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, isOpen]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMsg = message.trim();
        const currentHistory = [...chatHistory]; // Take snapshot for backend
        setMessage('');
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await api.post('/career/chat', {
                message: userMsg,
                history: currentHistory, // Send previous turns
                userSkills: context?.skills || [],
                predictedRole: context?.role || '',
                hiringLevel: context?.hiringLevel || 'Entry Level',
                branch: context?.branch || 'General'
            });

            setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        } catch (error) {
            console.error("Chat error:", error);
            setChatHistory(prev => [...prev, { 
                role: 'assistant', 
                content: "Assistant is temporarily unavailable. Please try again." 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const ChatContainer = ({ children }) => {
        if (isInline) {
            return (
                <div className="glass-panel rounded-[2rem] border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.4)] flex flex-col h-[750px] overflow-hidden bg-slate-900/40 backdrop-blur-3xl group transition-all duration-500 hover:shadow-cyan-500/10">
                    {children}
                </div>
            );
        }
        return (
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="absolute bottom-24 right-0 w-[calc(100vw-2rem)] md:w-[600px] h-[calc(100vh-10rem)] md:h-[750px] max-h-[85vh] glass-panel rounded-[2.5rem] border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden bg-slate-950/90 backdrop-blur-3xl z-[1000]"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    return (
        <div 
            className={`${isInline ? 'w-full px-4' : 'fixed bottom-6 right-6 z-[999999] font-sans flex flex-col items-end'}`}
            onClick={(e) => e.stopPropagation()}
        >

            <ChatContainer>
                {/* Header */}
                <div 
                    className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between cursor-default"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                            <Sparkles className="w-4 h-4 text-slate-950" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-tight">AI Career Coach</h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">Active</span>
                            </div>
                        </div>
                    </div>
                    {!isInline && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                            className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all shadow-inner"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Chat History */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-950/20"
                    onClick={(e) => e.stopPropagation()}
                >
                    {chatHistory.map((chat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[85%] ${chat.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${chat.role === 'user' ? 'bg-cyan-500/20 border-cyan-500/30' : 'bg-slate-800 border-white/5'}`}>
                                    {chat.role === 'user' ? <User className="w-4 h-4 text-cyan-400" /> : <Bot className="w-4 h-4 text-slate-300" />}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${chat.role === 'user' ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white rounded-tr-none border border-cyan-500/30' : 'bg-slate-800/80 text-slate-200 border border-white/5 rounded-tl-none'}`}>
                                    {chat.content}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 text-slate-400 border border-white/5 flex items-center gap-3">
                                    <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                                    <span className="text-xs italic font-medium">Analyzing your career path...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <form 
                    onSubmit={handleSend}
                    className="p-5 border-t border-white/5 bg-slate-900/80 backdrop-blur-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative group">
                        <input 
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            placeholder="Ask about internships, roles..."
                            autoComplete="off"
                            autoFocus
                            className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all font-medium relative z-[10]"
                        />
                        <button 
                            type="submit"
                            disabled={!message.trim() || isLoading}
                            className="absolute right-2 top-2 bottom-2 px-4 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl text-slate-950 font-black disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center shadow-lg shadow-cyan-500/20"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </ChatContainer>

            {/* Toggle Button (Floating Mode Only) */}
            {!isInline && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`p-5 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] transition-all flex items-center justify-center relative ${isOpen ? 'bg-slate-800 text-white' : 'bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950'}`}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                    {!isOpen && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-slate-950"></span>
                        </span>
                    )}
                </motion.button>
            )}
        </div>
    );
};

export default CareerChatbot;
