'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { GlassCard } from '@/components/glass-card';
import { useTradingContext } from '@/app/context/trading-context';
import { TrendingUp } from 'lucide-react';

interface ChartDataPoint {
  time: string;
  price: number;
}

export default function TradingChart() {
  const { currentPrice, updatePrice } = useTradingContext();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    // Initialize chart data with realistic price movements
    const basePrice = 43000;
    let price = basePrice;
    const data: ChartDataPoint[] = [];

    for (let i = 0; i < 48; i++) {
      const change = (Math.random() - 0.5) * 400;
      const newPrice = Math.max(price + change, 40000);
      const hour = (i - 48 + 24) % 24;
      data.push({
        time: `${String(hour).padStart(2, '0')}:00`,
        price: Math.round(newPrice),
      });
      price = newPrice;
    }

    setChartData(data);
  }, []);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      updatePrice(Math.round(currentPrice + (Math.random() - 0.5) * 300));
    }, 5000);

    return () => clearInterval(interval);
  }, [currentPrice, updatePrice]);

  // Calculate overall trend
  const startPrice = chartData[0]?.price || 0;
  const endPrice = chartData[chartData.length - 1]?.price || 0;
  const isUpTrend = endPrice > startPrice;
  const priceChange = endPrice - startPrice;
  const percentChange = startPrice > 0 ? ((priceChange / startPrice) * 100) : 0;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">BTC/USD</h2>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            isUpTrend ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
          }`}>
            {isUpTrend ? '+' : ''}{priceChange.toFixed(0)} ({percentChange.toFixed(2)}%)
          </div>
        </div>
        <span className="text-sm text-muted-foreground">24h Chart</span>
      </div>

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
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
        </ResponsiveContainer>
      )}
    </GlassCard>
  );
}
