import Image from 'next/image';

interface CurrencyDisplayProps {
  amount: number;
  currency?: 'USDC' | string;
  showSymbol?: boolean;
  className?: string;
  logoSize?: number;
}

const CURRENCY_CONFIG = {
  USDC: {
    logo: '/usdc-logo.svg',
    symbol: 'USDC',
  },
};

const formatCurrency = (value: number) =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function CurrencyDisplay({ 
  amount, 
  currency = 'USDC', 
  showSymbol = false,
  className = '',
  logoSize = 16
}: CurrencyDisplayProps) {
  const config = CURRENCY_CONFIG[currency as keyof typeof CURRENCY_CONFIG];

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {config && <Image src={config.logo} alt={currency} width={logoSize} height={logoSize} className="flex-shrink-0" />}
      <span>{formatCurrency(amount)}</span>
      {showSymbol && config && <span className="text-muted-foreground text-xs">{config.symbol}</span>}
    </span>
  );
}
