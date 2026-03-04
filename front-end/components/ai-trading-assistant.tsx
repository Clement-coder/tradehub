'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Send, 
  X, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Lightbulb,
  Settings,
  MessageCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAITrading } from '@/app/context/ai-trading-context';

export function AITradingAssistant() {
  const {
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
    tradeSuggestions,
    riskTolerance,
    autoSuggestions,
    updateSettings
  } = useAITrading();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'sentiment' | 'suggestions' | 'settings'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      inputRef.current?.focus();
    }
  }, [isOpen, activeTab]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-500';
    if (score < -0.3) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getSentimentIcon = (score: number) => {
    if (score > 0.3) return <TrendingUp className="w-4 h-4" />;
    if (score < -0.3) return <TrendingDown className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <>
      {/* Floating AI Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'hidden' : 'block'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Bot className="w-6 h-6" />
        {/* Pulse animation for new suggestions */}
        {tradeSuggestions.length > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {tradeSuggestions.length}
          </motion.div>
        )}
      </motion.button>

      {/* AI Assistant Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-end p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* AI Assistant Panel */}
            <motion.div
              className="relative w-full max-w-md h-[600px] bg-card/95 backdrop-blur-sm border border-border/40 rounded-xl shadow-2xl flex flex-col"
              initial={{ scale: 0.8, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header - Fixed */}
              <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border/40 bg-gradient-to-r from-[oklch(0.68_0.14_180)]/10 to-[oklch(0.62_0.13_320)]/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">AI Trading Assistant</h3>
                    <p className="text-xs text-muted-foreground">
                      {isListening ? 'Listening...' : isTyping ? 'Thinking...' : 'Ready to help'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              </div>

              {/* Tabs - Fixed */}
              <div className="flex-shrink-0 flex border-b border-border/40 bg-muted/20">
                {[
                  { id: 'chat', label: 'Chat', icon: MessageCircle },
                  { id: 'sentiment', label: 'Market', icon: TrendingUp },
                  { id: 'suggestions', label: 'Ideas', icon: Lightbulb },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 text-xs font-medium transition-all duration-200 ${
                      activeTab === id
                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {/* Chat Tab */}
                {activeTab === 'chat' && (
                  <div className="h-full flex flex-col">
                    {/* Messages - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg text-sm ${
                              message.type === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            {message.content}
                            {message.messageType === 'voice' && (
                              <Volume2 className="w-3 h-3 inline ml-2 opacity-60" />
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input - Fixed at bottom */}
                    <div className="flex-shrink-0 p-4 border-t border-border/40 bg-muted/10">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={voiceEnabled ? (isListening ? stopListening : startListening) : toggleVoice}
                          className={`p-2.5 rounded-lg transition-all duration-200 ${
                            isListening
                              ? 'bg-red-500 text-white shadow-lg'
                              : voiceEnabled
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {voiceEnabled ? (isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />) : <VolumeX className="w-4 h-4" />}
                        </button>
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything about trading..."
                          className="flex-1 p-2.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                          disabled={isListening}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim() || isTyping}
                          className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Market Sentiment Tab */}
                {activeTab === 'sentiment' && (
                  <div className="h-full overflow-y-auto p-4 space-y-4">
                    {marketSentiment ? (
                      <>
                        <div className="text-center">
                          <div className={`text-4xl font-bold ${getSentimentColor(marketSentiment.score)}`}>
                            {getSentimentIcon(marketSentiment.score)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Market Sentiment: {marketSentiment.score > 0.3 ? 'Bullish' : marketSentiment.score < -0.3 ? 'Bearish' : 'Neutral'}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-muted">
                            <p className="text-xs text-muted-foreground">Fear & Greed</p>
                            <p className="text-lg font-bold">{marketSentiment.fearGreedIndex}/100</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted">
                            <p className="text-xs text-muted-foreground">Social Volume</p>
                            <p className="text-lg font-bold">{marketSentiment.socialVolume}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm text-muted-foreground">Loading market sentiment...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Trade Suggestions Tab */}
                {activeTab === 'suggestions' && (
                  <div className="h-full overflow-y-auto p-4 space-y-4">
                    {tradeSuggestions.length > 0 ? (
                      tradeSuggestions.map((suggestion) => (
                        <div key={suggestion.id} className="p-4 rounded-lg border border-border bg-muted/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              suggestion.type === 'buy' ? 'bg-green-500/20 text-green-600' :
                              suggestion.type === 'sell' ? 'bg-red-500/20 text-red-600' :
                              'bg-yellow-500/20 text-yellow-600'
                            }`}>
                              {suggestion.type.toUpperCase()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {Math.round(suggestion.confidence * 100)}% confidence
                            </span>
                          </div>
                          <p className="text-sm mb-2">{suggestion.reasoning}</p>
                          <p className="text-xs text-muted-foreground">
                            Expected: {suggestion.expectedOutcome}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm text-muted-foreground">No suggestions available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="h-full overflow-y-auto p-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium">Risk Tolerance</label>
                      <select
                        value={riskTolerance}
                        onChange={(e) => updateSettings({ riskTolerance: e.target.value as any })}
                        className="w-full mt-1 p-2 rounded-lg bg-background border border-border text-sm"
                      >
                        <option value="low">Conservative</option>
                        <option value="medium">Balanced</option>
                        <option value="high">Aggressive</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Auto Suggestions</label>
                      <button
                        onClick={() => updateSettings({ autoSuggestions: !autoSuggestions })}
                        className={`w-10 h-6 rounded-full transition-colors ${
                          autoSuggestions ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          autoSuggestions ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Voice Commands</label>
                      <button
                        onClick={() => updateSettings({ voiceEnabled: !voiceEnabled })}
                        className={`w-10 h-6 rounded-full transition-colors ${
                          voiceEnabled ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          voiceEnabled ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    <button
                      onClick={clearChat}
                      className="w-full p-2 rounded-lg bg-red-500/20 text-red-600 hover:bg-red-500/30 transition-colors text-sm"
                    >
                      Clear Chat History
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
