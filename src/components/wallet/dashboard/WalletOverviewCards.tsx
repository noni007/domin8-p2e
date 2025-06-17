
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type WalletTransaction = Tables<'wallet_transactions'>;
type UserWallet = Tables<'user_wallets'>;

interface WalletOverviewCardsProps {
  wallet: UserWallet;
  transactions: WalletTransaction[];
  formatAmount: (amount: number) => string;
}

export const WalletOverviewCards = ({ wallet, transactions, formatAmount }: WalletOverviewCardsProps) => {
  const totalDeposits = transactions
    .filter(t => t.transaction_type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawals = transactions
    .filter(t => t.transaction_type === 'withdrawal' && t.status === 'completed')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
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
  );
};
