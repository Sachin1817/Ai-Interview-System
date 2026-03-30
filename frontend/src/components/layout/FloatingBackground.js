import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const FloatingBackground = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const shapes = [
    { size: 400, color: isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(37, 99, 235, 0.05)', top: '-10%', left: '-10%', duration: 25 },
    { size: 450, color: isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(99, 102, 241, 0.05)', bottom: '-15%', right: '-10%', duration: 30 },
    { size: 250, color: isDark ? 'rgba(147, 51, 234, 0.1)' : 'rgba(168, 85, 247, 0.05)', top: '40%', right: '20%', duration: 20 },
    { size: 300, color: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)', bottom: '20%', left: '10%', duration: 35 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
            rotate: [0, 45, -45, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            width: shape.size,
            height: shape.size,
            backgroundColor: shape.color,
            borderRadius: '50%',
            filter: 'blur(100px)',
            top: shape.top,
            left: shape.left,
            right: shape.right,
            bottom: shape.bottom,
          }}
        />
      ))}
      
      {/* 3D Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03] grayscale dark:grayscale-0"
        style={{
          backgroundImage: isDark 
            ? `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`
            : `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
          transform: 'perspective(1000px) rotateX(60deg) translateY(-100px)',
          transformOrigin: 'top',
        }}
      />
    </div>
  );
};

export default FloatingBackground;
