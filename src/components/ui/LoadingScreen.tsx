"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({
  message = "Sintonizando tu espacio...",
  submessage = "Studio Flamkit & Art • Experiencia Cinematográfica",
  fullScreen = true
}: LoadingScreenProps) {
  // Relaxing pulsing wave delays
  const ripples = [0, 1.2, 2.4];

  return (
    <div 
      className={`
        flex flex-col items-center justify-center text-ink p-6 overflow-hidden select-none z-50
        ${fullScreen ? 'fixed inset-0 bg-surface/75 backdrop-blur-xl w-screen h-screen' : 'relative w-full h-full py-16 bg-surface/40 backdrop-blur-md rounded-3xl'}
      `}
    >
      {/* Background soft ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Ripple Animation Area */}
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Animated concentric sound/water ripples */}
        {ripples.map((delay, index) => (
          <motion.div
            key={index}
            className="absolute rounded-full border border-accent/20 bg-accent/[0.01]"
            initial={{ width: 40, height: 40, opacity: 0.8 }}
            animate={{ 
              width: 240, 
              height: 240, 
              opacity: 0,
              borderWidth: ["1px", "1px", "0px"]
            }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              delay: delay,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Center glowing element */}
        <motion.div 
          className="relative flex items-center justify-center w-16 h-16 rounded-full bg-surface-elevated border border-edge shadow-lg shadow-black/5 z-10"
          animate={{
            scale: [1, 1.08, 1],
            boxShadow: [
              "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
              "0 10px 25px -4px var(--color-accent, rgba(220, 150, 40, 0.15))",
              "0 4px 20px -2px rgba(0, 0, 0, 0.05)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-6 w-6 text-accent" />
          </motion.div>
        </motion.div>
      </div>

      {/* Text block with subtle fade-up and breathing */}
      <div className="relative z-10 text-center max-w-sm mt-6">
        <motion.p 
          className="font-serif text-lg font-medium tracking-wide text-ink"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {message}
        </motion.p>
        
        {submessage && (
          <motion.p 
            className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted leading-relaxed"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            {submessage}
          </motion.p>
        )}
      </div>

      {/* Decorative tiny ambient particle */}
      <motion.div 
        className="absolute w-1.5 h-1.5 rounded-full bg-accent/40"
        animate={{
          y: [-20, 20, -20],
          x: [-15, 15, -15],
          opacity: [0.2, 0.6, 0.2]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ top: '40%', left: '35%' }}
      />
      <motion.div 
        className="absolute w-1 h-1 rounded-full bg-accent/30"
        animate={{
          y: [25, -25, 25],
          x: [20, -20, 20],
          opacity: [0.1, 0.5, 0.1]
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ bottom: '45%', right: '38%' }}
      />
    </div>
  );
}
