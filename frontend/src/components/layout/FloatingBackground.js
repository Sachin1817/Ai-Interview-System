import React from 'react';
import { motion } from 'framer-motion';

const FloatingBackground = () => {
  const shapes = [
    { size: 400, color: 'rgba(6, 182, 212, 0.15)', top: '-10%', left: '-10%', duration: 25 },
    { size: 450, color: 'rgba(37, 99, 235, 0.15)', bottom: '-15%', right: '-10%', duration: 30 },
    { size: 250, color: 'rgba(147, 51, 234, 0.1)', top: '40%', right: '20%', duration: 20 },
    { size: 300, color: 'rgba(16, 185, 129, 0.1)', bottom: '20%', left: '10%', duration: 35 },
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
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
          transform: 'perspective(1000px) rotateX(60deg) translateY(-100px)',
          transformOrigin: 'top',
        }}
      />
    </div>
  );
};

export default FloatingBackground;
