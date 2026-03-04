'use client';

import { useState, useEffect } from 'react';
import { pricingService } from '../pricing-service';

// Hook to get live BTC price with CoinGecko integration
export function useLiveBTCPrice() {
  const [price, setPrice] = useState<{
    usd: string;
    timestamp: string;
    source: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchPrice = async () => {
      try {
        setLoading(true);
        const priceData = await pricingService.getPrice('BTC');
        setPrice({
          usd: priceData.usd_price,
          timestamp: priceData.timestamp,
          source: priceData.source,
        });
        setError(null);
        console.log(`BTC Price Updated: $${priceData.usd_price} from ${priceData.source}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch BTC price');
        console.error('BTC price fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchPrice();

    // Set up interval for live updates (every 30 seconds to respect rate limits)
    interval = setInterval(fetchPrice, 30000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return { price, loading, error };
}

// Hook for multiple currency rates
export function useLiveCurrencyRates(symbols: string[]) {
  const [rates, setRates] = useState<Record<string, {
    usd_price: string;
    timestamp: string;
    source: string;
  }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchRates = async () => {
      try {
        setLoading(true);
        const ratePromises = symbols.map(async (symbol) => {
          const priceData = await pricingService.getPrice(symbol);
          return [symbol, {
            usd_price: priceData.usd_price,
            timestamp: priceData.timestamp,
            source: priceData.source,
          }];
        });

        const results = await Promise.all(ratePromises);
        const ratesMap = Object.fromEntries(results);
        setRates(ratesMap);
        setError(null);
        
        console.log('Currency rates updated:', Object.keys(ratesMap).map(
          symbol => `${symbol}: $${ratesMap[symbol].usd_price}`
        ).join(', '));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch currency rates');
        console.error('Currency rates fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchRates();

    // Set up interval for live updates
    interval = setInterval(fetchRates, 30000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [symbols]);

  return { rates, loading, error };
}
