
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, DollarSign, AlertCircle, Shield, Clock, ArrowLeft } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PayStackService } from "@/services/paystackService";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import type { PaymentMethod, Currency } from "./PaymentMethodSelector";

interface EnhancedPaymentFormProps {
  type: 'deposit' | 'withdrawal';
  method: PaymentMethod;
  currency: Currency;
  onSuccess?: () => void;
  onCancel?: () => void;
  onBack?: () => void;
}

export const EnhancedPaymentForm = ({ 
  type, 
  method, 
  currency, 
  onSuccess, 
  onCancel, 
  onBack 
}: EnhancedPaymentFormProps) => {
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const { wallet, refetch } = useWallet();
  const { isMobile } = useResponsiveLayout();

  const currencyConfig = {
    usd: { symbol: '$', min: 1.00, multiplier: 100, name: 'USD' },
    ngn: { symbol: '₦', min: 100.00, multiplier: 1, name: 'NGN' },
  };

  const config = currencyConfig[currency];
  const amountInSmallestUnit = Math.round(parseFloat(amount) * config.multiplier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) < config.min) {
      toast({
        title: "Invalid Amount",
        description: `Minimum amount is ${config.symbol}${config.min}`,
        variant: "destructive"
      });
      return;
    }

    if (type === 'withdrawal' && wallet && amountInSmallestUnit > wallet.balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    try {
      if (method === 'paystack' && currency === 'ngn') {
        await handlePayStackPayment();
      } else {
        await handleStripePayment();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handlePayStackPayment = async () => {
    if (!wallet) return;

    const reference = PayStackService.generateReference();
    
    const paymentData = {
      email: wallet.user_id, // This should be the user's email
      amount: amountInSmallestUnit,
      currency: 'NGN' as const,
      reference,
      metadata: {
        user_id: wallet.user_id,
        transaction_type: type,
        wallet_id: wallet.id,
      }
    };

    const response = await PayStackService.initializePayment(paymentData);
    
    if (response.authorization_url) {
      // Open PayStack checkout
      window.open(response.authorization_url, '_blank');
      
      toast({
        title: "Redirecting to PayStack",
        description: "Complete your payment in the new tab that opened",
      });

      onSuccess?.();
    }
  };

  const handleStripePayment = async () => {
    const { data, error } = await supabase.functions.invoke('create-payment-session', {
      body: {
        amount: amountInSmallestUnit,
        currency: currency,
        type: type,
        description: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} - ${config.symbol}${amount}`,
      },
    });

    if (error) throw error;

    if (data.url) {
      window.open(data.url, '_blank');
      
      toast({
        title: "Redirecting to Stripe",
        description: "Complete your payment in the new tab that opened",
      });

      onSuccess?.();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <div className="flex-1 text-center">
          <h2 className="text-xl font-bold text-white">
            {type === 'deposit' ? 'Add Funds' : 'Withdraw Funds'}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Using {method === 'paystack' ? 'PayStack' : 'Stripe'} • {config.name}
          </p>
        </div>
      </div>

      {/* Payment Form */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-blue-400" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-gray-300 font-medium">
                Amount ({config.name})
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  step={currency === 'usd' ? "0.01" : "1"}
                  min={config.min}
                  max={type === 'withdrawal' && wallet ? (wallet.balance / config.multiplier).toString() : undefined}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`${config.min}`}
                  className={`
                    bg-black/20 border-gray-600 text-white pl-10 h-12
                    focus:border-blue-500 focus:ring-blue-500/20
                    ${isMobile ? 'text-lg' : 'text-base'}
                  `}
                  required
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Minimum: {config.symbol}{config.min}
                </span>
                {type === 'withdrawal' && wallet && (
                  <span className="text-blue-400">
                    Available: {config.symbol}{(wallet.balance / config.multiplier).toFixed(currency === 'usd' ? 2 : 0)}
                  </span>
                )}
              </div>
            </div>

            {/* Payment Method Info */}
            <div className={`
              p-4 rounded-lg border
              ${method === 'paystack' ? 'bg-green-900/20 border-green-700/30' : 'bg-blue-900/20 border-blue-700/30'}
            `}>
              <div className="flex items-start space-x-3">
                <div className={`
                  p-2 rounded-full
                  ${method === 'paystack' ? 'bg-green-600/20' : 'bg-blue-600/20'}
                `}>
                  <Shield className={`
                    h-4 w-4
                    ${method === 'paystack' ? 'text-green-400' : 'text-blue-400'}
                  `} />
                </div>
                <div className="flex-1">
                  <h4 className={`
                    font-medium mb-1
                    ${method === 'paystack' ? 'text-green-300' : 'text-blue-300'}
                  `}>
                    {method === 'paystack' ? 'PayStack Secure Payment' : 'Stripe Secure Payment'}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {method === 'paystack' 
                      ? 'Local Nigerian payment processing with bank transfer, cards, and USSD support.'
                      : 'International payment processing with bank-level security.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Processing Time Info */}
            {type === 'withdrawal' && (
              <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                  <p className="text-xs text-yellow-300">
                    Withdrawals are processed within 1-3 business days to your linked account.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className={`flex gap-3 ${isMobile ? 'flex-col' : 'flex-row'}`}>
              <Button
                type="submit"
                disabled={processing || !amount}
                className={`
                  flex-1 h-12 text-base font-medium transition-all duration-200
                  ${type === 'deposit' 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
                    : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                  }
                `}
              >
                {processing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `${type === 'deposit' ? 'Deposit' : 'Withdraw'} ${config.symbol}${amount || '0.00'}`
                )}
              </Button>
              
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={processing}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 h-12"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
