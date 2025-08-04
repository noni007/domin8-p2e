
import { ResponsiveWalletDashboard } from "@/components/wallet/ResponsiveWalletDashboard";

export const Wallet = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
      <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Wallet
          </h1>
          <p className="text-sm sm:text-base text-gray-300">
            Manage your funds, deposits, and withdrawals
          </p>
        </div>
        <ResponsiveWalletDashboard />
      </div>
    </div>
  );
};


