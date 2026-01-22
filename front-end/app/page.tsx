'use client';

import Link from 'next/link';
import { TrendingUp, ArrowRight, Wallet, BarChart3, Lock, Menu, X } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu on scroll
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [scrollY]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10 relative overflow-hidden">
      {/* Optimized Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Mouse follower gradient - hidden on mobile for performance */}
        <div 
          className="hidden md:block absolute w-96 h-96 bg-gradient-radial from-primary/8 via-primary/3 to-transparent rounded-full blur-3xl transition-all duration-500 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
        
        {/* Optimized floating orbs with better opacity */}
        <div className="absolute top-10 md:top-20 left-10 md:left-20 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-r from-primary/15 to-primary/8 rounded-full blur-2xl animate-pulse" style={{animationDuration: '4s'}} />
        <div className="absolute top-20 md:top-40 right-16 md:right-32 w-20 md:w-24 h-20 md:h-24 bg-gradient-to-r from-accent/15 to-accent/8 rounded-full blur-2xl animate-pulse" style={{animationDuration: '3s', animationDelay: '1s'}} />
        <div className="absolute bottom-40 left-1/4 w-32 md:w-40 h-32 md:h-40 bg-gradient-to-r from-chart-2/15 to-chart-2/8 rounded-full blur-3xl animate-pulse" style={{animationDuration: '5s', animationDelay: '2s'}} />
        
        {/* Simplified grid for better performance */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full" 
            style={{
              backgroundImage: 'linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}
          />
        </div>
      </div>

      {/* Responsive Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/90 dark:bg-background/90 border-b border-border/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xl md:text-2xl font-bold text-primary">TradeHub</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              <Link
                href="/auth"
                className="px-4 lg:px-6 py-2 lg:py-2.5 rounded-xl font-medium text-sm lg:text-base text-foreground hover:bg-muted/80 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/auth"
                className="px-4 lg:px-6 py-2 lg:py-2.5 rounded-xl font-medium text-sm lg:text-base text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted/80 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              mobileMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="py-4 space-y-3 border-t border-border/40">
              <Link
                href="/auth"
                className="block w-full px-4 py-2.5 rounded-xl font-medium text-center text-foreground hover:bg-muted/80 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/auth"
                className="block w-full px-4 py-2.5 rounded-xl font-medium text-center text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-16 md:pb-32 relative z-10">
        {/* Floating Price Tickers - Optimized for mobile */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          <div 
            className="absolute animate-float"
            style={{
              top: '10%',
              left: '5%',
              transform: `translateY(${scrollY * 0.1}px)`,
              animationDelay: '0s'
            }}
          >
            <div className="bg-gradient-to-r from-accent/25 to-accent/15 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-mono text-accent border border-accent/40 shadow-lg shadow-accent/20">
              BTC $67,420 +2.4%
            </div>
          </div>
          
          <div 
            className="absolute animate-float"
            style={{
              top: '20%',
              right: '10%',
              transform: `translateY(${scrollY * 0.15}px)`,
              animationDelay: '1s'
            }}
          >
            <div className="bg-gradient-to-r from-chart-2/25 to-chart-2/15 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-mono text-chart-2 border border-chart-2/40 shadow-lg shadow-chart-2/20">
              ETH $3,240 +5.1%
            </div>
          </div>
          
          <div 
            className="absolute animate-float"
            style={{
              top: '35%',
              left: '15%',
              transform: `translateY(${scrollY * 0.08}px)`,
              animationDelay: '2s'
            }}
          >
            <div className="bg-gradient-to-r from-primary/25 to-primary/15 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-mono text-primary border border-primary/40 shadow-lg shadow-primary/20">
              SOL $98.50 +8.2%
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="text-center mb-12 md:mb-20 relative z-10">
          {/* Live Demo Badge */}
          <div className="inline-flex items-center gap-2 md:gap-3 mb-6 md:mb-8 px-4 md:px-8 py-3 md:py-4 rounded-full bg-gradient-to-r from-primary/15 via-accent/15 to-chart-2/15 border border-primary/25 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-accent animate-pulse shadow-lg shadow-accent/50"></div>
              <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" style={{animationDelay: '0.5s'}}></div>
              <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-chart-2 animate-pulse shadow-lg shadow-chart-2/50" style={{animationDelay: '1s'}}></div>
            </div>
            <span className="text-sm md:text-lg font-semibold text-primary">Live Demo Trading Platform</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-accent animate-pulse shadow-lg shadow-accent/50"></div>
              <span className="text-xs md:text-sm font-mono text-accent">LIVE</span>
            </div>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 md:mb-8 leading-tight relative px-4">
            <span className="text-foreground">
              Master Trading
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-chart-2 bg-clip-text text-transparent">
              Risk-Free
            </span>
            {/* Animated underlines */}
            <div className="absolute -bottom-3 md:-bottom-4 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 md:w-40 lg:w-48 h-1.5 md:h-2 bg-gradient-to-r from-primary via-accent to-chart-2 rounded-full animate-pulse shadow-lg"></div>
            <div className="absolute -bottom-1.5 md:-bottom-2 left-1/2 transform -translate-x-1/2 w-16 sm:w-20 md:w-24 lg:w-32 h-0.5 md:h-1 bg-gradient-to-r from-foreground/50 to-transparent rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </h1>
          
          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-16 leading-relaxed px-4">
            Experience <span className="text-primary font-semibold">professional-grade trading</span> with real market dynamics. 
            Practice strategies, analyze charts, and build confidence—all with <span className="text-accent font-semibold">simulated funds</span> in a stunning interface.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 lg:gap-6 justify-center mb-10 md:mb-16 lg:mb-20 px-4">
            <Link
              href="/auth"
              className="group relative inline-flex items-center justify-center gap-2 md:gap-3 px-6 sm:px-8 lg:px-10 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base text-primary-foreground bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <TrendingUp className="w-4 md:w-5 h-4 md:h-5" />
              <span>Start Trading Now</span>
              <ArrowRight className="w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 lg:px-10 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base text-foreground bg-card border border-border hover:bg-muted/50 transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
          
          {/* Live Stats - Responsive Grid */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 lg:gap-8 text-xs md:text-sm font-mono px-4">
            <div className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-accent/25 to-accent/15 border border-accent/40">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-lg shadow-accent/50"></div>
              <span className="text-accent">Market Open</span>
            </div>
            <div className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-chart-2/25 to-chart-2/15 border border-chart-2/40">
              <div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse shadow-lg shadow-chart-2/50" style={{animationDelay: '0.5s'}}></div>
              <span className="text-chart-2">Real-time Data</span>
            </div>
            <div className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-primary/25 to-primary/15 border border-primary/40">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" style={{animationDelay: '1s'}}></div>
              <span className="text-primary">Zero Risk</span>
            </div>
          </div>
        </div>

        {/* Features Grid - Fully Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 relative px-4">
          <GlassCard className="group p-6 md:p-8 hover:scale-105 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-4 md:mb-6 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/25 to-primary/15 flex items-center justify-center group-hover:from-primary/35 group-hover:to-primary/20 transition-all relative">
                <Wallet className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-lg md:text-xl mb-2 md:mb-3 text-foreground">Instant Setup</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Get <span className="text-accent font-semibold">$10,000</span> in demo funds instantly. No registration hassles, start trading immediately.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="group p-6 md:p-8 hover:scale-105 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-4 md:mb-6 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-accent/25 to-accent/15 flex items-center justify-center group-hover:from-accent/35 group-hover:to-accent/20 transition-all relative">
                <BarChart3 className="w-6 h-6 md:w-7 md:h-7 text-accent group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-lg md:text-xl mb-2 md:mb-3 text-foreground">Live Charts</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Professional trading charts with <span className="text-accent font-semibold">real-time</span> price simulation and technical indicators.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="group p-6 md:p-8 hover:scale-105 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-2/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-4 md:mb-6 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-chart-2/25 to-chart-2/15 flex items-center justify-center group-hover:from-chart-2/35 group-hover:to-chart-2/20 transition-all relative">
                <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-chart-2 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-lg md:text-xl mb-2 md:mb-3 text-foreground">Real-Time P&L</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Track your performance with detailed analytics and <span className="text-chart-2 font-semibold">live</span> profit/loss calculations.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="group p-6 md:p-8 hover:scale-105 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-4/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-4 md:mb-6 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-chart-4/25 to-chart-4/15 flex items-center justify-center group-hover:from-chart-4/35 group-hover:to-chart-4/20 transition-all relative">
                <Lock className="w-6 h-6 md:w-7 md:h-7 text-chart-4 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-lg md:text-xl mb-2 md:mb-3 text-foreground">100% Safe</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Completely <span className="text-chart-4 font-semibold">risk-free</span> environment. Learn and practice without any financial exposure.
              </p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <GlassCard className="p-8 md:p-12 lg:p-16 xl:p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/8 to-chart-2/8 animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">Ready to Start Trading?</h2>
            <p className="text-muted-foreground mb-8 md:mb-12 text-sm md:text-base lg:text-lg">Join thousands learning to trade with our platform</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary animate-pulse">$10K</div>
                <p className="text-muted-foreground font-medium text-sm md:text-base">Starting Balance</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-accent animate-pulse" style={{animationDelay: '0.5s'}}>24/7</div>
                <p className="text-muted-foreground font-medium text-sm md:text-base">Market Access</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-chart-2 animate-pulse" style={{animationDelay: '1s'}}>0%</div>
                <p className="text-muted-foreground font-medium text-sm md:text-base">Real Risk</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 text-lg md:text-xl font-bold text-primary">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
              TradeHub
            </div>
            <p className="text-muted-foreground text-center text-xs md:text-sm">
              © 2024 TradeHub. Demo trading platform for educational purposes.
            </p>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}