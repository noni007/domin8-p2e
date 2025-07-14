import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MatchSpectating } from '@/components/matches/MatchSpectating';
import { Monitor, Users, Zap } from 'lucide-react';

const MatchSpectatingDemo = () => {
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [customMatchId, setCustomMatchId] = useState('');

  // Sample match IDs for demonstration
  const sampleMatches = [
    {
      id: 'match-1',
      title: 'Tournament Finals: Player A vs Player B',
      status: 'live',
      game: 'Chess'
    },
    {
      id: 'match-2', 
      title: 'Semi-Final: Team Red vs Team Blue',
      status: 'scheduled',
      game: 'Counter-Strike'
    },
    {
      id: 'match-3',
      title: 'Quick Match: FastPlayer vs ProGamer',
      status: 'completed',
      game: 'Fortnite'
    }
  ];

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
  };

  const handleCustomMatch = () => {
    if (customMatchId.trim()) {
      setSelectedMatchId(customMatchId.trim());
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'scheduled':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Monitor className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Match Spectating Demo</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience real-time match spectating with live updates, spectator counts, and interactive features.
          </p>
        </div>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <Users className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-semibold">Real-time Spectator Count</h3>
                <p className="text-sm text-muted-foreground">
                  See live updates of who's watching the match
                </p>
              </div>
              <div className="text-center space-y-2">
                <Monitor className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-semibold">Join/Leave Spectating</h3>
                <p className="text-sm text-muted-foreground">
                  Easily join or leave match spectating with one click
                </p>
              </div>
              <div className="text-center space-y-2">
                <Zap className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-semibold">Live Updates</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time synchronization across all spectators
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Match Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select a Match to Spectate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sample Matches */}
            <div>
              <h3 className="font-semibold mb-4">Sample Matches</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sampleMatches.map((match) => (
                  <Card 
                    key={match.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedMatchId === match.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleSelectMatch(match.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="secondary"
                            className={`${getStatusColor(match.status)} text-white`}
                          >
                            {match.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{match.game}</span>
                        </div>
                        <h4 className="font-medium text-sm">{match.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          Match ID: {match.id}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Custom Match ID Input */}
            <div className="space-y-4">
              <h3 className="font-semibold">Or Enter Custom Match ID</h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="custom-match-id">Match ID</Label>
                  <Input
                    id="custom-match-id"
                    placeholder="Enter match ID..."
                    value={customMatchId}
                    onChange={(e) => setCustomMatchId(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleCustomMatch}
                  disabled={!customMatchId.trim()}
                  className="mt-6"
                >
                  Select Match
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spectating Interface */}
        {selectedMatchId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Spectating Match</h2>
              <Badge variant="outline" className="text-sm">
                Match ID: {selectedMatchId}
              </Badge>
            </div>
            
            <MatchSpectating matchId={selectedMatchId} />
          </div>
        )}

        {/* Instructions */}
        {!selectedMatchId && (
          <Card>
            <CardContent className="py-8 text-center">
              <Monitor className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to Spectate?</h3>
              <p className="text-muted-foreground mb-4">
                Select a match from the samples above or enter a custom match ID to start spectating.
              </p>
              <p className="text-sm text-muted-foreground">
                The spectating interface will appear below with real-time updates and interactive features.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MatchSpectatingDemo;