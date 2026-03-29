import React from 'react';
import { motion } from 'framer-motion';

const ProfileCard = ({ children, completion }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="perspective-1000 w-full max-w-4xl mx-auto"
    >
      <motion.div
        whileHover={{ rotateY: 2, rotateX: 2 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="glass-panel p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden preserve-3d"
      >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-3xl -ml-16 -mb-16" />

        {/* Header with Completion Bar */}
        <div className="mb-10 relative z-10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              User Profile
            </h2>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter block mb-1">
                Profile Completion
              </span>
              <span className={`text-sm font-black ${completion === 100 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {completion}%
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-900/50 rounded-full overflow-hidden border border-slate-700/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_10px_rgba(6,182,212,0.5)]`}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 flex flex-col items-center">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileCard;
