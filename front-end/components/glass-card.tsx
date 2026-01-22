'use client';

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl bg-white/70 dark:bg-white/10 
        backdrop-blur-lg border border-white/20 dark:border-white/10
        shadow-md hover:shadow-lg transition-all duration-300
        ${onClick ? 'cursor-pointer hover:bg-white/80 dark:hover:bg-white/15' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default GlassCard;
