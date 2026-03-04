import Decimal from 'decimal.js';
import { withdrawalService, WithdrawalCalculation } from '../lib/withdrawal-service';
import { QRCodeSVG } from 'qrcode.react';

interface WithdrawalReceiptProps {
  calculation: WithdrawalCalculation;
  transactionId: string;
  timestamp: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bankDetails?: {
    account_number: string;
    routing_number: string;
    bank_name: string;
  };
}

export function WithdrawalReceipt({ 
  calculation, 
  transactionId, 
  timestamp, 
  status,
  bankDetails 
}: WithdrawalReceiptProps) {
  const formatCurrency = (amount: string, currency: string, decimals: number = 2) => {
    return new Decimal(amount).toFixed(decimals) + ' ' + currency;
  };

  const formatCrypto = (amount: string, symbol: string) => {
    return new Decimal(amount).toFixed(8) + ' ' + symbol;
  };

  // Create comprehensive QR code data
  const qrData = JSON.stringify({
    type: 'withdrawal_receipt',
    transaction_id: transactionId,
    timestamp: timestamp,
    status: status,
    withdrawal: {
      amount: calculation.withdrawal_amount,
      currency: calculation.withdrawal_currency,
      fiat_equivalent: calculation.final_amount,
      fiat_currency: calculation.total_portfolio_value.currency
    },
    rates: {
      usd_price: calculation.equivalent_amounts[0].price_snapshot.usd_price,
      exchange_rate: calculation.equivalent_amounts[0].exchange_rate,
      source: calculation.equivalent_amounts[0].price_snapshot.source,
      rate_timestamp: calculation.equivalent_amounts[0].price_snapshot.timestamp
    },
    fees: calculation.fees,
    verification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradehub.app'}/verify/${transactionId}`,
    hash: btoa(transactionId + timestamp + calculation.final_amount).slice(0, 16)
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Withdrawal Receipt</h2>
        <p className="text-sm text-gray-500">Transaction ID: {transactionId}</p>
        <p className="text-sm text-gray-500">{new Date(timestamp).toLocaleString()}</p>
      </div>

      <div className="space-y-4">
        {/* Status */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            status === 'completed' ? 'bg-green-100 text-green-800' :
            status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
            status === 'failed' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {/* Withdrawal Amount */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Withdrawal Amount:</span>
            <span className="font-medium">
              {formatCrypto(calculation.withdrawal_amount, calculation.withdrawal_currency)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Equivalent:</span>
            <span>
              {formatCurrency(
                calculation.equivalent_amounts[0].fiat_equivalent,
                calculation.total_portfolio_value.currency
              )}
            </span>
          </div>
        </div>

        {/* Live Rate Indicator */}
        <div className="flex justify-between items-center text-sm bg-green-50 p-2 rounded">
          <span className="text-gray-600">Live Rate (CoinGecko):</span>
          <div className="text-right">
            <div className="font-medium text-green-700">
              1 {calculation.withdrawal_currency} = {formatCurrency(
                calculation.equivalent_amounts[0].price_snapshot.usd_price,
                'USD'
              )}
            </div>
            <div className="text-xs text-green-600">
              Updated: {new Date(calculation.equivalent_amounts[0].price_snapshot.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Fees Breakdown */}
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-2">Fee Breakdown</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee (0.5%):</span>
              <span>{formatCurrency(calculation.fees.platform_fee, calculation.fees.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Network Fee:</span>
              <span>{formatCurrency(calculation.fees.network_fee, calculation.fees.currency)}</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-1">
              <span>Total Fees:</span>
              <span>{formatCurrency(calculation.fees.total_fee, calculation.fees.currency)}</span>
            </div>
          </div>
        </div>

        {/* Final Amount */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Final Amount:</span>
            <span className="text-green-600">
              {formatCurrency(calculation.final_amount, calculation.total_portfolio_value.currency)}
            </span>
          </div>
        </div>

        {/* Bank Details */}
        {bankDetails && (
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Bank Details</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Bank:</span>
                <span>{bankDetails.bank_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account:</span>
                <span>***{bankDetails.account_number.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Routing:</span>
                <span>{bankDetails.routing_number}</span>
              </div>
            </div>
          </div>
        )}

        {/* QR Code with Transaction Data */}
        <div className="border-t pt-4 text-center">
          <h3 className="font-medium text-gray-900 mb-3">Transaction QR Code</h3>
          <div className="flex justify-center mb-2">
            <QRCodeSVG
              value={qrData}
              size={120}
              level="M"
              includeMargin={true}
              className="border border-gray-200 rounded"
            />
          </div>
          <p className="text-xs text-gray-500">
            Scan to verify transaction details and rates
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-2">Portfolio Value</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total USD:</span>
              <span>{formatCurrency(calculation.total_portfolio_value.usd, 'USD')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total {calculation.total_portfolio_value.currency}:</span>
              <span>{formatCurrency(calculation.total_portfolio_value.fiat, calculation.total_portfolio_value.currency)}</span>
            </div>
          </div>
        </div>

        {/* Rate Source & Verification */}
        <div className="text-xs text-gray-400 text-center border-t pt-2 space-y-1">
          <div>
            Rates from: <span className="font-medium text-green-600">CoinGecko API</span> | 
            Live updates every 30s
          </div>
          <div>
            Rate snapshot: {new Date(calculation.equivalent_amounts[0].price_snapshot.timestamp).toLocaleString()}
          </div>
          <div className="font-mono">
            Verification: {btoa(transactionId + timestamp).slice(0, 12)}
          </div>
        </div>
      </div>
    </div>
  );
}
