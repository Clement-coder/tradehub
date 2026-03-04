import Decimal from 'decimal.js';
import { pricingService, ConversionResult } from './pricing-service';

export interface WithdrawalCalculation {
  withdrawal_amount: string;
  withdrawal_currency: string;
  equivalent_amounts: ConversionResult[];
  total_portfolio_value: {
    usd: string;
    fiat: string;
    currency: string;
  };
  fees: {
    network_fee: string;
    platform_fee: string;
    total_fee: string;
    currency: string;
  };
  final_amount: string;
  exchange_rates_snapshot: string; // JSON string of all rates used
}

export interface BankWithdrawalRequest {
  user_id: string;
  asset_symbol: string;
  asset_amount: string;
  target_currency: string;
  bank_details: {
    account_number: string;
    routing_number: string;
    bank_name: string;
  };
}

class WithdrawalService {
  private readonly PLATFORM_FEE_RATE = new Decimal('0.005'); // 0.5%
  private readonly MIN_WITHDRAWAL = new Decimal('10'); // $10 minimum

  async calculateWithdrawal(
    assetAmount: string,
    assetSymbol: string,
    targetCurrency: string,
    allBalances: Array<{ amount: string; symbol: string }>
  ): Promise<WithdrawalCalculation> {
    // Get conversion for withdrawal amount
    const withdrawalConversion = await pricingService.convertToFiat(
      assetAmount,
      assetSymbol,
      targetCurrency
    );

    // Get all balance equivalents
    const portfolioData = await pricingService.convertMultipleBalances(
      allBalances,
      targetCurrency
    );

    // Calculate fees
    const withdrawalFiat = new Decimal(withdrawalConversion.fiat_equivalent);
    const platformFee = withdrawalFiat.mul(this.PLATFORM_FEE_RATE);
    const networkFee = await this.getNetworkFee(assetSymbol, targetCurrency);
    const totalFee = platformFee.add(networkFee);
    const finalAmount = withdrawalFiat.sub(totalFee);

    // Validate minimum withdrawal
    if (finalAmount.lt(this.MIN_WITHDRAWAL)) {
      throw new Error(`Minimum withdrawal is ${this.MIN_WITHDRAWAL} ${targetCurrency}`);
    }

    return {
      withdrawal_amount: new Decimal(assetAmount).toFixed(8),
      withdrawal_currency: assetSymbol.toUpperCase(),
      equivalent_amounts: [withdrawalConversion],
      total_portfolio_value: {
        usd: portfolioData.total_usd,
        fiat: portfolioData.total_fiat,
        currency: targetCurrency.toUpperCase(),
      },
      fees: {
        network_fee: networkFee.toFixed(2),
        platform_fee: platformFee.toFixed(2),
        total_fee: totalFee.toFixed(2),
        currency: targetCurrency.toUpperCase(),
      },
      final_amount: finalAmount.toFixed(2),
      exchange_rates_snapshot: JSON.stringify({
        timestamp: new Date().toISOString(),
        rates: portfolioData.conversions.map(c => ({
          symbol: c.asset_symbol,
          usd_price: c.price_snapshot.usd_price,
          fiat_rate: c.exchange_rate,
          source: c.price_snapshot.source,
        })),
      }),
    };
  }

  private async getNetworkFee(assetSymbol: string, targetCurrency: string): Promise<Decimal> {
    // Network fees in USD equivalent
    const networkFees: Record<string, string> = {
      BTC: '2.50',
      ETH: '1.50',
      USDC: '1.00',
      USDT: '1.00',
    };

    const feeUsd = networkFees[assetSymbol.toUpperCase()] || '2.00';
    
    if (targetCurrency.toUpperCase() === 'USD') {
      return new Decimal(feeUsd);
    }

    // Convert to target currency
    const fiatRate = await pricingService.getFiatRate(targetCurrency);
    return new Decimal(feeUsd).mul(new Decimal(fiatRate));
  }

  async processWithdrawal(request: BankWithdrawalRequest): Promise<{
    transaction_id: string;
    calculation: WithdrawalCalculation;
    status: 'pending' | 'processing' | 'completed' | 'failed';
  }> {
    // Get user's current balances (this would come from your wallet service)
    const userBalances = await this.getUserBalances(request.user_id);
    
    // Calculate withdrawal details
    const calculation = await this.calculateWithdrawal(
      request.asset_amount,
      request.asset_symbol,
      request.target_currency,
      userBalances
    );

    // Create transaction record with price snapshot
    const transactionId = await this.createWithdrawalTransaction({
      user_id: request.user_id,
      asset_amount: calculation.withdrawal_amount,
      asset_symbol: calculation.withdrawal_currency,
      fiat_amount: calculation.final_amount,
      fiat_currency: calculation.total_portfolio_value.currency,
      exchange_rates: calculation.exchange_rates_snapshot,
      bank_details: request.bank_details,
      fees: calculation.fees,
    });

    return {
      transaction_id: transactionId,
      calculation,
      status: 'pending',
    };
  }

  private async getUserBalances(userId: string): Promise<Array<{ amount: string; symbol: string }>> {
    // This would integrate with your wallet service
    // For now, return mock data
    return [
      { amount: '0.5', symbol: 'BTC' },
      { amount: '2.0', symbol: 'ETH' },
      { amount: '1000', symbol: 'USDC' },
    ];
  }

  private async createWithdrawalTransaction(data: {
    user_id: string;
    asset_amount: string;
    asset_symbol: string;
    fiat_amount: string;
    fiat_currency: string;
    exchange_rates: string;
    bank_details: any;
    fees: any;
  }): Promise<string> {
    // This would integrate with your transaction service
    // Store the complete price snapshot for historical accuracy
    const transactionId = `withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In a real implementation, you'd save this to your database
    console.log('Creating withdrawal transaction:', {
      id: transactionId,
      ...data,
    });

    return transactionId;
  }

  // Method to get historical conversion for old transactions
  async getHistoricalConversion(
    transactionId: string,
    exchangeRatesSnapshot: string
  ): Promise<ConversionResult> {
    const snapshot = JSON.parse(exchangeRatesSnapshot);
    
    // Use stored rates instead of live prices for historical accuracy
    return {
      asset_amount: snapshot.asset_amount,
      asset_symbol: snapshot.asset_symbol,
      usd_equivalent: snapshot.usd_equivalent,
      fiat_equivalent: snapshot.fiat_equivalent,
      fiat_currency: snapshot.fiat_currency,
      price_snapshot: {
        asset_symbol: snapshot.asset_symbol,
        usd_price: snapshot.rates[0].usd_price,
        timestamp: snapshot.timestamp,
        source: snapshot.rates[0].source,
      },
      exchange_rate: snapshot.rates[0].fiat_rate,
    };
  }
}

export const withdrawalService = new WithdrawalService();
