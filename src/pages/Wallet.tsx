
import { WalletDashboard } from "@/components/wallet/WalletDashboard";

const Wallet = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Wallet</h1>
          <p className="text-gray-300">Manage your funds, deposits, and withdrawals</p>
        </div>
        <WalletDashboard />
      </div>
    </div>
  );
};

export default Wallet;
