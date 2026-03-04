'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useTradingContext } from './trading-context';
import { useBTCPrice } from '@/lib/hooks/useBTCPrice';

interface MarketSentiment {
  score: number; // -1 to 1
  fearGreedIndex: number; // 0-100
  socialVolume: number;
  newsSentiment: number;
  whaleActivity: number;
  lastUpdated: string;
}

interface TradeSuggestion {
  id: string;
  type: 'buy' | 'sell' | 'hold' | 'stop_loss' | 'take_profit';
  symbol: string;
  suggestedPrice: number;
  currentPrice: number;
  confidence: number; // 0-1
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
  timeHorizon: 'short' | 'medium' | 'long';
  expectedOutcome: string;
  createdAt: string;
  expiresAt: string;
}

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  messageType: 'text' | 'voice' | 'trade_suggestion' | 'market_analysis';
  sentiment?: number;
  confidence?: number;
}

interface AITradingContextType {
  // Chat
  messages: AIMessage[];
  isTyping: boolean;
  sendMessage: (message: string, type?: 'text' | 'voice') => Promise<void>;
  clearChat: () => void;
  
  // Voice
  isListening: boolean;
  voiceEnabled: boolean;
  startListening: () => void;
  stopListening: () => void;
  toggleVoice: () => void;
  
  // Market Analysis
  marketSentiment: MarketSentiment | null;
  refreshSentiment: () => Promise<void>;
  
  // Trade Suggestions
  tradeSuggestions: TradeSuggestion[];
  refreshSuggestions: () => Promise<void>;
  executeSuggestion: (suggestionId: string) => Promise<void>;
  
  // Settings
  riskTolerance: 'low' | 'medium' | 'high';
  autoSuggestions: boolean;
  updateSettings: (settings: Partial<{
    riskTolerance: 'low' | 'medium' | 'high';
    autoSuggestions: boolean;
    voiceEnabled: boolean;
  }>) => void;
}

const AITradingContext = createContext<AITradingContextType | undefined>(undefined);

