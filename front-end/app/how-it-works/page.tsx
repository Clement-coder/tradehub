'use client';

import Link from 'next/link';
import { TrendingUp, UserPlus, BarChart3, ShoppingCart, PieChart, Shield, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: UserPlus,
      title: 'Sign Up',
      description: 'Create your account and get instantly connected to a demo wallet with $10,000 in simulated trading funds.',
    },
    {
      icon: BarChart3,
      title: 'View Markets',
      description: 'Access live BTC/USD price charts with real-time market simulation. See price movements update dynamically.',
    },
    {
      icon: ShoppingCart,
      title: 'Place Trades',
      description: 'Choose your trade amount, select Buy or Sell, and execute orders instantly at the current market price.',
    },
    {
      icon: PieChart,
      title: 'Track Positions',
      description: 'Monitor your open positions and watch your profit/loss update in real-time as the market moves.',
    },
    {
      icon: TrendingUp,
      title: 'Close & Analyze',
      description: 'Close positions at any time and review detailed trade history with entry/exit prices and P&L metrics.',
    },
    {
      icon: Shield,
      title: 'Learn Safely',
      description: 'Practice trading strategies without any real money risk. All funds are simulated for educational purposes.',
    },
  ];

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
              href="/"
              className="px-6 py-2 rounded-full font-medium text-foreground hover:bg-muted transition-colors"
            >
              Home
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

      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">How It Works</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get started with our demo trading platform in 6 simple steps. Trade Bitcoin with simulated funds and learn at your own pace.
        </p>
      </section>

      {/* Steps Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <GlassCard key={index} className="p-6 flex flex-col">
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Step {index + 1}</p>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm flex-grow">{step.description}</p>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Key Features</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <GlassCard className="p-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Realistic Trading Experience</h3>
            <p className="text-muted-foreground mb-4">
              Experience true-to-life trading mechanics with real price movements, order execution, and profit/loss calculations. Our simulated market behaves like the real BTC market.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-muted-foreground">Real-time price simulation</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-muted-foreground">Instant order execution</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-muted-foreground">Dynamic P&L tracking</span>
              </li>
            </ul>
          </GlassCard>

          <GlassCard className="p-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Learn at Your Pace</h3>
            <p className="text-muted-foreground mb-4">
              This is a completely risk-free environment to develop your trading skills. No real money means no real stress, allowing you to focus on learning.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-muted-foreground">$10,000 demo funds</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-muted-foreground">No financial risk</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-muted-foreground">Practice trading strategies</span>
              </li>
            </ul>
          </GlassCard>

          <GlassCard className="p-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Beautiful Interface</h3>
            <p className="text-muted-foreground mb-4">
              Designed with the principles of modern iOS apps, our interface is intuitive, responsive, and a pleasure to use across all devices.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-muted-foreground">Premium glassmorphism design</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-muted-foreground">Smooth animations</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-muted-foreground">Mobile responsive</span>
              </li>
            </ul>
          </GlassCard>

          <GlassCard className="p-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Complete Analytics</h3>
            <p className="text-muted-foreground mb-4">
              Track every detail of your trading activity with comprehensive position management and detailed trade history.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-muted-foreground">Open position tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-muted-foreground">Complete trade history</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span className="text-muted-foreground">P&L analytics</span>
              </li>
            </ul>
          </GlassCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <GlassCard className="p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Start Trading?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join thousands of traders practicing on our demo platform. Get your $10,000 demo balance today.
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </GlassCard>
      </section>
    </div>
  );
}
