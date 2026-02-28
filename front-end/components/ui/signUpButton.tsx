"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowRight } from "lucide-react";
import { useToast } from "@/components/toast-provider";

export default function SignupButton() {
  const { login, authenticated, ready } = usePrivy();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (ready && authenticated) {
      toast.success('Welcome to TradeHub!', 'You are now logged in');
      router.push("/dashboard");
    }
  }, [authenticated, ready, router, toast]);

  return (
    <motion.button
      onClick={login}
      className="group relative inline-flex items-center justify-center gap-2 md:gap-3 px-6 sm:px-8 lg:px-10 py-3 md:py-4 rounded-xl font-semibold text-sm md:text-base text-primary-foreground bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden w-full"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Shimmer effect like landing page */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      {/* Button Content */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Wallet className="w-4 md:w-5 h-4 md:h-5" />
      </motion.div>
      
      <span>Start Trading Now</span>
      
     
        <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
    </motion.button>
  );
}
