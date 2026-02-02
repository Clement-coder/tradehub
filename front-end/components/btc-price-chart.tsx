'use client';

import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const fetchBTCHistorical = async () => {
  const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.prices.map((price: [number, number]) => ({
    time: new Date(price[0]).toLocaleTimeString(),
    price: price[1],
  }));
};

export function BtcPriceChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['btc-historical'],
    queryFn: fetchBTCHistorical,
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  if (isLoading) return <div>Loading chart...</div>;
  if (isError) return <div>Error loading chart data</div>;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
          <Tooltip />
          <Area type="monotone" dataKey="price" stroke="#8884d8" fillOpacity={1} fill="url(#colorPrice)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
