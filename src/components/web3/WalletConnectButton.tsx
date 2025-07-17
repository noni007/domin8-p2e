import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Wallet, Copy, ExternalLink, Power } from 'lucide-react'
import { useWeb3Wallet } from '@/hooks/useWeb3Wallet'
import { toast } from 'sonner'

export const WalletConnectButton: React.FC = () => {
  const { 
    address, 
    isConnected, 
    isLoading, 
    balance, 
    networkName,
    connectWallet, 
    disconnectWallet,
    isWeb3Enabled 
  } = useWeb3Wallet()

  if (!isWeb3Enabled) {
    return null
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success('Address copied to clipboard!')
    }
  }

  const openInExplorer = () => {
    if (address && networkName) {
      const explorerUrl = networkName === 'Polygon' 
        ? `https://polygonscan.com/address/${address}`
        : `https://mumbai.polygonscan.com/address/${address}`
      window.open(explorerUrl, '_blank')
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wallet className="h-4 w-4" />
          {address && formatAddress(address)}
          <Badge variant="secondary" className="ml-1">
            {networkName}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Wallet Details</DropdownMenuLabel>
        <div className="px-2 py-1.5 text-sm">
          <div className="font-medium">{address && formatAddress(address)}</div>
          {balance && (
            <div className="text-muted-foreground">{balance}</div>
          )}
          <div className="text-muted-foreground text-xs">
            Network: {networkName}
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={copyAddress} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={openInExplorer} className="gap-2">
          <ExternalLink className="h-4 w-4" />
          View in Explorer
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={disconnectWallet} 
          className="gap-2 text-destructive focus:text-destructive"
        >
          <Power className="h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}