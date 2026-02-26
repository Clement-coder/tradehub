'use client';

export function FuturisticLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-[oklch(0.65_0.15_260)] border-r-[oklch(0.72_0.12_140)] animate-spin"></div>
        
        {/* Middle rotating ring */}
        <div className="absolute inset-2 w-20 h-20 rounded-full border-4 border-transparent border-b-[oklch(0.68_0.14_180)] border-l-[oklch(0.6_0.14_180)] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-6 w-12 h-12 rounded-full bg-gradient-to-br from-[oklch(0.65_0.15_260)] to-[oklch(0.72_0.12_140)] animate-pulse"></div>
        
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-white"></div>
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-[oklch(0.65_0.15_260)] opacity-20 blur-xl animate-pulse"></div>
      </div>
      
      <p className="absolute mt-40 text-muted-foreground text-sm animate-pulse">Loading...</p>
    </div>
  );
}
