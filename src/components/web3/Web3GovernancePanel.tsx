import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Vote, 
  Users, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  status: 'active' | 'passed' | 'failed' | 'pending';
  category: 'platform' | 'tournament' | 'rewards' | 'governance';
  votingPower: number;
  totalVotes: number;
  yesVotes: number;
  noVotes: number;
  startDate: string;
  endDate: string;
  userVote?: 'yes' | 'no' | null;
  minimumQuorum: number;
  currentQuorum: number;
}

interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  userVotingPower: number;
  participationRate: number;
  governanceTokens: number;
}

export const Web3GovernancePanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<GovernanceStats>({
    totalProposals: 0,
    activeProposals: 0,
    userVotingPower: 0,
    participationRate: 0,
    governanceTokens: 0
  });
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    category: 'platform' as const
  });
  const [showCreateProposal, setShowCreateProposal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGovernanceData();
    }
  }, [user]);

  const fetchGovernanceData = async () => {
    try {
      setLoading(true);
      
      // Generate mock governance data
      const mockProposals = generateMockProposals();
      setProposals(mockProposals);
      
      // Calculate stats
      const governanceStats = calculateGovernanceStats(mockProposals);
      setStats(governanceStats);
      
    } catch (error) {
      console.error('Error fetching governance data:', error);
      toast({
        title: "Error",
        description: "Failed to load governance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockProposals = (): Proposal[] => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return [
      {
        id: '1',
        title: 'Increase Tournament Prize Pools',
        description: 'Proposal to increase the minimum prize pool for tournaments from $100 to $250 to attract more participants.',
        proposer: 'Community',
        status: 'active',
        category: 'tournament',
        votingPower: 1000,
        totalVotes: 450,
        yesVotes: 320,
        noVotes: 130,
        startDate: weekAgo.toISOString(),
        endDate: weekFromNow.toISOString(),
        userVote: null,
        minimumQuorum: 500,
        currentQuorum: 450
      },
      {
        id: '2',
        title: 'Implement Staking Rewards',
        description: 'Add staking functionality for governance tokens with 12% APY rewards.',
        proposer: 'Core Team',
        status: 'active',
        category: 'rewards',
        votingPower: 1000,
        totalVotes: 680,
        yesVotes: 520,
        noVotes: 160,
        startDate: weekAgo.toISOString(),
        endDate: weekFromNow.toISOString(),
        userVote: 'yes',
        minimumQuorum: 600,
        currentQuorum: 680
      },
      {
        id: '3',
        title: 'Reduce Platform Commission',
        description: 'Reduce platform commission from 10% to 7% to benefit tournament organizers.',
        proposer: 'Community',
        status: 'passed',
        category: 'platform',
        votingPower: 1000,
        totalVotes: 850,
        yesVotes: 650,
        noVotes: 200,
        startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: weekAgo.toISOString(),
        userVote: 'yes',
        minimumQuorum: 600,
        currentQuorum: 850
      },
      {
        id: '4',
        title: 'Add New Game Support',
        description: 'Expand platform to support Apex Legends tournaments.',
        proposer: 'Community',
        status: 'pending',
        category: 'platform',
        votingPower: 1000,
        totalVotes: 0,
        yesVotes: 0,
        noVotes: 0,
        startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        userVote: null,
        minimumQuorum: 500,
        currentQuorum: 0
      }
    ];
  };

  const calculateGovernanceStats = (proposals: Proposal[]): GovernanceStats => {
    const activeProposals = proposals.filter(p => p.status === 'active').length;
    const totalVotes = proposals.reduce((sum, p) => sum + p.totalVotes, 0);
    const avgParticipation = proposals.length > 0 ? totalVotes / proposals.length : 0;
    
    return {
      totalProposals: proposals.length,
      activeProposals,
      userVotingPower: 100, // Mock user voting power
      participationRate: Math.min(avgParticipation / 1000 * 100, 100),
      governanceTokens: 1500 // Mock governance tokens
    };
  };

  const castVote = async (proposalId: string, vote: 'yes' | 'no') => {
    try {
      setVoting(proposalId);
      
      // Simulate voting process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update proposal with user vote
      setProposals(prev => prev.map(proposal => {
        if (proposal.id === proposalId) {
          const updatedProposal = { ...proposal, userVote: vote };
          if (vote === 'yes') {
            updatedProposal.yesVotes += stats.userVotingPower;
          } else {
            updatedProposal.noVotes += stats.userVotingPower;
          }
          updatedProposal.totalVotes += stats.userVotingPower;
          updatedProposal.currentQuorum = updatedProposal.totalVotes;
          return updatedProposal;
        }
        return proposal;
      }));
      
      toast({
        title: "Vote Cast",
        description: `Your ${vote} vote has been recorded`,
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error casting vote:', error);
      toast({
        title: "Error",
        description: "Failed to cast vote",
        variant: "destructive"
      });
    } finally {
      setVoting(null);
    }
  };

  const createProposal = async () => {
    try {
      if (!newProposal.title || !newProposal.description) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive"
        });
        return;
      }
      
      // Simulate proposal creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const proposal: Proposal = {
        id: Date.now().toString(),
        title: newProposal.title,
        description: newProposal.description,
        proposer: user?.email || 'Unknown',
        status: 'pending',
        category: newProposal.category,
        votingPower: 1000,
        totalVotes: 0,
        yesVotes: 0,
        noVotes: 0,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        userVote: null,
        minimumQuorum: 500,
        currentQuorum: 0
      };
      
      setProposals(prev => [proposal, ...prev]);
      setNewProposal({ title: '', description: '', category: 'platform' });
      setShowCreateProposal(false);
      
      toast({
        title: "Proposal Created",
        description: "Your proposal has been submitted for voting",
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        title: "Error",
        description: "Failed to create proposal",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-600';
      case 'passed': return 'bg-green-600';
      case 'failed': return 'bg-red-600';
      case 'pending': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Vote className="h-4 w-4" />;
      case 'passed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Vote className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
        <span className="ml-2 text-gray-300">Loading governance data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Governance Stats */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-400" />
            Governance Overview
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateProposal(!showCreateProposal)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {showCreateProposal ? 'Cancel' : 'Create Proposal'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.totalProposals}</div>
              <div className="text-sm text-gray-400">Total Proposals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.activeProposals}</div>
              <div className="text-sm text-gray-400">Active Proposals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.userVotingPower}</div>
              <div className="text-sm text-gray-400">Your Voting Power</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.governanceTokens}</div>
              <div className="text-sm text-gray-400">Governance Tokens</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Proposal */}
      {showCreateProposal && (
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Create New Proposal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newProposal.title}
                onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-white"
                placeholder="Enter proposal title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <Textarea
                value={newProposal.description}
                onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-white"
                placeholder="Describe your proposal..."
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={newProposal.category}
                onChange={(e) => setNewProposal({ ...newProposal, category: e.target.value as any })}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded-md text-white"
              >
                <option value="platform">Platform</option>
                <option value="tournament">Tournament</option>
                <option value="rewards">Rewards</option>
                <option value="governance">Governance</option>
              </select>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={createProposal} className="bg-blue-600 hover:bg-blue-700">
                Create Proposal
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateProposal(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proposals */}
      <div className="space-y-4">
        {proposals.map((proposal) => (
          <Card key={proposal.id} className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={`${getStatusColor(proposal.status)} text-white`}>
                    {getStatusIcon(proposal.status)}
                    <span className="ml-1 capitalize">{proposal.status}</span>
                  </Badge>
                  <Badge variant="outline" className="text-gray-300">
                    {proposal.category}
                  </Badge>
                </div>
                <div className="text-sm text-gray-400">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Ends: {new Date(proposal.endDate).toLocaleDateString()}
                </div>
              </div>
              <CardTitle className="text-lg">{proposal.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">{proposal.description}</p>
              
              {/* Voting Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Voting Progress</span>
                  <span className="text-white">
                    {proposal.totalVotes} / {proposal.minimumQuorum} votes
                  </span>
                </div>
                <Progress 
                  value={(proposal.totalVotes / proposal.minimumQuorum) * 100} 
                  className="h-2"
                />
              </div>
              
              {/* Vote Results */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {proposal.yesVotes}
                  </div>
                  <div className="text-sm text-gray-400">Yes Votes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-400">
                    {proposal.noVotes}
                  </div>
                  <div className="text-sm text-gray-400">No Votes</div>
                </div>
              </div>
              
              {/* Voting Buttons */}
              {proposal.status === 'active' && (
                <div className="flex space-x-2">
                  {proposal.userVote === 'yes' ? (
                    <Button variant="outline" disabled className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                      Voted Yes
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => castVote(proposal.id, 'yes')}
                      disabled={voting === proposal.id}
                    >
                      {voting === proposal.id ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Vote Yes
                    </Button>
                  )}
                  
                  {proposal.userVote === 'no' ? (
                    <Button variant="outline" disabled className="flex-1">
                      <XCircle className="h-4 w-4 mr-2 text-red-400" />
                      Voted No
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => castVote(proposal.id, 'no')}
                      disabled={voting === proposal.id}
                    >
                      {voting === proposal.id ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Vote No
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};