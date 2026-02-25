'use client';

import { useEffect, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ComposedChart, Bar } from 'recharts';
import { GlassCard } from '@/components/glass-card';
import { useTradingContext } from '@/app/context/trading-context';
import { TrendingUp, BarChart3, LineChart as LineChartIcon } from 'lucide-react';

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

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">BTC/USD</h2>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            isUpTrend ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
          }`}>
            {isUpTrend ? '+' : ''}{priceChange.toFixed(0)} ({percentChange.toFixed(2)}%)
          </div>
        </div>
        <div className="flex items-center gap-3">
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
              <LineChartIcon className="w-4 h-4" />
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
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
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
      </div>

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
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
    </GlassCard>
  );
}
