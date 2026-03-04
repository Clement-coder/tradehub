-- AI Trading Assistant Schema
-- Stores AI interactions, preferences, and trading insights

-- AI Chat History
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  privy_user_id text NOT NULL,
  message text NOT NULL,
  response text NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('text', 'voice', 'trade_suggestion', 'market_analysis')),
  sentiment_score numeric(3,2), -- -1.00 to 1.00
  confidence_level numeric(3,2), -- 0.00 to 1.00
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- AI User Preferences
CREATE TABLE IF NOT EXISTS public.ai_user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  privy_user_id text NOT NULL,
  voice_enabled boolean NOT NULL DEFAULT true,
  auto_suggestions boolean NOT NULL DEFAULT true,
  risk_tolerance text NOT NULL DEFAULT 'medium' CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  preferred_analysis_depth text NOT NULL DEFAULT 'standard' CHECK (preferred_analysis_depth IN ('basic', 'standard', 'advanced')),
  notification_preferences jsonb DEFAULT '{"price_alerts": true, "sentiment_changes": true, "trade_suggestions": true}',
  trading_style text DEFAULT 'balanced' CHECK (trading_style IN ('conservative', 'balanced', 'aggressive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Market Sentiment Cache
CREATE TABLE IF NOT EXISTS public.market_sentiment_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  sentiment_score numeric(3,2) NOT NULL, -- -1.00 to 1.00
  fear_greed_index integer, -- 0-100
  social_volume integer,
  news_sentiment numeric(3,2),
  whale_activity_score numeric(3,2),
  data_sources jsonb, -- Track which APIs provided data
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(symbol, created_at)
);

-- AI Trade Suggestions
CREATE TABLE IF NOT EXISTS public.ai_trade_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  privy_user_id text NOT NULL,
  symbol text NOT NULL,
  suggestion_type text NOT NULL CHECK (suggestion_type IN ('buy', 'sell', 'hold', 'stop_loss', 'take_profit')),
  suggested_price numeric(20,8),
  current_price numeric(20,8) NOT NULL,
  confidence_score numeric(3,2) NOT NULL, -- 0.00 to 1.00
  reasoning text NOT NULL,
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  expected_outcome text,
  time_horizon text CHECK (time_horizon IN ('short', 'medium', 'long')),
  is_executed boolean DEFAULT false,
  executed_at timestamptz,
  actual_outcome numeric(10,4), -- Actual profit/loss percentage
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_id ON public.ai_chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_privy_user_id ON public.ai_chat_history(privy_user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_created_at ON public.ai_chat_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_message_type ON public.ai_chat_history(message_type);

CREATE INDEX IF NOT EXISTS idx_ai_user_preferences_user_id ON public.ai_user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_user_preferences_privy_user_id ON public.ai_user_preferences(privy_user_id);

CREATE INDEX IF NOT EXISTS idx_market_sentiment_cache_symbol ON public.market_sentiment_cache(symbol);
CREATE INDEX IF NOT EXISTS idx_market_sentiment_cache_expires_at ON public.market_sentiment_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_market_sentiment_cache_created_at ON public.market_sentiment_cache(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_trade_suggestions_user_id ON public.ai_trade_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_trade_suggestions_privy_user_id ON public.ai_trade_suggestions(privy_user_id);
CREATE INDEX IF NOT EXISTS idx_ai_trade_suggestions_symbol ON public.ai_trade_suggestions(symbol);
CREATE INDEX IF NOT EXISTS idx_ai_trade_suggestions_created_at ON public.ai_trade_suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_trade_suggestions_expires_at ON public.ai_trade_suggestions(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_trade_suggestions_is_executed ON public.ai_trade_suggestions(is_executed);

-- Enable RLS
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_sentiment_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_trade_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "ai_chat_history_select_own" ON public.ai_chat_history
    FOR SELECT USING (auth.uid()::text = privy_user_id);

CREATE POLICY "ai_chat_history_insert_own" ON public.ai_chat_history
    FOR INSERT WITH CHECK (auth.uid()::text = privy_user_id);

CREATE POLICY "ai_user_preferences_select_own" ON public.ai_user_preferences
    FOR SELECT USING (auth.uid()::text = privy_user_id);

CREATE POLICY "ai_user_preferences_insert_own" ON public.ai_user_preferences
    FOR INSERT WITH CHECK (auth.uid()::text = privy_user_id);

CREATE POLICY "ai_user_preferences_update_own" ON public.ai_user_preferences
    FOR UPDATE USING (auth.uid()::text = privy_user_id);

CREATE POLICY "market_sentiment_cache_select_all" ON public.market_sentiment_cache
    FOR SELECT USING (true); -- Public data, everyone can read

CREATE POLICY "ai_trade_suggestions_select_own" ON public.ai_trade_suggestions
    FOR SELECT USING (auth.uid()::text = privy_user_id);

CREATE POLICY "ai_trade_suggestions_insert_own" ON public.ai_trade_suggestions
    FOR INSERT WITH CHECK (auth.uid()::text = privy_user_id);

CREATE POLICY "ai_trade_suggestions_update_own" ON public.ai_trade_suggestions
    FOR UPDATE USING (auth.uid()::text = privy_user_id);

-- Cleanup function for expired data
CREATE OR REPLACE FUNCTION cleanup_expired_ai_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Clean up expired market sentiment cache
    DELETE FROM public.market_sentiment_cache 
    WHERE expires_at < now();
    
    -- Clean up expired trade suggestions
    DELETE FROM public.ai_trade_suggestions 
    WHERE expires_at < now() AND is_executed = false;
    
    -- Clean up old chat history (keep last 30 days)
    DELETE FROM public.ai_chat_history 
    WHERE created_at < now() - interval '30 days';
END;
$$;

-- Comments
COMMENT ON TABLE public.ai_chat_history IS 'Stores all AI assistant conversations and interactions';
COMMENT ON TABLE public.ai_user_preferences IS 'User preferences for AI assistant behavior';
COMMENT ON TABLE public.market_sentiment_cache IS 'Cached market sentiment data from various sources';
COMMENT ON TABLE public.ai_trade_suggestions IS 'AI-generated trading suggestions and their outcomes';

COMMENT ON COLUMN public.ai_chat_history.sentiment_score IS 'Message sentiment from -1.00 (negative) to 1.00 (positive)';
COMMENT ON COLUMN public.ai_chat_history.confidence_level IS 'AI confidence in response from 0.00 to 1.00';
COMMENT ON COLUMN public.market_sentiment_cache.fear_greed_index IS 'Fear & Greed Index value 0-100';
COMMENT ON COLUMN public.ai_trade_suggestions.confidence_score IS 'AI confidence in suggestion from 0.00 to 1.00';
COMMENT ON COLUMN public.ai_trade_suggestions.actual_outcome IS 'Actual profit/loss percentage if executed';
