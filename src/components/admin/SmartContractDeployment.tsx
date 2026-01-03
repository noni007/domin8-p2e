import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useWeb3Wallet } from '@/hooks/useWeb3Wallet';

interface ContractTemplate {
  name: string;
  type: string;
  bytecode: string;
  abi: any[];
  description: string;
}

const contractTemplates: ContractTemplate[] = [
  {
    name: 'Tournament Prize Pool',
    type: 'tournament_pool',
    description: 'Smart contract for managing tournament prize pools',
    bytecode:
      '0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610c8b806100606000396000f3fe',
    abi: [
      {
        inputs: [],
        name: 'deposit',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
      {
        inputs: [{ name: 'winner', type: 'address' }],
        name: 'distributePrize',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
  },
  {
    name: 'Gaming Token',
    type: 'erc20_token',
    description: 'ERC-20 token for in-game rewards',
    bytecode:
      '0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610d8b806100606000396000f3fe',
    abi: [
      {
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' },
        ],
        name: 'mint',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
  },
];

export const SmartContractDeployment = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [contractName, setContractName] = useState('');
  const [customBytecode, setCustomBytecode] = useState('');
  const [customAbi, setCustomAbi] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();
  const { address, isConnected, isWeb3Enabled } = useWeb3Wallet();

  const deployContract = async () => {
    if (!isWeb3Enabled) {
      toast({
        title: 'Web3 Disabled',
        description: 'Enable Web3 features to deploy contracts.',
        variant: 'destructive',
      });
      return;
    }

    if (!isConnected || !address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your Web3 wallet first',
        variant: 'destructive',
      });
      return;
    }

    if (!contractName) {
      toast({
        title: 'Missing Contract Name',
        description: 'Please enter a contract name',
        variant: 'destructive',
      });
      return;
    }

    setIsDeploying(true);

    try {
      const template = contractTemplates.find((t) => t.name === selectedTemplate);
      const bytecode = template?.bytecode || customBytecode;
      const abi = template?.abi || JSON.parse(customAbi);

      if (!bytecode) {
        throw new Error('No bytecode provided');
      }

      // Simulate a deployment tx hash; actual deployment requires a configured Web3 stack.
      const mockTxHash = `0x${Math.random().toString(16).slice(2).padEnd(64, '0').slice(0, 64)}`;

      const { error } = await supabase.from('smart_contracts').insert({
        contract_name: contractName,
        contract_type: template?.type || 'custom',
        contract_address: '0x0000000000000000000000000000000000000000',
        bytecode: bytecode,
        abi_json: abi,
        deployment_transaction_hash: mockTxHash,
        deployer_address: address,
        deployed_by_user_id: (await supabase.auth.getUser()).data.user?.id,
        network_id: 137,
        is_active: true,
        is_verified: false,
      });

      if (error) throw error;

      toast({
        title: 'Contract Deployment Saved',
        description: 'Deployment request recorded. Configure Web3 to deploy on-chain.',
      });
    } catch (error) {
      console.error('Contract deployment error:', error);
      toast({
        title: 'Deployment Failed',
        description: error instanceof Error ? error.message : 'Failed to deploy contract',
        variant: 'destructive',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Contract Deployment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="contract-name">Contract Name</Label>
          <Input
            id="contract-name"
            value={contractName}
            onChange={(e) => setContractName(e.target.value)}
            placeholder="Enter contract name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="template-select">Contract Template</Label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Select a template or use custom" />
            </SelectTrigger>
            <SelectContent>
              {contractTemplates.map((template) => (
                <SelectItem key={template.name} value={template.name}>
                  {template.name} - {template.description}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedTemplate === 'custom' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="custom-bytecode">Contract Bytecode</Label>
              <Textarea
                id="custom-bytecode"
                value={customBytecode}
                onChange={(e) => setCustomBytecode(e.target.value)}
                placeholder="Enter contract bytecode (0x...)"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-abi">Contract ABI (JSON)</Label>
              <Textarea
                id="custom-abi"
                value={customAbi}
                onChange={(e) => setCustomAbi(e.target.value)}
                placeholder="Enter contract ABI as JSON"
                rows={6}
              />
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button
            onClick={deployContract}
            disabled={isDeploying || !isConnected}
            className="flex-1"
          >
            {isDeploying ? 'Deploying...' : 'Deploy Contract'}
          </Button>
        </div>

        {!isConnected && (
          <p className="text-sm text-muted-foreground">
            Connect your Web3 wallet to deploy contracts
          </p>
        )}
      </CardContent>
    </Card>
  );
};
