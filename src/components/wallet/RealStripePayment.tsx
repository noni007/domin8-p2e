
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, DollarSign, AlertCircle } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RealStripePaymentProps {
  type: 'deposit' | 'withdrawal';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const RealStripePayment = ({ type, onSuccess, onCancel }: RealStripePaymentProps) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('usd');
  const [processing, setProcessing] = useState(false);
  const { wallet, refetch } = useWallet();

  const currencyOptions = [
    { value: 'usd', label: 'USD ($)', symbol: '$', min: 1.00 },
    { value: 'ngn', label: 'NGN (₦)', symbol: '₦', min: 100.00 },
  ];

  const selectedCurrency = currencyOptions.find(c => c.value === currency)!;
  const minAmount = selectedCurrency.min;
  const amountInCents = currency === 'usd' 
    ? Math.round(parseFloat(amount) * 100)
    : Math.round(parseFloat(amount));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) < minAmount) {
      toast({
        title: "Invalid Amount",
        description: `Minimum amount is ${selectedCurrency.symbol}${minAmount}`,
        variant: "destructive"
      });
      return;
    }

    if (type === 'withdrawal' && wallet && amountInCents > wallet.balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    try {
      // Create payment session
      const { data, error } = await supabase.functions.invoke('create-payment-session', {
        body: {
          amount: amountInCents,
          currency: currency,
          type: type,
          description: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} - ${selectedCurrency.symbol}${amount}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to Payment",
          description: "Complete your payment in the new tab that opened",
        });

        onSuccess?.();
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Failed to create payment session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-blue-400" />
          {type === 'deposit' ? 'Add Funds' : 'Withdraw Funds'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currency" className="text-gray-300">
              Currency
            </Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="bg-black/20 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {currencyOptions.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value} className="text-white">
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount" className="text-gray-300">
              Amount ({selectedCurrency.label})
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                step={currency === 'usd' ? "0.01" : "1"}
                min={minAmount}
                max={type === 'withdrawal' && wallet ? (currency === 'usd' ? (wallet.balance / 100).toString() : wallet.balance.toString()) : undefined}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`${minAmount}`}
                className="bg-black/20 border-gray-600 text-white pl-10"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {type === 'deposit' 
                ? `Minimum: ${selectedCurrency.symbol}${minAmount}` 
                : `Minimum: ${selectedCurrency.symbol}${minAmount}, Maximum: available balance`
              }
            </p>
          </div>

          {currency === 'ngn' && (
            <div className="p-3 bg-green-900/20 rounded-lg border border-green-700/30">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-300">
                  Nigerian Naira (NGN) payments are processed through Stripe. 
                  You can pay with local cards and bank transfers where supported.
                </p>
              </div>
            </div>
          )}

          {type === 'deposit' && (
            <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
              <p className="text-xs text-blue-300">
                🔒 Secure payment powered by Stripe. Your payment information is encrypted and protected.
              </p>
            </div>
          )}

          {type === 'withdrawal' && (
            <div className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
              <p className="text-xs text-yellow-300">
                💰 Withdrawals are processed within 1-3 business days to your linked account.
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={processing || !amount}
              className={`flex-1 ${
                type === 'deposit' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {processing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `${type === 'deposit' ? 'Deposit' : 'Withdraw'} ${selectedCurrency.symbol}${amount || '0.00'}`
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={processing}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
