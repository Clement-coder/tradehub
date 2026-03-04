import Decimal from 'decimal.js';

// Configure Decimal for financial precision
Decimal.config({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -7,
  toExpPos: 21,
});

export interface PriceSnapshot {
  asset_symbol: string;
  usd_price: string; // Decimal string
  timestamp: string;
  source: 'coingecko' | 'fallback';
}

export interface ConversionResult {
  asset_amount: string;
  asset_symbol: string;
  usd_equivalent: string;
  fiat_equivalent: string;
  fiat_currency: string;
  price_snapshot: PriceSnapshot;
  exchange_rate: string; // USD to fiat rate
}

class PricingService {
  private cache = new Map<string, { price: PriceSnapshot; expires: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds
  private readonly RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000;

  // CoinGecko token IDs (not symbols)
  private readonly TOKEN_IDS = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    USDC: 'usd-coin',
    USDT: 'tether',
  };

  private readonly FIAT_RATES_API = 'https://api.exchangerate-api.com/v4/latest/USD';

  async getPrice(symbol: string): Promise<PriceSnapshot> {
    const cacheKey = symbol.toUpperCase();
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      return cached.price;
    }

    const price = await this.fetchPriceWithRetry(symbol);
    this.cache.set(cacheKey, { price, expires: Date.now() + this.CACHE_TTL });
    return price;
  }

  private async fetchPriceWithRetry(symbol: string): Promise<PriceSnapshot> {
    for (let attempt = 1; attempt <= this.RETRY_ATTEMPTS; attempt++) {
      try {
        return await this.fetchPrice(symbol);
      } catch (error) {
        if (attempt === this.RETRY_ATTEMPTS) {
          return await this.fetchFallbackPrice(symbol);
        }
        await this.delay(this.RETRY_DELAY * attempt);
      }
    }
    throw new Error(`Failed to fetch price for ${symbol}`);
  }

  private async fetchPrice(symbol: string): Promise<PriceSnapshot> {
    const tokenId = this.TOKEN_IDS[symbol.toUpperCase() as keyof typeof this.TOKEN_IDS];
    if (!tokenId) throw new Error(`Unsupported token: ${symbol}`);

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&precision=8&include_last_updated_at=true`,
      { 
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'TradeHub/1.0'
        },
        cache: 'no-cache'
      }
    );

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} - ${response.statusText}`);
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    const priceData = data[tokenId];
    
    if (!priceData?.usd) {
      console.error(`No price data for ${symbol}:`, data);
      throw new Error(`No price data for ${symbol}`);
    }

    console.log(`Fetched ${symbol} price: $${priceData.usd} from CoinGecko`);

    return {
      asset_symbol: symbol.toUpperCase(),
      usd_price: new Decimal(priceData.usd).toFixed(8),
      timestamp: priceData.last_updated_at ? new Date(priceData.last_updated_at * 1000).toISOString() : new Date().toISOString(),
      source: 'coingecko',
    };
  }

  private async fetchFallbackPrice(symbol: string): Promise<PriceSnapshot> {
    // Fallback to CryptoCompare API
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/price?fsym=${symbol.toUpperCase()}&tsyms=USD`
    );
    
    if (!response.ok) throw new Error(`Fallback API error: ${response.status}`);
    
    const data = await response.json();
    const price = data.USD;
    
    if (!price) throw new Error(`No fallback price for ${symbol}`);

    return {
      asset_symbol: symbol.toUpperCase(),
      usd_price: new Decimal(price).toFixed(8),
      timestamp: new Date().toISOString(),
      source: 'fallback',
    };
  }

  async getFiatRate(currency: string): Promise<string> {
    if (currency.toUpperCase() === 'USD') return '1.00';
    
    const response = await fetch(this.FIAT_RATES_API);
    if (!response.ok) throw new Error(`Fiat rates API error: ${response.status}`);
    
    const data = await response.json();
    const rate = data.rates[currency.toUpperCase()];
    
    if (!rate) throw new Error(`No rate for ${currency}`);
    
    return new Decimal(rate).toFixed(2);
  }

  async convertToFiat(
    assetAmount: string,
    assetSymbol: string,
    fiatCurrency: string = 'USD'
  ): Promise<ConversionResult> {
    const [priceSnapshot, fiatRate] = await Promise.all([
      this.getPrice(assetSymbol),
      this.getFiatRate(fiatCurrency),
    ]);

    const amount = new Decimal(assetAmount);
    const usdPrice = new Decimal(priceSnapshot.usd_price);
    const exchangeRate = new Decimal(fiatRate);

    const usdEquivalent = amount.mul(usdPrice);
    const fiatEquivalent = usdEquivalent.mul(exchangeRate);

    return {
      asset_amount: amount.toFixed(8),
      asset_symbol: assetSymbol.toUpperCase(),
      usd_equivalent: usdEquivalent.toFixed(2),
      fiat_equivalent: fiatEquivalent.toFixed(2),
      fiat_currency: fiatCurrency.toUpperCase(),
      price_snapshot: priceSnapshot,
      exchange_rate: exchangeRate.toFixed(2),
    };
  }

  async convertMultipleBalances(
    balances: Array<{ amount: string; symbol: string }>,
    fiatCurrency: string = 'USD'
  ): Promise<{
    conversions: ConversionResult[];
    total_fiat: string;
    total_usd: string;
  }> {
    const conversions = await Promise.all(
      balances.map(({ amount, symbol }) =>
        this.convertToFiat(amount, symbol, fiatCurrency)
      )
    );

    const totalUsd = conversions.reduce(
      (sum, conv) => sum.add(new Decimal(conv.usd_equivalent)),
      new Decimal(0)
    );

    const totalFiat = conversions.reduce(
      (sum, conv) => sum.add(new Decimal(conv.fiat_equivalent)),
      new Decimal(0)
    );

    return {
      conversions,
      total_usd: totalUsd.toFixed(2),
      total_fiat: totalFiat.toFixed(2),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const pricingService = new PricingService();
