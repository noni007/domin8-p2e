import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Wallet, AlertTriangle, Check, Settings } from 'lucide-react'
import { useFeatureFlags } from '@/hooks/useFeatureFlags'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

export const AdminWeb3Config: React.FC = () => {
  const { flags, toggleFeature, refreshFlags } = useFeatureFlags()
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState({
    polygon_network_mode: 'testnet',
    platform_token_address: '',
    tournament_escrow_address: '',
    web3modal_project_id: '',
  })

  // Load Web3 configuration
  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_config')
        .select('key, value')
        .in('key', [
          'polygon_network_mode',
          'platform_token_address', 
          'tournament_escrow_address',
          'web3modal_project_id'
        ])

      if (error) throw error

      const configObject: any = {}
      data?.forEach((item) => {
        configObject[item.key] = typeof item.value === 'string' ? JSON.parse(item.value) : item.value
      })

      setConfig(prev => ({ ...prev, ...configObject }))
    } catch (error) {
      console.error('Error loading Web3 config:', error)
      toast.error('Failed to load Web3 configuration')
    }
  }

  // Save configuration
  const saveConfig = async () => {
    setLoading(true)
    try {
      const updates = Object.entries(config).map(([key, value]) => ({
        key,
        value: JSON.stringify(value),
        description: getConfigDescription(key)
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('platform_config')
          .upsert(update, { onConflict: 'key' })

        if (error) throw error
      }

      toast.success('Web3 configuration saved successfully!')
      await refreshFlags()
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Failed to save Web3 configuration')
    } finally {
      setLoading(false)
    }
  }

  const getConfigDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      polygon_network_mode: 'Polygon network mode: testnet (Mumbai) or mainnet',
      platform_token_address: 'Deployed platform token contract address',
      tournament_escrow_address: 'Deployed tournament escrow contract address',
      web3modal_project_id: 'Web3Modal project ID from WalletConnect Cloud',
    }
    return descriptions[key] || ''
  }

  const handleFeatureToggle = async (feature: string, enabled: boolean) => {
    const success = await toggleFeature(feature as any, enabled)
    if (success) {
      toast.success(`${feature} ${enabled ? 'enabled' : 'disabled'}`)
    } else {
      toast.error(`Failed to toggle ${feature}`)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const web3Features = [
    {
      key: 'feature_web3_wallets',
      title: 'Web3 Wallets',
      description: 'Enable MetaMask and WalletConnect integration',
      critical: false,
    },
    {
      key: 'feature_crypto_payments',
      title: 'Crypto Payments',
      description: 'Accept MATIC and stablecoin payments for tournaments',
      critical: false,
    },
    {
      key: 'feature_polygon_integration',
      title: 'Polygon Network',
      description: 'Enable Polygon blockchain features',
      critical: true,
    },
    {
      key: 'feature_smart_contracts',
      title: 'Smart Contracts',
      description: 'Enable smart contract interactions',
      critical: true,
    },
    {
      key: 'feature_platform_token',
      title: 'Platform Token',
      description: 'Enable platform token rewards and staking',
      critical: false,
    },
    {
      key: 'feature_nft_achievements',
      title: 'NFT Achievements',
      description: 'Convert achievements to tradeable NFTs',
      critical: false,
    },
    {
      key: 'feature_token_staking',
      title: 'Token Staking',
      description: 'Enable token staking for premium features',
      critical: false,
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Web3 Feature Management
          </CardTitle>
          <CardDescription>
            Configure Web3 and blockchain features for the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {web3Features.map((feature) => (
            <div key={feature.key} className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-medium">{feature.title}</Label>
                  {feature.critical && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Critical
                    </Badge>
                  )}
                  {flags[feature.key as keyof typeof flags] && (
                    <Badge variant="default" className="text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <Switch
                checked={flags[feature.key as keyof typeof flags] || false}
                onCheckedChange={(checked) => handleFeatureToggle(feature.key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Network & Contract Configuration
          </CardTitle>
          <CardDescription>
            Configure blockchain network settings and contract addresses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="network-mode">Network Mode</Label>
              <Select
                value={config.polygon_network_mode}
                onValueChange={(value) => setConfig(prev => ({ ...prev, polygon_network_mode: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="testnet">Testnet (Mumbai)</SelectItem>
                  <SelectItem value="mainnet">Mainnet (Polygon)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Use testnet for development, mainnet for production
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-id">Web3Modal Project ID</Label>
              <Input
                id="project-id"
                placeholder="Enter WalletConnect Project ID"
                value={config.web3modal_project_id}
                onChange={(e) => setConfig(prev => ({ ...prev, web3modal_project_id: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Get this from WalletConnect Cloud dashboard
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Smart Contract Addresses</h4>
            
            <div className="space-y-2">
              <Label htmlFor="platform-token">Platform Token Contract</Label>
              <Input
                id="platform-token"
                placeholder="0x..."
                value={config.platform_token_address}
                onChange={(e) => setConfig(prev => ({ ...prev, platform_token_address: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tournament-escrow">Tournament Escrow Contract</Label>
              <Input
                id="tournament-escrow"
                placeholder="0x..."
                value={config.tournament_escrow_address}
                onChange={(e) => setConfig(prev => ({ ...prev, tournament_escrow_address: e.target.value }))}
              />
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Contract addresses are critical for Web3 functionality. Ensure they are correct before enabling smart contract features.
            </AlertDescription>
          </Alert>

          <Button onClick={saveConfig} disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}