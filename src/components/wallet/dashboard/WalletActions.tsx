
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type UserWallet = Tables<'user_wallets'>;

interface WalletActionsProps {
  wallet: UserWallet;
  onDeposit: () => void;
  onWithdraw: () => void;
}

export const WalletActions = ({ wallet, onDeposit, onWithdraw }: WalletActionsProps) => {
  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4">
          <Button 
            onClick={onDeposit}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Funds
          </Button>
          <Button 
            onClick={onWithdraw}
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
  );
};
