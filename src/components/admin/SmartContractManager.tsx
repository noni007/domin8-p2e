import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface SmartContract {
  id: string;
  contract_name: string;
  contract_type: string;
  contract_address: string;
  network_id: number;
  is_active: boolean;
  is_verified: boolean;
  deployed_at: string;
  deployer_address: string;
}

export const SmartContractManager = () => {
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('smart_contracts')
        .select('*')
        .order('deployed_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast({
        title: "Error",
        description: "Failed to load smart contracts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleContractStatus = async (contractId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('smart_contracts')
        .update({ is_active: !currentStatus })
        .eq('id', contractId);

      if (error) throw error;

      setContracts(contracts.map(contract => 
        contract.id === contractId 
          ? { ...contract, is_active: !currentStatus }
          : contract
      ));

      toast({
        title: "Contract Updated",
        description: `Contract ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error updating contract:', error);
      toast({
        title: "Error",
        description: "Failed to update contract status",
        variant: "destructive"
      });
    }
  };

  const verifyContract = async (contractId: string) => {
    try {
      const { error } = await supabase
        .from('smart_contracts')
        .update({ is_verified: true })
        .eq('id', contractId);

      if (error) throw error;

      setContracts(contracts.map(contract => 
        contract.id === contractId 
          ? { ...contract, is_verified: true }
          : contract
      ));

      toast({
        title: "Contract Verified",
        description: "Smart contract has been verified successfully"
      });
    } catch (error) {
      console.error('Error verifying contract:', error);
      toast({
        title: "Error",
        description: "Failed to verify contract",
        variant: "destructive"
      });
    }
  };

  const getNetworkName = (networkId: number) => {
    switch (networkId) {
      case 1: return 'Ethereum';
      case 137: return 'Polygon';
      case 56: return 'BSC';
      default: return `Network ${networkId}`;
    }
  };

  const getContractTypeColor = (type: string) => {
    switch (type) {
      case 'tournament_pool': return 'bg-blue-500';
      case 'erc20_token': return 'bg-green-500';
      case 'staking': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Contract Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading contracts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Contract Manager</CardTitle>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No smart contracts deployed yet
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div key={contract.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{contract.contract_name}</h3>
                    <Badge 
                      variant="secondary" 
                      className={`${getContractTypeColor(contract.contract_type)} text-white`}
                    >
                      {contract.contract_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {contract.is_verified ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <Switch
                      checked={contract.is_active}
                      onCheckedChange={() => toggleContractStatus(contract.id, contract.is_active)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <div className="font-mono text-xs break-all">
                      {contract.contract_address}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Network:</span>
                    <div>{getNetworkName(contract.network_id)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Deployed:</span>
                    <div>{new Date(contract.deployed_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="flex items-center gap-1">
                      {contract.is_active ? 'Active' : 'Inactive'}
                      {contract.is_verified && <Shield className="h-4 w-4 text-green-500" />}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {!contract.is_verified && (
                    <Button
                      size="sm"
                      onClick={() => verifyContract(contract.id)}
                    >
                      Verify Contract
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`https://polygonscan.com/address/${contract.contract_address}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View on Explorer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};