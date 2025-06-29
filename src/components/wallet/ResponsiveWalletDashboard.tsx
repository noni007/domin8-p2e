
import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { WalletTransactionHistory } from "./WalletTransactionHistory";
import { PaymentVerification } from "./PaymentVerification";
import { WalletOverviewCards } from "./dashboard/WalletOverviewCards";
import { RecentTransactions } from "./dashboard/RecentTransactions";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { EnhancedPaymentForm } from "./EnhancedPaymentForm";
import type { PaymentMethod, Currency } from "./PaymentMethodSelector";

type WalletView = 'overview' | 'deposit-methods' | 'withdraw-methods' | 'payment-form' | 'history';

interface PaymentConfig {
  method: PaymentMethod;
  currency: Currency;
  type: 'deposit' | 'withdrawal';
}

export const ResponsiveWalletDashboard = () => {
  const { wallet, transactions, loading, formatAmount } = useWallet();
  const { isMobile } = useResponsiveLayout();
  const [currentView, setCurrentView] = useState<WalletView>('overview');
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState<string | null>(null);

  // Check for payment success/cancellation from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const cancelled = urlParams.get('cancelled');
    const sessionId = urlParams.get('session_id');

    if (success === 'true' && sessionId) {
      setVerifyingPayment(sessionId);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (cancelled === 'true') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleDeposit = () => {
    setCurrentView('deposit-methods');
  };

  const handleWithdraw = () => {
    setCurrentView('withdraw-methods');
  };

  const handleMethodSelect = (method: PaymentMethod, currency: Currency, type: 'deposit' | 'withdrawal') => {
    setPaymentConfig({ method, currency, type });
    setCurrentView('payment-form');
  };

  const handlePaymentSuccess = () => {
    setCurrentView('overview');
    setPaymentConfig(null);
  };

  const handleBack = () => {
    if (currentView === 'payment-form') {
      setCurrentView(paymentConfig?.type === 'deposit' ? 'deposit-methods' : 'withdraw-methods');
    } else {
      setCurrentView('overview');
    }
    if (currentView === 'overview') {
      setPaymentConfig(null);
    }
  };

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

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'deposit-methods':
        return (
          <PaymentMethodSelector
            type="deposit"
            onMethodSelect={(method, currency) => handleMethodSelect(method, currency, 'deposit')}
            onBack={handleBack}
          />
        );

      case 'withdraw-methods':
        return (
          <PaymentMethodSelector
            type="withdrawal"
            onMethodSelect={(method, currency) => handleMethodSelect(method, currency, 'withdrawal')}
            onBack={handleBack}
          />
        );

      case 'payment-form':
        return paymentConfig ? (
          <EnhancedPaymentForm
            type={paymentConfig.type}
            method={paymentConfig.method}
            currency={paymentConfig.currency}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setCurrentView('overview')}
            onBack={handleBack}
          />
        ) : null;

      case 'history':
        return (
          <div className="space-y-6">
            <WalletTransactionHistory transactions={transactions} />
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <WalletOverviewCards 
              wallet={wallet} 
              transactions={transactions} 
              formatAmount={formatAmount} 
            />

            {/* Enhanced Action Cards */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {/* Deposit Card */}
              <div 
                onClick={handleDeposit}
                className="group cursor-pointer p-6 rounded-xl bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-700/30 backdrop-blur-sm hover:from-green-600/30 hover:to-green-800/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-green-600/20 group-hover:bg-green-600/30 transition-colors">
                    <Wallet className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-400 font-medium">Add Funds</div>
                    <div className="text-xs text-gray-400">Multiple options</div>
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-2">Deposit Money</h3>
                <p className="text-gray-400 text-sm">
                  Add funds via Stripe (USD) or PayStack (NGN) with secure processing
                </p>
              </div>

              {/* Withdraw Card */}
              <div 
                onClick={handleWithdraw}
                className="group cursor-pointer p-6 rounded-xl bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-700/30 backdrop-blur-sm hover:from-orange-600/30 hover:to-orange-800/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-full bg-orange-600/20 group-hover:bg-orange-600/30 transition-colors">
                    <Wallet className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-orange-400 font-medium">Withdraw</div>
                    <div className="text-xs text-gray-400">1-3 business days</div>
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-2">Withdraw Funds</h3>
                <p className="text-gray-400 text-sm">
                  Transfer your winnings to your bank account or payment method
                </p>
              </div>
            </div>

            <RecentTransactions 
              transactions={transactions} 
              formatAmount={formatAmount} 
            />
          </div>
        );
    }
  };

  return (
    <div className={`space-y-6 ${isMobile ? 'px-4' : ''}`}>
      {renderCurrentView()}
    </div>
  );
};
