
import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { WalletTransactionHistory } from "./WalletTransactionHistory";
import { RealStripePayment } from "./RealStripePayment";
import { PaymentVerification } from "./PaymentVerification";
import { WalletOverviewCards } from "./dashboard/WalletOverviewCards";
import { WalletActions } from "./dashboard/WalletActions";
import { RecentTransactions } from "./dashboard/RecentTransactions";

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
      <WalletOverviewCards 
        wallet={wallet} 
        transactions={transactions} 
        formatAmount={formatAmount} 
      />

      <WalletActions
        wallet={wallet}
        onDeposit={() => setShowDeposit(true)}
        onWithdraw={() => setShowWithdrawal(true)}
      />

      <RecentTransactions 
        transactions={transactions} 
        formatAmount={formatAmount} 
      />

      <WalletTransactionHistory transactions={transactions} />
    </div>
  );
};
