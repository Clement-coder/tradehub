// Mock data utilities for dummy trading data

export function generateMockWalletAddress(): string {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return address;
}

export function generateMockChartData() {
  const basePrice = 43000;
  const data = [];
  let price = basePrice;

  for (let i = 0; i < 48; i++) {
    // Generate hourly data for 2 days
    const change = (Math.random() - 0.5) * 500;
    price = Math.max(price + change, 40000);
    data.push({
      time: new Date(Date.now() - (48 - i) * 3600000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      price: Math.round(price),
      change: price - basePrice,
    });
  }

  return data;
}

export function simulatePriceMovement(currentPrice: number): number {
  const change = (Math.random() - 0.5) * 200;
  return Math.round(Math.max(currentPrice + change, 40000));
}

export function formatCurrency(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPrice(price: number): string {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function calculatePnL(entryPrice: number, currentPrice: number, quantity: number) {
  const pnl = (currentPrice - entryPrice) * quantity;
  const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
  return { pnl, pnlPercent };
}
