
import { ResponsiveWalletDashboard } from "@/components/wallet/ResponsiveWalletDashboard";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

const Wallet = () => {
  const { isMobile } = useResponsiveLayout();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
      <div className={`container mx-auto py-8 ${isMobile ? 'px-4' : 'px-4'}`}>
        <div className="mb-8">
          <h1 className={`font-bold text-white mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            Wallet
          </h1>
          <p className={`text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}>
            Manage your funds, deposits, and withdrawals
          </p>
        </div>
        <ResponsiveWalletDashboard />
      </div>
    </div>
  );
};

export default Wallet;
