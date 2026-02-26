'use client';

import { useEffect, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ComposedChart, Bar } from 'recharts';
import { GlassCard } from '@/components/glass-card';
import { useTradingContext } from '@/app/context/trading-context';
import { TrendingUp, BarChart3, LineChart as LineChartIcon, Maximize2, X, Menu } from 'lucide-react';
import TradingInterface from './trading-interface';

interface ChartDataPoint {
  time: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

export default function TradingChart() {
  const { currentPrice, updatePrice } = useTradingContext();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1H' | '4H' | '1D' | '1W'>('1m');
  const [historicalData, setHistoricalData] = useState<ChartDataPoint[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTradingPanel, setShowTradingPanel] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Initialize 24 hours of historical data
    const basePrice = 43000;
    let price = basePrice;
    const data: ChartDataPoint[] = [];
    const now = new Date();
    
    // Generate 24 hours of data (1 point per second = 86400 points)
    for (let i = 0; i < 86400; i++) {
      const change = (Math.random() - 0.5) * 100;
      const newPrice = Math.max(price + change, 40000);
      const time = new Date(now.getTime() - (86400 - i) * 1000);
      const open = price;
      const close = newPrice;
      const high = Math.max(open, close) + Math.random() * 50;
      const low = Math.min(open, close) - Math.random() * 50;
      
      data.push({
        time: time.toISOString(),
        price: Math.round(newPrice),
        open: Math.round(open),
        high: Math.round(high),
        low: Math.round(low),
        close: Math.round(close),
      });
      price = newPrice;
    }

    setHistoricalData(data);
  }, []);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const prevPrice = currentPrice;
      const newPrice = Math.round(currentPrice + (Math.random() - 0.5) * 100);
      updatePrice(newPrice);
      
      const now = new Date();
      const open = prevPrice;
      const close = newPrice;
      const high = Math.max(open, close) + Math.random() * 50;
      const low = Math.min(open, close) - Math.random() * 50;
      
      const newPoint = { 
        time: now.toISOString(), 
        price: newPrice,
        open: Math.round(open),
        high: Math.round(high),
        low: Math.round(low),
        close: Math.round(close),
      };
      
      setHistoricalData(prev => {
        const updated = [...prev, newPoint];
        return updated.slice(-86400); // Keep 24 hours
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPrice, updatePrice]);

  // Aggregate data based on timeframe
  useEffect(() => {
    if (historicalData.length === 0) return;

    const aggregateData = (data: ChartDataPoint[], intervalSeconds: number) => {
      const aggregated: ChartDataPoint[] = [];
      for (let i = 0; i < data.length; i += intervalSeconds) {
        const chunk = data.slice(i, i + intervalSeconds);
        if (chunk.length === 0) continue;
        
        aggregated.push({
          time: chunk[0].time,
          price: chunk[chunk.length - 1].price,
          open: chunk[0].open || chunk[0].price,
          high: Math.max(...chunk.map(d => d.high || d.price)),
          low: Math.min(...chunk.map(d => d.low || d.price)),
          close: chunk[chunk.length - 1].close || chunk[chunk.length - 1].price,
        });
      }
      return aggregated;
    };

    const formatTime = (isoTime: string, tf: string) => {
      const date = new Date(isoTime);
      if (tf === '1W' || tf === '1D') {
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
      }
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      const s = String(date.getSeconds()).padStart(2, '0');
      return tf === '1m' ? `${h}:${m}:${s}` : `${h}:${m}`;
    };

    let displayData: ChartDataPoint[] = [];
    
    switch (timeframe) {
      case '1m':
        displayData = aggregateData(historicalData.slice(-60), 1);
        break;
      case '5m':
        displayData = aggregateData(historicalData.slice(-300), 5);
        break;
      case '15m':
        displayData = aggregateData(historicalData.slice(-900), 15);
        break;
      case '1H':
        displayData = aggregateData(historicalData.slice(-3600), 60); // 60 candles, 1 min each
        break;
      case '4H':
        displayData = aggregateData(historicalData.slice(-14400), 240); // 60 candles, 4 min each
        break;
      case '1D':
        displayData = aggregateData(historicalData.slice(-86400), 1440); // 60 candles, 24 min each
        break;
      case '1W':
        displayData = aggregateData(historicalData, 10080); // All data, 168 min candles
        break;
    }

    setChartData(displayData.map(d => ({ ...d, time: formatTime(d.time, timeframe) })));
  }, [historicalData, timeframe]);

  const startPrice = chartData[0]?.price || 0;
  const endPrice = chartData[chartData.length - 1]?.price || 0;
  const isUpTrend = endPrice > startPrice;
  const priceChange = endPrice - startPrice;
  const percentChange = startPrice > 0 ? ((priceChange / startPrice) * 100) : 0;

  const timeframeLabels = {
    '1m': 'Last 1 minute',
    '5m': 'Last 5 minutes',
    '15m': 'Last 15 minutes',
    '1H': '1 Hour',
    '4H': '4 Hours',
    '1D': '1 Day',
    '1W': '1 Week',
  };

  const chartContent = (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-1">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-orange-500">
              <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">BTC/USD</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Updated: {new Date().toLocaleTimeString()}</p>
            <div className={`inline-flex px-2 py-0.5 rounded text-xs font-medium mt-1 ${
              isUpTrend ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
            }`}>
              {isUpTrend ? '+' : ''}{priceChange.toFixed(0)} ({percentChange.toFixed(2)}%)
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded transition-colors ${
                chartType === 'line' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Line Chart"
            >
              <LineChartIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setChartType('candlestick')}
              className={`p-1.5 rounded transition-colors ${
                chartType === 'candlestick' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Candlestick Chart"
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
          
          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          
          {/* Desktop: Show all buttons */}
          <div className="hidden sm:flex gap-1">
            {(['1m', '5m', '15m', '1H', '4H', '1D', '1W'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  timeframe === tf
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          
          {/* Mobile: Custom Dropdown */}
          <div className="sm:hidden relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 text-foreground transition-all shadow-lg hover:bg-white/15 dark:hover:bg-white/10"
            >
              <span>{timeframeLabels[timeframe]}</span>
              <svg 
                className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-card/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {(['1m', '5m', '15m', '1H', '4H', '1D', '1W'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => {
                        setTimeframe(tf);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${
                        timeframe === tf
                          ? 'bg-primary/20 text-primary'
                          : 'text-foreground hover:bg-white/10'
                      }`}
                    >
                      {timeframeLabels[tf]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={isFullscreen ? '100%' : 300}>
          {chartType === 'line' ? (
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
              />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: 12 }}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: 12 }}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                domain={['dataMin - 500', 'dataMax + 500']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
                formatter={(value) => [`$${value}`, 'Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isUpTrend ? "#22c55e" : "#ef4444"}
                strokeWidth={2}
                fill={isUpTrend ? "url(#greenGradient)" : "url(#redGradient)"}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: isUpTrend ? "#22c55e" : "#ef4444",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2
                }}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </AreaChart>
          ) : (
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
              />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: 12 }}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: 12 }}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                domain={['dataMin - 500', 'dataMax + 500']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
                formatter={(value, name) => [`$${value}`, name === 'open' ? 'Open' : name === 'high' ? 'High' : name === 'low' ? 'Low' : 'Close']}
              />
              <Bar
                dataKey="high"
                fill="transparent"
                shape={(props: any) => {
                  const { x, y, width, payload } = props;
                  const isGreen = (payload.close || 0) >= (payload.open || 0);
                  const color = isGreen ? '#22c55e' : '#ef4444';
                  const centerX = x + width / 2;
                  const yScale = 300 / (Math.max(...chartData.map(d => d.high || 0)) - Math.min(...chartData.map(d => d.low || 0)));
                  const yMin = Math.min(...chartData.map(d => d.low || 0));
                  
                  const yHigh = y + (Math.max(...chartData.map(d => d.high || 0)) - payload.high) * yScale;
                  const yLow = y + (Math.max(...chartData.map(d => d.high || 0)) - payload.low) * yScale;
                  const yOpen = y + (Math.max(...chartData.map(d => d.high || 0)) - payload.open) * yScale;
                  const yClose = y + (Math.max(...chartData.map(d => d.high || 0)) - payload.close) * yScale;
                  const bodyTop = Math.min(yOpen, yClose);
                  const bodyHeight = Math.abs(yClose - yOpen) || 1;
                  
                  return (
                    <g>
                      <line x1={centerX} y1={yHigh} x2={centerX} y2={yLow} stroke={color} strokeWidth={1} />
                      <rect x={x + width * 0.2} y={bodyTop} width={width * 0.6} height={bodyHeight} fill={color} />
                    </g>
                  );
                }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      )}
    </>
  );

  return (
    <>
      <GlassCard className="p-4 sm:p-6">
        {chartContent}
      </GlassCard>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background">
          {/* Header */}
          <div className="h-16 border-b border-border bg-card/95 backdrop-blur-sm flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-orange-500">
                  <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.525 2.107c-.345-.087-.705-.167-1.064-.25l.526-2.127-1.32-.33-.54 2.165c-.285-.067-.565-.132-.84-.2l-1.815-.45-.35 1.407s.975.225.955.236c.535.136.63.486.615.766l-1.477 5.92c-.075.166-.24.406-.614.314.015.02-.96-.24-.96-.24l-.66 1.51 1.71.426.93.242-.54 2.19 1.32.327.54-2.17c.36.1.705.19 1.05.273l-.51 2.154 1.32.33.545-2.19c2.24.427 3.93.257 4.64-1.774.57-1.637-.03-2.58-1.217-3.196.854-.193 1.5-.76 1.68-1.93h.01zm-3.01 4.22c-.404 1.64-3.157.75-4.05.53l.72-2.9c.896.23 3.757.67 3.33 2.37zm.41-4.24c-.37 1.49-2.662.735-3.405.55l.654-2.64c.744.18 3.137.524 2.75 2.084v.006z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">BTC/USD</h2>
                <p className="text-xs text-muted-foreground">${currentPrice.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile Trade Button */}
              <button
                onClick={() => setShowTradingPanel(true)}
                className="lg:hidden p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                title="Open Trading Panel"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-lg hover:bg-muted transition-all hover:rotate-90 duration-300"
                title="Close Fullscreen"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
            {/* Chart Section */}
            <div className="flex-1 p-4 lg:p-6 flex flex-col overflow-y-auto">
              <div className="flex-1 bg-card/50 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-border">
                {chartContent}
              </div>
            </div>

            {/* Trading Panel - Desktop (hidden on mobile) */}
            <div className="hidden lg:block w-[400px] p-6 border-l border-border bg-card/30 backdrop-blur-sm overflow-y-auto">
              <TradingInterface />
            </div>
          </div>

          {/* Trading Panel - Mobile Slide-in */}
          {showTradingPanel && (
            <>
              {/* Backdrop */}
              <div 
                className="lg:hidden fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-300"
                onClick={() => setShowTradingPanel(false)}
              />
              
              {/* Slide-in Panel */}
              <div className="lg:hidden fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-background z-50 overflow-y-auto animate-in slide-in-from-right duration-300 shadow-2xl">
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between z-10">
                  <h3 className="text-lg font-semibold">Trade BTC</h3>
                  <button
                    onClick={() => setShowTradingPanel(false)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <TradingInterface />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideInFromTop {
          from {
            transform: translateY(-8px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-in {
          animation: fadeIn 0.3s ease-out;
        }
        .slide-in-from-right {
          animation: slideInFromRight 0.5s ease-out;
        }
        .slide-in-from-top-2 {
          animation: slideInFromTop 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
