'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp, Wallet, BarChart3, Lock } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 dark:from-background dark:via-background dark:to-accent/10">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/50 dark:bg-white/5 border-b border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            TradeHub
          </div>
          <div className="flex gap-4">
            <Link
              href="/auth"
              className="px-6 py-2 rounded-full font-medium text-foreground hover:bg-muted transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              className="px-6 py-2 rounded-full font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16">
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-accent/10 dark:bg-accent/20 border border-accent/30 dark:border-accent/40">
            <span className="text-sm font-medium text-accent">Demo Trading Platform</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Trade with Confidence
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Experience the future of trading. Practice on simulated markets with real trading logic in a beautiful, intuitive interface.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Start Trading Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-foreground bg-white/70 dark:bg-white/10 border border-white/20 hover:bg-white/80 dark:hover:bg-white/15 backdrop-blur-lg transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <GlassCard className="p-6">
            <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Instant Wallet</h3>
            <p className="text-muted-foreground text-sm">
              Get a demo wallet instantly with simulated funds ready to trade.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Real Charts</h3>
            <p className="text-muted-foreground text-sm">
              Trade BTC with dynamic price simulation and detailed analytics.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Track P&L</h3>
            <p className="text-muted-foreground text-sm">
              Monitor your positions and profit/loss in real time.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Safe Demo</h3>
            <p className="text-muted-foreground text-sm">
              Completely simulated. No real money, no real risks.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <GlassCard className="p-12 md:p-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <p className="text-muted-foreground">Demo Funds</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Trading Available</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <p className="text-muted-foreground">Simulated Data</p>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
