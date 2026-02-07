'use client';

import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, ArrowRight, Wallet, BarChart3, Lock, Sparkles, Menu, X, Home, BookOpen, Mail } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export default function LandingPage() {
  const { authenticated, ready } = usePrivy();
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
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-blue-700/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <Image 
                src="/tradeHub_logo.PNG" 
                alt="TradeHub Logo" 
                width={48} 
                height={48} 
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 group-hover:scale-110 transition-transform duration-300" 
              />
              <span className="font-bold text-base sm:text-lg md:text-xl text-blue-600 dark:text-blue-400">TradeHub</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-orange-500/10 border border-orange-500/30 text-orange-600 hover:from-orange-500/30 hover:to-orange-500/20 transition-all duration-200 font-medium backdrop-blur-sm">
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link href="/how-it-works" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-500/10 border border-blue-500/30 text-blue-600 hover:from-blue-500/30 hover:to-blue-500/20 transition-all duration-200 font-medium backdrop-blur-sm">
                <BookOpen className="w-4 h-4" />
                How It Works
              </Link>
              <Link
                href={authenticated ? "/dashboard" : "/auth"}
                className="ml-2 group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm md:text-base text-primary-foreground bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {authenticated ? "Dashboard" : "Get Started"}
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

          <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="py-4 space-y-2 border-t border-border/40">
              <Link href="/" className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-orange-500/10 border border-orange-500/30 text-black transition-all" onClick={() => setMobileMenuOpen(false)}>
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link href="/how-it-works" className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-500/10 border border-blue-500/30 text-black transition-all" onClick={() => setMobileMenuOpen(false)}>
                <BookOpen className="w-4 h-4" />
                How It Works
              </Link>
              <Link
                href={authenticated ? "/dashboard" : "/auth"}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-primary-foreground bg-gradient-to-r from-primary to-primary/80 w-full mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {authenticated ? "Dashboard" : "Get Started"}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 md:pt-20 pb-16 md:pb-32 pb-4 relative z-10">
        <div className="w-full bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: 'url(/background_image.jpeg)'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-slate-900/70 to-background/90"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-8 md:pb-12">
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
            <div className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-mono text-white border border-white/30 shadow-lg shadow-white/20">
              BTC $67,420 +2.4%
            </div>
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
            <div className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-mono text-white border border-white/30 shadow-lg shadow-white/20">
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
            <div className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-mono text-white border border-white/30 shadow-lg shadow-white/20">
              SOL $98.50 +8.2%
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="text-center mb-12 md:mb-20 relative z-10">
          {/* Live Trading Platform */}
          <div className="inline-flex items-center gap-2 md:gap-3 mb-6 md:mb-8 px-4 md:px-8 py-3 md:py-4 rounded-full bg-gradient-to-r from-white/15 via-white/10 to-white/15 border border-white/25 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-orange-400 animate-pulse shadow-lg shadow-orange-400/50"></div>
              <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50" style={{animationDelay: '0.5s'}}></div>
              <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" style={{animationDelay: '1s'}}></div>
            </div>
            <span className="text-sm md:text-lg font-semibold text-white">Live Trading Platform</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-xs md:text-sm font-mono text-green-400">LIVE</span>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 md:mb-8 leading-tight relative px-4">
            <span className="text-white">
              Master Trading
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-300 via-blue-300 to-green-300 bg-clip-text text-transparent">
              Risk-Free
            </span>
            {/* Animated underlines */}
            <div className="absolute -bottom-3 md:-bottom-4 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 md:w-40 lg:w-48 h-1.5 md:h-2 bg-gradient-to-r from-primary via-accent to-chart-2 rounded-full animate-pulse shadow-lg"></div>
            <div className="absolute -bottom-1.5 md:-bottom-2 left-1/2 transform -translate-x-1/2 w-16 sm:w-20 md:w-24 lg:w-32 h-0.5 md:h-1 bg-gradient-to-r from-foreground/50 to-transparent rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </h1>
          
          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-16 leading-relaxed px-4">
            Experience <span className="text-orange-300 font-semibold">professional-grade trading</span> with real market dynamics. 
            Practice strategies, analyze charts, and build confidence all with <span className="text-green-300 font-semibold">real funds</span> in a stunning interface.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 lg:gap-6 justify-center mb-10 md:mb-16 lg:mb-20 px-4">
            <Link
              href={authenticated ? "/dashboard" : "/auth"}
              className="group relative inline-flex items-center justify-center gap-2 md:gap-3 px-6 sm:px-8 lg:px-10 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base text-primary-foreground bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <TrendingUp className="w-4 md:w-5 h-4 md:h-5" />
              <span>{authenticated ? "Go to Dashboard" : "Start Trading Now"}</span>
              <ArrowRight className="w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/how-it-works"
              className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-white/20 to-white/10 border border-white/30 backdrop-blur-sm"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-lg shadow-white/50" style={{animationDelay: '0.5s'}}></div>
              <span className="text-white">Learn More</span>
            </Link>
          </div>
          
          {/* Live Stats - Responsive Grid */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 lg:gap-8 text-xs md:text-sm font-mono px-4 pb-12 md:pb-16 lg:pb-20">
            <div className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-white/20 to-white/10 border border-white/30 backdrop-blur-sm">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse shadow-lg shadow-orange-400/50"></div>
              <span className="text-white">Market Open</span>
            </div>
            <div className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-white/20 to-white/10 border border-white/30 backdrop-blur-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50" style={{animationDelay: '0.5s'}}></div>
              <span className="text-white">Real-time Data</span>
            </div>
            <div className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-white/20 to-white/10 border border-white/30 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" style={{animationDelay: '1s'}}></div>
              <span className="text-white">Zero Risk</span>
            </div>
          </div>
        </div>
        </div>

        {/* Features Grid - Fully Responsive */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 relative px-4">
          <GlassCard className="group p-6 md:p-8 hover:scale-105 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-4 md:mb-6 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-orange-500/25 to-orange-500/15 flex items-center justify-center group-hover:from-orange-500/35 group-hover:to-orange-500/20 transition-all relative">
                <Wallet className="w-6 h-6 md:w-7 md:h-7 text-orange-500 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-lg md:text-xl mb-2 md:mb-3 text-foreground">Instant Setup</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Get <span className="text-orange-500 font-semibold">$10,000</span> in funds. No registration hassles, start trading immediately.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="group p-6 md:p-8 hover:scale-105 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-4 md:mb-6 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-blue-500/25 to-blue-500/15 flex items-center justify-center group-hover:from-blue-500/35 group-hover:to-blue-500/20 transition-all relative">
                <BarChart3 className="w-6 h-6 md:w-7 md:h-7 text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-lg md:text-xl mb-2 md:mb-3 text-foreground">Live Charts</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Professional trading charts with <span className="text-blue-500 font-semibold">real-time</span> price data and technical indicators.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="group p-6 md:p-8 hover:scale-105 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-4 md:mb-6 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-green-500/25 to-green-500/15 flex items-center justify-center group-hover:from-green-500/35 group-hover:to-green-500/20 transition-all relative">
                <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-green-500 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-lg md:text-xl mb-2 md:mb-3 text-foreground">Real-Time P&L</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Track your performance with detailed analytics and <span className="text-green-500 font-semibold">live</span> profit/loss calculations.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="group p-6 md:p-8 hover:scale-105 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="mb-4 md:mb-6 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-purple-500/25 to-purple-500/15 flex items-center justify-center group-hover:from-purple-500/35 group-hover:to-purple-500/20 transition-all relative">
                <Lock className="w-6 h-6 md:w-7 md:h-7 text-purple-500 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-lg md:text-xl mb-2 md:mb-3 text-foreground">100% Safe</h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                Completely <span className="text-purple-500 font-semibold">risk-free</span> environment. Learn and practice without any financial exposure.
              </p>
            </div>
          </GlassCard>
        </div>
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
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary animate-pulse">Real Funds</div>
                <p className="text-muted-foreground font-medium text-sm md:text-base">Starting Balance</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-accent animate-pulse" style={{animationDelay: '0.5s'}}>24/7</div>
                <p className="text-muted-foreground font-medium text-sm md:text-base">Market Access</p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-chart-2 animate-pulse" style={{animationDelay: '1s'}}>0%</div>
                <p className="text-muted-foreground font-medium text-sm md:text-base">Zero Risk</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">What Traders Say</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Join thousands of traders who are mastering their skills on TradeHub
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard className="p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[oklch(0.55_0.15_260)] to-[oklch(0.55_0.15_260)]/50 flex items-center justify-center text-white font-bold">
                JD
              </div>
              <div>
                <h4 className="font-semibold">John Doe</h4>
                <p className="text-sm text-muted-foreground">Day Trader</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              "TradeHub helped me practice strategies without risking real money. The interface is incredibly smooth and the real-time data makes it feel authentic."
            </p>
          </GlassCard>

          <GlassCard className="p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[oklch(0.65_0.12_140)] to-[oklch(0.65_0.12_140)]/50 flex items-center justify-center text-white font-bold">
                SM
              </div>
              <div>
                <h4 className="font-semibold">Sarah Miller</h4>
                <p className="text-sm text-muted-foreground">Crypto Enthusiast</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              "Best trading simulator I've used. The $10,000 starting balance gives you plenty of room to experiment with different trading strategies."
            </p>
          </GlassCard>

          <GlassCard className="p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[oklch(0.6_0.14_180)] to-[oklch(0.6_0.14_180)]/50 flex items-center justify-center text-white font-bold">
                MJ
              </div>
              <div>
                <h4 className="font-semibold">Mike Johnson</h4>
                <p className="text-sm text-muted-foreground">Beginner Trader</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              "As a complete beginner, this platform gave me the confidence to learn trading. The zero-risk environment is perfect for learning."
            </p>
          </GlassCard>

          <GlassCard className="p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[oklch(0.5_0.13_320)] to-[oklch(0.5_0.13_320)]/50 flex items-center justify-center text-white font-bold">
                EW
              </div>
              <div>
                <h4 className="font-semibold">Emily White</h4>
                <p className="text-sm text-muted-foreground">Swing Trader</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              "The real-time charts and instant execution make this feel like a professional trading platform. Highly recommend for practice!"
            </p>
          </GlassCard>

          <GlassCard className="p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[oklch(0.58_0.11_40)] to-[oklch(0.58_0.11_40)]/50 flex items-center justify-center text-white font-bold">
                DB
              </div>
              <div>
                <h4 className="font-semibold">David Brown</h4>
                <p className="text-sm text-muted-foreground">Technical Analyst</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              "Perfect for backtesting strategies. The analytics and trade history features help me understand what works and what doesn't."
            </p>
          </GlassCard>

          <GlassCard className="p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[oklch(0.55_0.15_260)] to-[oklch(0.55_0.15_260)]/50 flex items-center justify-center text-white font-bold">
                LG
              </div>
              <div>
                <h4 className="font-semibold">Lisa Garcia</h4>
                <p className="text-sm text-muted-foreground">Portfolio Manager</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              "Excellent platform for honing trading skills. The beautiful UI and smooth performance make trading practice enjoyable."
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose TradeHub?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard className="p-8 relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.55_0.15_260)]/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">No Hidden Fees</h3>
              <p className="text-muted-foreground">
                Completely free to use. No subscriptions, no hidden charges, no credit card required. Just sign up and start trading immediately.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-8 relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.65_0.12_140)]/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Real Market Data</h3>
              <p className="text-muted-foreground">
                Practice with actual Bitcoin price movements. Our platform uses real-time market data so you experience authentic trading conditions.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-8 relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.6_0.14_180)]/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Instant Execution</h3>
              <p className="text-muted-foreground">
                Experience lightning-fast order execution. Place trades instantly at current market prices, just like professional trading platforms.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-8 relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.5_0.13_320)]/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Comprehensive Analytics</h3>
              <p className="text-muted-foreground">
                Track your performance with detailed analytics. View your trade history, monitor open positions, and analyze your P&L in real-time.
              </p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 text-lg md:text-xl font-bold text-primary">
              <Image 
                src="/tradeHub_logo.PNG" 
                alt="TradeHub Logo" 
                width={24} 
                height={24} 
                className="w-6 h-6 md:w-7 md:h-7" 
              />
              TradeHub
            </div>
            <a href="mailto:tradehuhWorldWide@gmail.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />
              tradehuhWorldWide@gmail.com
            </a>
            <p className="text-muted-foreground text-center text-xs md:text-sm">
              © 2024 TradeHub. Trading platform for educational purposes.
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