
import { Button } from "@/components/ui/button";
import { useEnhancedTournamentRegistration } from "@/hooks/useEnhancedTournamentRegistration";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Loader2, DollarSign, Wallet as WalletIcon } from "lucide-react";
import { CryptoPaymentModal } from "@/components/web3/CryptoPaymentModal";
import { useState } from "react";

interface TournamentRegistrationButtonProps {
  tournamentId: string;
  tournamentTitle: string;
  entryFee?: number;
  isRegistered: boolean;
  onRegistrationChange: () => void;
}

export const TournamentRegistrationButton = ({
  tournamentId,
  tournamentTitle,
  entryFee = 0,
  isRegistered,
  onRegistrationChange
}: TournamentRegistrationButtonProps) => {
  const { user } = useAuth();
  const { 
    registerForTournament, 
    unregisterFromTournament, 
    isRegistering,
    getPaymentOptions,
    selectedPaymentMethod,
    setSelectedPaymentMethod 
  } = useEnhancedTournamentRegistration();
  
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const handleRegistration = async () => {
    if (isRegistered) {
      const result = await unregisterFromTournament(tournamentId, entryFee);
      if (result.success) {
        onRegistrationChange();
      }
    } else {
      // For free tournaments or if only one payment method available, register directly
      if (entryFee === 0 || getPaymentOptions(entryFee).filter(opt => opt.available).length === 1) {
        const result = await registerForTournament(tournamentId, tournamentTitle, entryFee);
        if (result.success && !result.requiresExternalAction) {
          onRegistrationChange();
        }
      } else {
        // Show payment options for paid tournaments
        setShowPaymentOptions(true);
      }
    }
  };

  const handlePaymentMethodSelect = async (method: string) => {
    setShowPaymentOptions(false);
    
    if (method === 'crypto') {
      setShowCryptoModal(true);
    } else {
      setSelectedPaymentMethod(method as any);
      const result = await registerForTournament(tournamentId, tournamentTitle, entryFee, method as any);
      if (result.success && !result.requiresExternalAction) {
        onRegistrationChange();
      }
    }
  };

  const handleCryptoPaymentSuccess = async (transactionHash: string) => {
    setShowCryptoModal(false);
    // The crypto payment modal handles the transaction
    // We just need to refresh the registration status
    setTimeout(() => {
      onRegistrationChange();
    }, 2000); // Give time for transaction to be processed
  };

  if (!user) {
    return null;
  }

  const formatFee = (kobo: number) => `₦${(kobo / 100).toFixed(2)}`;
  const paymentOptions = getPaymentOptions(entryFee);
  const availableOptions = paymentOptions.filter(opt => opt.available);

  return (
    <>
      <Button
        onClick={handleRegistration}
        disabled={isRegistering}
        variant={isRegistered ? "outline" : "default"}
        className={
          isRegistered
            ? "border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
            : "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
        }
      >
        {isRegistering ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : isRegistered ? (
          <Trophy className="h-4 w-4 mr-2" />
        ) : entryFee > 0 ? (
          <DollarSign className="h-4 w-4 mr-2" />
        ) : (
          <Trophy className="h-4 w-4 mr-2" />
        )}
        {isRegistering 
          ? "Processing..." 
          : isRegistered 
            ? "Unregister" 
            : entryFee > 0 
              ? `Pay ${formatFee(entryFee)}` 
              : "Register"
        }
      </Button>

      {/* Payment Options Modal */}
      {showPaymentOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Choose Payment Method</h3>
            <div className="space-y-3">
              {availableOptions.map((option) => (
                <Button
                  key={option.method}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handlePaymentMethodSelect(option.method)}
                  disabled={!option.available}
                >
                  <div className="flex items-center gap-3">
                    {option.method === 'wallet' && <WalletIcon className="h-4 w-4" />}
                    {option.method === 'paystack' && <DollarSign className="h-4 w-4" />}
                    {option.method === 'crypto' && <WalletIcon className="h-4 w-4" />}
                    <div className="text-left">
                      <div className="font-medium">{option.description}</div>
                      {option.fee > 0 && (
                        <div className="text-xs text-muted-foreground">
                          +{formatFee(option.fee)} processing fee
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4" 
              onClick={() => setShowPaymentOptions(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Crypto Payment Modal */}
      <CryptoPaymentModal
        isOpen={showCryptoModal}
        onClose={() => setShowCryptoModal(false)}
        onSuccess={handleCryptoPaymentSuccess}
        amount={entryFee}
        purpose={`Tournament Entry: ${tournamentTitle}`}
        tournamentId={tournamentId}
      />
    </>
  );
};