export function AITradingProvider({ children }: { children: React.ReactNode }) {
  const { authenticated, user: privyUser } = usePrivy();
  const { user } = useTradingContext();
  const { data: btcPrice } = useBTCPrice();
  
  // State
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment | null>(null);
  const [tradeSuggestions, setTradeSuggestions] = useState<TradeSuggestion[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  const [autoSuggestions, setAutoSuggestions] = useState(true);
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        sendMessage(transcript, 'voice');
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Fetch market sentiment
  const refreshSentiment = async () => {
    try {
      // Fear & Greed Index
      const fearGreedResponse = await fetch('https://api.alternative.me/fng/');
      const fearGreedData = await fearGreedResponse.json();
      
      // Simple sentiment calculation (in real app, you'd use multiple sources)
      const sentiment: MarketSentiment = {
        score: (fearGreedData.data[0].value - 50) / 50, // Convert 0-100 to -1 to 1
        fearGreedIndex: parseInt(fearGreedData.data[0].value),
        socialVolume: Math.floor(Math.random() * 1000), // Mock data
        newsSentiment: Math.random() * 2 - 1, // Mock data
        whaleActivity: Math.random() * 2 - 1, // Mock data
        lastUpdated: new Date().toISOString()
      };
      
      setMarketSentiment(sentiment);
    } catch (error) {
      console.error('Error fetching market sentiment:', error);
    }
  };

  // Generate AI response
  const generateAIResponse = async (userMessage: string, messageType: 'text' | 'voice'): Promise<string> => {
    // For now, provide intelligent responses without OpenAI API
    const message = userMessage.toLowerCase();
    
    // Greeting responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return `Hello! I'm your AI trading assistant. Current BTC price is $${btcPrice?.toLocaleString() || 'loading...'}. How can I help you with your trading today?`;
    }
    
    // Price queries
    if (message.includes('price') || message.includes('btc') || message.includes('bitcoin')) {
      return `Bitcoin is currently trading at $${btcPrice?.toLocaleString() || 'loading...'}. ${marketSentiment ? 
        `Market sentiment is ${marketSentiment.score > 0.3 ? 'bullish' : marketSentiment.score < -0.3 ? 'bearish' : 'neutral'} with a Fear & Greed index of ${marketSentiment.fearGreedIndex}.` : 
        'Analyzing market sentiment...'}`;
    }
    
    // Trading advice
    if (message.includes('buy') || message.includes('sell') || message.includes('trade')) {
      const advice = riskTolerance === 'low' ? 'conservative' : riskTolerance === 'high' ? 'aggressive' : 'balanced';
      return `Based on your ${advice} risk profile, I'd suggest ${marketSentiment?.score > 0.2 ? 'considering a small position if you see a good entry point' : marketSentiment?.score < -0.2 ? 'waiting for better market conditions' : 'being cautious and watching for clear signals'}. Remember, this is a simulation for learning!`;
    }
    
    // Market sentiment
    if (message.includes('sentiment') || message.includes('market') || message.includes('fear') || message.includes('greed')) {
      return marketSentiment ? 
        `Current market sentiment shows ${marketSentiment.score > 0 ? 'optimism' : 'caution'} with a Fear & Greed index of ${marketSentiment.fearGreedIndex}/100. ${marketSentiment.fearGreedIndex > 70 ? 'Market is showing extreme greed - be careful!' : marketSentiment.fearGreedIndex < 30 ? 'Market is fearful - could be a buying opportunity.' : 'Market sentiment is balanced.'}` :
        'I\'m analyzing current market sentiment. Give me a moment to gather the latest data.';
    }
    
    // Help and general queries
    if (message.includes('help') || message.includes('what') || message.includes('how')) {
      return 'I can help you with:\n• Current BTC prices and market analysis\n• Trading suggestions based on your risk tolerance\n• Market sentiment and Fear & Greed index\n• Educational trading insights\n\nTry asking: "What\'s the current price?" or "Should I buy now?"';
    }
    
    // Default response
    return `I understand you're asking about "${userMessage}". As your trading assistant, I can help with market analysis, price updates, and trading education. Current BTC: $${btcPrice?.toLocaleString() || 'loading...'}. What would you like to know?`;
  };

  // Send message
  const sendMessage = async (message: string, type: 'text' | 'voice' = 'text') => {
    if (!message.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      messageType: type
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const aiResponse = await generateAIResponse(message, type);
      
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        messageType: 'text',
        confidence: 0.8 // Mock confidence
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  // Voice controls
  const startListening = () => {
    if (recognitionRef.current && voiceEnabled) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(prev => !prev);
    if (isListening) {
      stopListening();
    }
  };

  // Generate trade suggestions
  const refreshSuggestions = async () => {
    if (!btcPrice || !marketSentiment) return;

    // Mock AI-generated suggestions (in real app, use OpenAI)
    const suggestions: TradeSuggestion[] = [
      {
        id: Date.now().toString(),
        type: marketSentiment.score > 0.3 ? 'buy' : marketSentiment.score < -0.3 ? 'sell' : 'hold',
        symbol: 'BTC',
        suggestedPrice: btcPrice * (1 + (Math.random() - 0.5) * 0.02),
        currentPrice: btcPrice,
        confidence: Math.random() * 0.4 + 0.6, // 0.6-1.0
        reasoning: marketSentiment.score > 0.3 
          ? "Strong bullish sentiment detected. Fear & Greed index shows optimism."
          : marketSentiment.score < -0.3
          ? "Bearish sentiment prevailing. Consider taking profits or waiting."
          : "Mixed signals. Market consolidation expected.",
        riskLevel: riskTolerance,
        timeHorizon: 'short',
        expectedOutcome: `${(Math.random() * 10 - 5).toFixed(1)}% in 24h`,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    setTradeSuggestions(suggestions);
  };

  const executeSuggestion = async (suggestionId: string) => {
    // Implementation would integrate with trading context
    console.log('Executing suggestion:', suggestionId);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const updateSettings = (settings: Partial<{
    riskTolerance: 'low' | 'medium' | 'high';
    autoSuggestions: boolean;
    voiceEnabled: boolean;
  }>) => {
    if (settings.riskTolerance) setRiskTolerance(settings.riskTolerance);
    if (settings.autoSuggestions !== undefined) setAutoSuggestions(settings.autoSuggestions);
    if (settings.voiceEnabled !== undefined) setVoiceEnabled(settings.voiceEnabled);
  };

  // Auto-refresh sentiment and suggestions
  useEffect(() => {
    if (authenticated && user) {
      refreshSentiment();
      const interval = setInterval(refreshSentiment, 5 * 60 * 1000); // Every 5 minutes
      return () => clearInterval(interval);
    }
  }, [authenticated, user]);

  useEffect(() => {
    if (autoSuggestions && marketSentiment && btcPrice) {
      refreshSuggestions();
    }
  }, [marketSentiment, btcPrice, autoSuggestions]);

  const value: AITradingContextType = {
    messages,
    isTyping,
    sendMessage,
    clearChat,
    isListening,
    voiceEnabled,
    startListening,
    stopListening,
    toggleVoice,
    marketSentiment,
    refreshSentiment,
    tradeSuggestions,
    refreshSuggestions,
    executeSuggestion,
    riskTolerance,
    autoSuggestions,
    updateSettings
  };

  return (
    <AITradingContext.Provider value={value}>
      {children}
    </AITradingContext.Provider>
  );
}

export function useAITrading() {
  const context = useContext(AITradingContext);
  if (context === undefined) {
    throw new Error('useAITrading must be used within an AITradingProvider');
  }
  return context;
}
