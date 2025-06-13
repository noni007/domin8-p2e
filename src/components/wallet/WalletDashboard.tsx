
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, DollarSign, TrendingUp, TrendingDown, Plus, Minus } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { WalletTransactionHistory } from "./WalletTransactionHistory";
import { RealStripePayment } from "./RealStripePayment";
import { PaymentVerification } from "./PaymentVerification";

export const WalletDashboard = () => {
  const { wallet, transactions, loading, formatAmount } = useWallet();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState<string | null>(null);

  // Check for payment success/cancellation from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const cancelled = urlParams.get('cancelled');
    const sessionId = urlParams.get('session_id');

    if (success === 'true' && sessionId) {
      setVerifyingPayment(sessionId);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (cancelled === 'true') {
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  if (loading) {
    return <div className="text-center text-gray-400">Loading wallet...</div>;
  }

  if (!wallet) {
    return (
      <div className="text-center py-8">
        <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Wallet not found. Please contact support.</p>
      </div>
    );
  }

  const recentTransactions = transactions.slice(0, 5);
  const totalDeposits = transactions
    .filter(t => t.transaction_type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawals = transactions
    .filter(t => t.transaction_type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Show payment verification if needed
  if (verifyingPayment) {
    return (
      <div className="space-y-6">
        <PaymentVerification
          sessionId={verifyingPayment}
          onComplete={() => setVerifyingPayment(null)}
        />
      </div>
    );
  }

  // Show payment form if either deposit or withdrawal is active
  if (showDeposit || showWithdrawal) {
    return (
      <div className="space-y-6">
        <RealStripePayment
          type={showDeposit ? 'deposit' : 'withdrawal'}
          onSuccess={() => {
            setShowDeposit(false);
            setShowWithdrawal(false);
          }}
          onCancel={() => {
            setShowDeposit(false);
            setShowWithdrawal(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${formatAmount(wallet.balance)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {wallet.currency.toUpperCase()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Deposits</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${formatAmount(totalDeposits)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Withdrawals</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${formatAmount(totalWithdrawals)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button 
              onClick={() => setShowDeposit(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
            <Button 
              onClick={() => setShowWithdrawal(true)}
              disabled={wallet.balance < 100}
              variant="outline"
              className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black"
            >
              <Minus className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Minimum withdrawal: $1.00 • Supports USD and NGN
          </p>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.transaction_type === 'deposit' ? 'bg-green-600/20' :
                      transaction.transaction_type === 'withdrawal' ? 'bg-red-600/20' :
                      transaction.transaction_type === 'prize_payout' ? 'bg-yellow-600/20' :
                      'bg-blue-600/20'
                    }`}>
                      <DollarSign className={`h-4 w-4 ${
                        transaction.transaction_type === 'deposit' ? 'text-green-400' :
                        transaction.transaction_type === 'withdrawal' ? 'text-red-400' :
                        transaction.transaction_type === 'prize_payout' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}${formatAmount(Math.abs(transaction.amount))}
                    </p>
                    <Badge variant="outline" className={`text-xs ${
                      transaction.status === 'completed' ? 'border-green-400 text-green-400' :
                      transaction.status === 'pending' ? 'border-yellow-400 text-yellow-400' :
                      'border-red-400 text-red-400'
                    }`}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Transaction History */}
      <WalletTransactionHistory transactions={transactions} />
    </div>
  );
};
