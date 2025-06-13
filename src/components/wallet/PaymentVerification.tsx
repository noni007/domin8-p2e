
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";

interface PaymentVerificationProps {
  sessionId: string;
  onComplete: () => void;
}

export const PaymentVerification = ({ sessionId, onComplete }: PaymentVerificationProps) => {
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refetch } = useWallet();

  useEffect(() => {
    verifyPayment();
  }, [sessionId]);

  const verifyPayment = async () => {
    try {
      setVerifying(true);
      setError(null);

      const { data, error: verifyError } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId },
      });

      if (verifyError) throw verifyError;

      if (data.success) {
        setSuccess(true);
        toast({
          title: "Payment Successful",
          description: "Your transaction has been processed successfully!",
        });
        // Refresh wallet data
        await refetch();
      } else {
        throw new Error("Payment verification failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment verification failed';
      setError(errorMessage);
      toast({
        title: "Payment Verification Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          {verifying && <Loader2 className="h-5 w-5 mr-2 text-blue-400 animate-spin" />}
          {success && <CheckCircle className="h-5 w-5 mr-2 text-green-400" />}
          {error && <XCircle className="h-5 w-5 mr-2 text-red-400" />}
          Payment Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {verifying && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Verifying your payment...</p>
            <p className="text-xs text-gray-400 mt-2">This may take a few moments</p>
          </div>
        )}

        {success && (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Payment Successful!</h3>
            <p className="text-gray-300 mb-4">Your transaction has been processed and your wallet has been updated.</p>
            <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
              Continue
            </Button>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Verification Failed</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <div className="space-x-2">
              <Button onClick={verifyPayment} variant="outline" className="border-blue-400 text-blue-400">
                Retry Verification
              </Button>
              <Button onClick={onComplete} variant="outline" className="border-gray-600 text-gray-300">
                Back to Wallet
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
