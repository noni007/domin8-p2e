
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Download, Filter } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Transaction = Tables<'wallet_transactions'>;

interface WalletTransactionHistoryProps {
  transactions: Transaction[];
}

export const WalletTransactionHistory = ({ transactions }: WalletTransactionHistoryProps) => {
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const getTransactionIcon = (type: string) => {
    return <DollarSign className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-400 text-green-400';
      case 'pending':
        return 'border-yellow-400 text-yellow-400';
      case 'failed':
        return 'border-red-400 text-red-400';
      default:
        return 'border-gray-400 text-gray-400';
    }
  };

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-white">Transaction History</CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="border-blue-400 text-blue-400">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="border-blue-400 text-blue-400">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transaction.transaction_type === 'deposit' ? 'bg-green-600/20' :
                    transaction.transaction_type === 'withdrawal' ? 'bg-red-600/20' :
                    'bg-blue-600/20'
                  }`}>
                    {getTransactionIcon(transaction.transaction_type)}
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
                  <Badge variant="outline" className={`text-xs ${getStatusColor(transaction.status)}`}>
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
