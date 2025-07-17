import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wallet, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { useWeb3Wallet } from '@/hooks/useWeb3Wallet';
import { useCryptoTransactions } from '@/hooks/useCryptoTransactions';
import { useWeb3Context } from '@/contexts/Web3Context';
import { SUPPORTED_TOKENS } from '@/lib/web3/config';
import { formatEther, parseEther } from 'viem';
import { toast } from 'sonner';

interface CryptoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionHash: string) => void;
  amount: number; // Amount in USD cents
  purpose: string;
  tournamentId?: string;
  matchId?: string;
}

export const CryptoPaymentModal: React.FC<CryptoPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  purpose,
  tournamentId,
  matchId
}) => {
  const { isWeb3Enabled, isCryptoPaymentsEnabled } = useWeb3Context();
  const { address, isConnected, connectWallet, networkName } = useWeb3Wallet();
  const { sendPayment, isProcessing, estimateGas } = useCryptoTransactions();
  
  const [selectedToken, setSelectedToken] = useState<keyof typeof SUPPORTED_TOKENS>('MATIC');
  const [cryptoAmount, setCryptoAmount] = useState<string>('0');
  const [exchangeRate, setExchangeRate] = useState<number>(0.5); // Mock rate: 1 USD = 0.5 MATIC
  const [gasEstimate, setGasEstimate] = useState<string>('');

  // Calculate crypto amount based on USD amount
  useEffect(() => {
    const usdAmount = amount / 100; // Convert from cents
    const calculatedAmount = (usdAmount * exchangeRate).toFixed(6);
    setCryptoAmount(calculatedAmount);
  }, [amount, exchangeRate, selectedToken]);

  // Estimate gas fees
  useEffect(() => {
    if (isConnected && address && cryptoAmount !== '0') {
      estimateGasFees();
    }
  }, [cryptoAmount, selectedToken, isConnected, address]);

  const estimateGasFees = async () => {
    try {
      const gas = await estimateGas({
        to: address!,
        amount: cryptoAmount
      });
      setGasEstimate(gas || '0.001');
    } catch (error) {
      console.error('Gas estimation failed:', error);
      setGasEstimate('0.001');
    }
  };

  const handlePayment = async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const result = await sendPayment({
        amount: cryptoAmount,
        token: selectedToken,
        purpose,
        tournamentId,
        matchId,
        metadata: {
          usdAmount: amount / 100,
          exchangeRate,
          gasEstimate
        }
      });

      if (result.success) {
        toast.success('Payment successful!');
        onSuccess(result.transactionHash);
        onClose();
      } else {
        toast.error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    }
  };

  if (!isWeb3Enabled || !isCryptoPaymentsEnabled) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crypto Payments Unavailable</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Crypto payments are currently disabled.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Pay with Crypto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Purpose:</span>
                <span className="text-sm font-medium">{purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount (USD):</span>
                <span className="text-sm font-medium">${(amount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount (Crypto):</span>
                <span className="text-sm font-medium">
                  {cryptoAmount} {selectedToken}
                </span>
              </div>
              {gasEstimate && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Est. Gas:</span>
                  <span className="text-sm font-medium">{gasEstimate} MATIC</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wallet Connection */}
          {!isConnected ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Wallet className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-medium">Connect Your Wallet</p>
                    <p className="text-sm text-muted-foreground">
                      Connect your Web3 wallet to proceed with payment
                    </p>
                  </div>
                  <Button onClick={connectWallet} className="w-full">
                    Connect Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Connected Wallet Info */}
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Wallet:</span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Network:</span>
                      <Badge variant="outline">{networkName}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Token Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Payment Token</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(SUPPORTED_TOKENS).map(([symbol, token]) => (
                      <Button
                        key={symbol}
                        variant={selectedToken === symbol ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedToken(symbol as keyof typeof SUPPORTED_TOKENS)}
                        className="text-xs"
                      >
                        {symbol}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || !cryptoAmount || cryptoAmount === '0'}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Pay {cryptoAmount} {selectedToken}
                    </>
                  )}
                </Button>
                
                <Button variant="outline" onClick={onClose} className="w-full">
                  Cancel
                </Button>
              </div>
            </>
          )}

          {/* Help Text */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Make sure you have enough {selectedToken} and MATIC for gas fees.</p>
            <p>
              Payments are processed on the{' '}
              <span className="font-medium">{networkName}</span> network.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};