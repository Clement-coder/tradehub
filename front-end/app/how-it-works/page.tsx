'use client';

import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, UserPlus, BarChart3, ShoppingCart, PieChart, Shield, ArrowRight, Menu, X, Home, BookOpen, Zap, LineChart, Sparkles, Activity, Mail } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';

export default function HowItWorksPage() {
  const { authenticated } = usePrivy();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const steps = [
    {
      icon: UserPlus,
      title: 'Sign Up',
      description: 'Create your account and get instantly connected to a wallet with $10,000 in trading funds.',
      color: 'from-[oklch(0.55_0.15_260)]/30 to-[oklch(0.55_0.15_260)]/20',
      iconColor: 'text-[oklch(0.55_0.15_260)]',
      bgColor: 'bg-[oklch(0.55_0.15_260)]/20',
      borderColor: 'border-[oklch(0.55_0.15_260)]/40'
    },
    {
      icon: BarChart3,
      title: 'View Markets',
      description: 'Access live BTC/USD price charts with real-time market data. See price movements update dynamically.',
      color: 'from-[oklch(0.65_0.12_140)]/30 to-[oklch(0.65_0.12_140)]/20',
      iconColor: 'text-[oklch(0.65_0.12_140)]',
      bgColor: 'bg-[oklch(0.65_0.12_140)]/20',
      borderColor: 'border-[oklch(0.65_0.12_140)]/40'
    },
    {
      icon: ShoppingCart,
      title: 'Place Trades',
      description: 'Choose your trade amount, select Buy or Sell, and execute orders instantly at the current market price.',
      color: 'from-[oklch(0.6_0.14_180)]/30 to-[oklch(0.6_0.14_180)]/20',
      iconColor: 'text-[oklch(0.6_0.14_180)]',
      bgColor: 'bg-[oklch(0.6_0.14_180)]/20',
      borderColor: 'border-[oklch(0.6_0.14_180)]/40'
    },
    {
      icon: PieChart,
      title: 'Track Positions',
      description: 'Monitor your open positions and watch your profit/loss update in real-time as the market moves.',
      color: 'from-[oklch(0.5_0.13_320)]/30 to-[oklch(0.5_0.13_320)]/20',
      iconColor: 'text-[oklch(0.5_0.13_320)]',
      bgColor: 'bg-[oklch(0.5_0.13_320)]/20',
      borderColor: 'border-[oklch(0.5_0.13_320)]/40'
    },
    {
      icon: TrendingUp,
      title: 'Close & Analyze',
      description: 'Close positions at any time and review detailed trade history with entry/exit prices and P&L metrics.',
      color: 'from-[oklch(0.58_0.11_40)]/30 to-[oklch(0.58_0.11_40)]/20',
      iconColor: 'text-[oklch(0.58_0.11_40)]',
      bgColor: 'bg-[oklch(0.58_0.11_40)]/20',
      borderColor: 'border-[oklch(0.58_0.11_40)]/40'
    },
    {
      icon: Shield,
      title: 'Learn Safely',
      description: 'Practice trading strategies without any real money risk. All funds are for educational purposes.',
      color: 'from-[oklch(0.55_0.15_260)]/30 to-[oklch(0.55_0.15_260)]/20',
      iconColor: 'text-[oklch(0.55_0.15_260)]',
      bgColor: 'bg-[oklch(0.55_0.15_260)]/20',
      borderColor: 'border-[oklch(0.55_0.15_260)]/40'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[oklch(0.55_0.15_260)]/30 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}} />
        <div className="absolute top-40 right-32 w-80 h-80 bg-[oklch(0.65_0.12_140)]/30 rounded-full blur-3xl animate-pulse" style={{animationDuration: '3s', animationDelay: '1s'}} />
        <div className="absolute bottom-40 left-1/4 w-96 h-96 bg-[oklch(0.6_0.14_180)]/30 rounded-full blur-3xl animate-pulse" style={{animationDuration: '5s', animationDelay: '2s'}} />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-[oklch(0.5_0.13_320)]/30 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s', animationDelay: '1.5s'}} />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[oklch(0.58_0.11_40)]/30 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4.5s', animationDelay: '0.5s'}} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-blue-700/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <Image src="/tradeHub_logo.PNG" alt="TradeHub Logo" width={48} height={48} className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-bold text-base sm:text-lg md:text-xl text-blue-600 dark:text-blue-400">TradeHub</span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-orange-500/10 border border-orange-500/30 text-white hover:from-orange-500/30 hover:to-orange-500/20 transition-all duration-200 font-medium backdrop-blur-sm">
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link href="/how-it-works" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-500/10 border border-blue-500/30 text-white hover:from-blue-500/30 hover:to-blue-500/20 transition-all duration-200 font-medium backdrop-blur-sm">
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

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-muted/80 transition-colors">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="py-4 space-y-2 border-t border-border/40">
              <Link href="/" className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-orange-500/10 border border-orange-500/30 text-white transition-all" onClick={() => setMobileMenuOpen(false)}>
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link href="/how-it-works" className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-500/10 border border-blue-500/30 text-white transition-all" onClick={() => setMobileMenuOpen(false)}>
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

      {/* Header */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent mb-6 leading-tight">
          How It Works
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get started with our trading platform in 6 simple steps. Trade Bitcoin with virtual funds and learn at your own pace.
        </p>
      </section>

      {/* Steps Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <GlassCard key={index} className={`p-6 flex flex-col relative overflow-hidden group hover:scale-105 transition-all duration-300 border ${step.borderColor}`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative z-10">
                  <div className="mb-4">
                    <div className={`w-12 h-12 rounded-lg ${step.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${step.iconColor}`} />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Step {index + 1}</p>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm flex-grow">{step.description}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Key Features</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <GlassCard className="p-8 group hover:scale-105 transition-all duration-300 relative overflow-hidden border border-[oklch(0.55_0.15_260)]/40">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.55_0.15_260)]/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[oklch(0.55_0.15_260)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-[oklch(0.55_0.15_260)]" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Realistic Trading Experience</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Experience true-to-life trading mechanics with real price movements, order execution, and profit/loss calculations. Our market behaves like the real BTC market.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.15_260)] mt-2" />
                  <span className="text-muted-foreground">Real-time price simulation</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.15_260)] mt-2" />
                  <span className="text-muted-foreground">Instant order execution</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.15_260)] mt-2" />
                  <span className="text-muted-foreground">Dynamic P&L tracking</span>
                </li>
              </ul>
            </div>
          </GlassCard>

          <GlassCard className="p-8 group hover:scale-105 transition-all duration-300 relative overflow-hidden border border-[oklch(0.65_0.12_140)]/40">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.65_0.12_140)]/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[oklch(0.65_0.12_140)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-[oklch(0.65_0.12_140)]" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Learn at Your Pace</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                This is a completely risk-free environment to develop your trading skills. No real money means no real stress, allowing you to focus on learning.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.65_0.12_140)] mt-2" />
                  <span className="text-muted-foreground">$10,000 funds</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.65_0.12_140)] mt-2" />
                  <span className="text-muted-foreground">No financial risk</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.65_0.12_140)] mt-2" />
                  <span className="text-muted-foreground">Practice trading strategies</span>
                </li>
              </ul>
            </div>
          </GlassCard>

          <GlassCard className="p-8 group hover:scale-105 transition-all duration-300 relative overflow-hidden border border-[oklch(0.6_0.14_180)]/40">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.6_0.14_180)]/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[oklch(0.6_0.14_180)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-[oklch(0.6_0.14_180)]" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Beautiful Interface</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Designed with the principles of modern iOS apps, our interface is intuitive, responsive, and a pleasure to use across all devices.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.6_0.14_180)] mt-2" />
                  <span className="text-muted-foreground">Premium glassmorphism design</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.6_0.14_180)] mt-2" />
                  <span className="text-muted-foreground">Smooth animations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.6_0.14_180)] mt-2" />
                  <span className="text-muted-foreground">Mobile responsive</span>
                </li>
              </ul>
            </div>
          </GlassCard>

          <GlassCard className="p-8 group hover:scale-105 transition-all duration-300 relative overflow-hidden border border-[oklch(0.5_0.13_320)]/40">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.5_0.13_320)]/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[oklch(0.5_0.13_320)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LineChart className="w-6 h-6 text-[oklch(0.5_0.13_320)]" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Complete Analytics</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Track every detail of your trading activity with comprehensive position management and detailed trade history.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.5_0.13_320)] mt-2" />
                  <span className="text-muted-foreground">Open position tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.5_0.13_320)] mt-2" />
                  <span className="text-muted-foreground">Complete trade history</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.5_0.13_320)] mt-2" />
                  <span className="text-muted-foreground">P&L analytics</span>
                </li>
              </ul>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <GlassCard className="p-12 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.55_0.15_260)]/8 via-[oklch(0.65_0.12_140)]/8 to-[oklch(0.6_0.14_180)]/8 animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Start Trading?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Join thousands of traders practicing on our platform. Get your $10,000 balance today.
            </p>
            <Link
              href={authenticated ? "/dashboard" : "/auth"}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-primary-foreground bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {authenticated ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </GlassCard>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 text-lg md:text-xl font-bold text-primary">
              <Image src="/tradeHub_logo.PNG" alt="TradeHub Logo" width={24} height={24} className="w-6 h-6 md:w-7 md:h-7" />
              TradeHub
            </div>
            <a href="mailto:tradehuhWorldWide@gmail.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />
              tradehuhWorldWide@gmail.com
            </a>
            <p className="text-muted-foreground text-center text-xs md:text-sm">
              © 2026 TradeHub. Master BTC trading with real-time simulations. Practice strategies, build confidence, and earn your trading edge.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
