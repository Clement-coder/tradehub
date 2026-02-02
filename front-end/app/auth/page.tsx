"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, TrendingUp, BarChart3, DollarSign, Zap, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import SignupButton from "@/components/ui/signUpButton";

export default function AuthPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10 flex flex-col justify-center items-center px-4 overflow-hidden relative">
      {/* Animated Background Elements - matching landing page */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs like landing page */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-primary/15 to-primary/8 rounded-full blur-2xl animate-pulse" style={{animationDuration: '4s'}} />
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-accent/15 to-accent/8 rounded-full blur-2xl animate-pulse" style={{animationDuration: '3s', animationDelay: '1s'}} />
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-r from-chart-2/15 to-chart-2/8 rounded-full blur-3xl animate-pulse" style={{animationDuration: '5s', animationDelay: '2s'}} />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full" 
            style={{
              backgroundImage: 'linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}
          />
        </div>
        
        {/* Floating Trading Icons */}
        {[TrendingUp, BarChart3, DollarSign, Zap].map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/20"
            style={{
              left: `${20 + i * 20}%`,
              top: `${30 + i * 15}%`
            }}
            animate={{
              y: [-10, 10, -10],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          >
            <Icon size={20} />
          </motion.div>
        ))}
      </div>

      {/* Fixed Navigation - real navbar from landing page */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-blue-700/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Back Button */}
            <motion.div
              whileHover={{ x: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </motion.div>
            
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Link href="/" className="flex items-center gap-2 group">
                <Image 
                  src="/tradeHub_logo.PNG" 
                  alt="TradeHub Logo" 
                  width={48} 
                  height={48} 
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 group-hover:scale-110 transition-transform duration-300" 
                />
              </Link>
            </motion.div>

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
            
            {/* Desktop spacer */}
            <div className="hidden md:block"></div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              mobileMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="py-4 space-y-3 border-t border-border/40">
              <Link
                href="/how-it-works"
                className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-white/20 to-white/10 border border-primary/40 backdrop-blur-sm w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-primary">Learn More</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <motion.div
        className="w-full max-w-md text-center relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Glassmorphism Modal Container - matching landing page style */}
        <motion.div
          className="backdrop-blur-xl bg-white/10 dark:bg-white/5 border border-white/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Subtle glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5"
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Carousel Grid Animation - Right to Left */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <motion.div
              className="flex absolute top-1/2 -translate-y-1/2 gap-4"
              animate={{
                x: ["100%", "-100%"]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <div className="min-w-[200px] h-20 bg-blue-500/30 rounded-lg flex items-center justify-center text-xs font-medium text-white backdrop-blur-sm px-4 text-center">
                Practice trading with $10,000 virtual funds
              </div>
              <div className="min-w-[200px] h-20 bg-orange-500/30 rounded-lg flex items-center justify-center text-xs font-medium text-white backdrop-blur-sm px-4 text-center">
                Real-time market data and live price feeds
              </div>
              <div className="min-w-[200px] h-20 bg-green-500/30 rounded-lg flex items-center justify-center text-xs font-medium text-white backdrop-blur-sm px-4 text-center">
                Zero financial risk - learn without losing money
              </div>
              <div className="min-w-[200px] h-20 bg-purple-500/30 rounded-lg flex items-center justify-center text-xs font-medium text-white backdrop-blur-sm px-4 text-center">
                Professional charts with technical indicators
              </div>
              <div className="min-w-[200px] h-20 bg-blue-500/30 rounded-lg flex items-center justify-center text-xs font-medium text-white backdrop-blur-sm px-4 text-center">
                Track your performance with detailed analytics
              </div>
              <div className="min-w-[200px] h-20 bg-orange-500/30 rounded-lg flex items-center justify-center text-xs font-medium text-white backdrop-blur-sm px-4 text-center">
                Build confidence before real trading
              </div>
              <div className="min-w-[200px] h-20 bg-green-500/30 rounded-lg flex items-center justify-center text-xs font-medium text-white backdrop-blur-sm px-4 text-center">
                Practice trading with $10,000 virtual funds
              </div>
              <div className="min-w-[200px] h-20 bg-purple-500/30 rounded-lg flex items-center justify-center text-xs font-medium text-white backdrop-blur-sm px-4 text-center">
                Real-time market data and live price feeds
              </div>
            </motion.div>
          </div>
          
          {/* Header */}
          <motion.div
            className="text-center mb-8 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.h1
              className="text-3xl font-bold text-foreground mb-2"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Get Started
            </motion.h1>
            <motion.p
              className="text-muted-foreground mb-6"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Connect your wallet to start trading
            </motion.p>
            
            {/* Animated Grid Description */}
            <div className="text-sm text-muted-foreground/80 leading-relaxed mb-4 relative h-20">
              <div className="text-center mb-2">Experience professional trading with</div>
              
              {/* Four Carousel Grids */}
              <div className="relative overflow-hidden h-14">
                <motion.div
                  className="absolute inset-0 flex items-center justify-center rounded-xl backdrop-blur-md border-2 border-blue-400/60 px-6 py-4"
                  animate={{ 
                    x: ["-100%", "0%", "0%", "-100%"],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    times: [0, 0.05, 0.2, 0.25],
                    ease: "easeInOut"
                  }}
                >
                  <span className="text-blue-400 font-semibold text-base">real-time charts</span>
                </motion.div>
                
                <motion.div
                  className="absolute inset-0 flex items-center justify-center rounded-xl backdrop-blur-md border-2 border-orange-400/60 px-6 py-4"
                  animate={{ 
                    x: ["-100%", "0%", "0%", "-100%"],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    times: [0, 0.05, 0.2, 0.25],
                    ease: "easeInOut",
                    delay: 3
                  }}
                >
                  <span className="text-orange-400 font-semibold text-base">live market data</span>
                </motion.div>
                
                <motion.div
                  className="absolute inset-0 flex items-center justify-center rounded-xl backdrop-blur-md border-2 border-green-400/60 px-6 py-4"
                  animate={{ 
                    x: ["-100%", "0%", "0%", "-100%"],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    times: [0, 0.05, 0.2, 0.25],
                    ease: "easeInOut",
                    delay: 6
                  }}
                >
                  <span className="text-green-400 font-semibold text-base">risk-free environment</span>
                </motion.div>
                
                <motion.div
                  className="absolute inset-0 flex items-center justify-center rounded-xl backdrop-blur-md border-2 border-purple-400/60 px-6 py-4"
                  animate={{ 
                    x: ["-100%", "0%", "0%", "-100%"],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    times: [0, 0.05, 0.2, 0.25],
                    ease: "easeInOut",
                    delay: 9
                  }}
                >
                  <span className="text-purple-400 font-semibold text-base">advanced analytics</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Auth Button */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <SignupButton />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
