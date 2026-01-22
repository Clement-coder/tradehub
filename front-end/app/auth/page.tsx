'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Check } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { useTradingContext } from '@/app/context/trading-context';
import { generateMockWalletAddress } from '@/lib/mock-data';

export default function AuthPage() {
  const router = useRouter();
  const { setUser } = useTradingContext();
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email');
      return;
    }

    setIsLoading(true);

    // Simulate auth delay
    setTimeout(() => {
      const user = {
        id: `user-${Date.now()}`,
        email,
        walletAddress: generateMockWalletAddress(),
        balance: 10000, // Demo balance in USD
      };

      setUser(user);
      setSuccessMessage('Success! Redirecting to dashboard...');
      setEmail('');
      setPassword('');

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 dark:from-background dark:via-background dark:to-accent/10 flex flex-col justify-center items-center px-4">
      {/* Back Link */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          ← Back
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? 'Sign in to your trading account' : 'Create your demo trading account'}
          </p>
        </div>

        {/* Auth Form */}
        <GlassCard className="p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/70 dark:bg-white/10 border border-white/20 dark:border-white/10 placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/70 dark:bg-white/10 border border-white/20 dark:border-white/10 placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Status Messages */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-destructive/10 dark:bg-destructive/20 border border-destructive/30 dark:border-destructive/40 text-destructive text-sm">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-lg bg-accent/10 dark:bg-accent/20 border border-accent/30 dark:border-accent/40 text-accent text-sm flex items-center gap-2">
                <Check className="w-4 h-4" />
                {successMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? 'Connecting...' : isLogin ? 'Sign In' : 'Create Account'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </GlassCard>

        {/* Toggle Auth Mode */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className="text-primary font-semibold hover:underline transition-all"
          >
            {isLogin ? 'Create one' : 'Sign in instead'}
          </button>
        </div>

        {/* Demo Info */}
        <GlassCard className="p-4 mt-8 text-center text-sm text-muted-foreground">
          This is a demo platform. Use any email and password to get started with $10,000 in simulated trading funds.
        </GlassCard>
      </div>
    </div>
  );
}
