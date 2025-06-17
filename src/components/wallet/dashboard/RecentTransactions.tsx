
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type WalletTransaction = Tables<'wallet_transactions'>;

interface RecentTransactionsProps {
  transactions: WalletTransaction[];
  formatAmount: (amount: number) => string;
}

export const RecentTransactions = ({ transactions, formatAmount }: RecentTransactionsProps) => {
  const recentTransactions = transactions.slice(0, 5);

  return (
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
  );
};
