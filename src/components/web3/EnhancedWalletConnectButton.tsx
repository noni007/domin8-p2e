import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Coins,
  Network,
  Power
} from 'lucide-react';
import { useWeb3Wallet } from '@/hooks/useWeb3Wallet';
import { useWeb3Context } from '@/contexts/Web3Context';
import { NETWORKS } from '@/lib/web3/config';
import { toast } from 'sonner';

interface EnhancedWalletConnectButtonProps {
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  showDetails?: boolean;
}

export const EnhancedWalletConnectButton: React.FC<EnhancedWalletConnectButtonProps> = ({
  size = 'default',
  variant = 'default',
  className = '',
  showDetails = true
}) => {
  const { isWeb3Enabled } = useWeb3Context();
  const { 
    address, 
    isConnected, 
    isLoading,
    balance, 
    chainId, 
    networkName,
    connectWallet, 
    disconnectWallet 
  } = useWeb3Wallet();

  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getExplorerUrl = () => {
    if (!address || !chainId) return '';
    
    const network = chainId === 137 ? NETWORKS.POLYGON_MAINNET : NETWORKS.POLYGON_MUMBAI;
    return `${network.blockExplorer}/address/${address}`;
  };

  if (!isWeb3Enabled) {
    return (
      <Button variant="outline" disabled className={className}>
        <AlertCircle className="h-4 w-4 mr-2" />
        Web3 Disabled
      </Button>
    );
  }

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
        Connecting...
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        onClick={connectWallet}
        className={className}
      >
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  // Connected state - show compact button or detailed card
  if (showDetails) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Wallet Connected
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={disconnectWallet}
              className="text-red-500 hover:text-red-600"
            >
              <Power className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Network Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Network className="h-4 w-4" />
                Network:
              </span>
              <Badge variant="outline">{networkName}</Badge>
            </div>
            
            {/* Balance */}
            {balance && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Balance:
                </span>
                <span className="text-sm font-medium">{balance}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Address */}
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Wallet Address:</span>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <span className="font-mono text-xs flex-1 truncate">
                {address}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
                className="p-1"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(getExplorerUrl(), '_blank')}
                className="p-1"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getExplorerUrl(), '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Explorer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={disconnectWallet}
            >
              <Power className="h-3 w-3 mr-1" />
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact connected state
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-xs">
        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
        {networkName}
      </Badge>
      <Button
        variant={variant}
        size={size}
        onClick={handleCopyAddress}
        className={`${className} font-mono`}
      >
        {copied ? (
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
        ) : (
          <Wallet className="h-4 w-4 mr-2" />
        )}
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={disconnectWallet}
        className="text-red-500 hover:text-red-600"
      >
        <Power className="h-4 w-4" />
      </Button>
    </div>
  );
};