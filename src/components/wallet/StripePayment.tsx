
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "@/hooks/use-toast";

interface StripePaymentProps {
  type: 'deposit' | 'withdrawal';
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const StripePayment = ({ type, onSuccess, onCancel }: StripePaymentProps) => {
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const { createTransaction, wallet } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountInCents = Math.round(parseFloat(amount) * 100);
    
    if (!amount || amountInCents < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum amount is $1.00",
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
      // For demo purposes, we'll simulate payment processing
      // In a real implementation, this would integrate with Stripe
      await new Promise(resolve => setTimeout(resolve, 2000));

      const transactionAmount = type === 'deposit' ? amountInCents : -amountInCents;
      const description = type === 'deposit' 
        ? `Deposit - $${amount}` 
        : `Withdrawal - $${amount}`;

      await createTransaction(type, transactionAmount, description, {
        stripe_payment_intent: 'demo_' + Date.now(),
        payment_method: 'card'
      });

      toast({
        title: "Success",
        description: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} processed successfully`,
      });

      onSuccess?.();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support",
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
            <Label htmlFor="amount" className="text-gray-300">
              Amount (USD)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                max={type === 'withdrawal' && wallet ? (wallet.balance / 100).toString() : "10000"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-black/20 border-gray-600 text-white pl-10"
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {type === 'deposit' ? 'Minimum: $1.00' : 'Minimum: $1.00, Maximum: available balance'}
            </p>
          </div>

          {type === 'deposit' && (
            <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
              <p className="text-xs text-blue-300">
                🔒 Secure payment powered by Stripe. Your card information is encrypted and protected.
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
                `${type === 'deposit' ? 'Deposit' : 'Withdraw'} $${amount || '0.00'}`
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
