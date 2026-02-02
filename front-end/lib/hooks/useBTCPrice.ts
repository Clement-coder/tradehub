'use client';

import { useQuery } from '@tanstack/react-query';

const fetchBTCPrice = async () => {
  const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.bitcoin.usd;
};

export function useBTCPrice() {
  return useQuery({
    queryKey: ['btc-price'],
    queryFn: fetchBTCPrice,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}
