'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    // Initialize chart data
    const basePrice = 43000;
    let price = basePrice;
    const data: ChartDataPoint[] = [];

    for (let i = 0; i < 48; i++) {
      const change = (Math.random() - 0.5) * 400;
      price = Math.max(price + change, 40000);
      const hour = (i - 48 + 24) % 24;
      data.push({
        time: `${String(hour).padStart(2, '0')}:00`,
        price: Math.round(price),
      });
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

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">BTC/USD</h2>
        <span className="text-sm text-muted-foreground ml-auto">24h Chart</span>
      </div>

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="time"
              stroke="rgba(0,0,0,0.3)"
              style={{ fontSize: 12 }}
              tick={{ fill: 'rgba(0,0,0,0.5)' }}
            />
            <YAxis
              stroke="rgba(0,0,0,0.3)"
              style={{ fontSize: 12 }}
              tick={{ fill: 'rgba(0,0,0,0.5)' }}
              domain={['dataMin - 500', 'dataMax + 500']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
              }}
              formatter={(value) => [`$${value}`, 'Price']}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#50c878"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </GlassCard>
  );
}
