
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFeatureWaitlist } from '@/hooks/useFeatureWaitlist';
import { Users, Trophy, Gift, Share2, Mail, Target } from 'lucide-react';

interface GamedWaitlistProps {
  feature?: string;
  title?: string;
  description?: string;
}

export const GamedWaitlist = ({ 
  feature = 'historical_stats_upload',
  title = 'Historical Stats Upload',
  description = "Import your gaming history and see how you've progressed over time"
}: GamedWaitlistProps) => {
  const [email, setEmail] = useState('');
  const { stats, milestones, loading, joining, joinWaitlist } = useFeatureWaitlist(feature);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await joinWaitlist(email.trim());
      setEmail('');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const generateShareText = () => {
    const count = stats?.total_count || 0;
    return `🎮 Join me on the waitlist for ${title} on TourneyPro! ${count} gamers already signed up. Join now to get early access! 🚀`;
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(generateShareText());
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-black/40 backdrop-blur-sm border-blue-800/30">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-8 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = stats ? 
    Math.min((stats.progress_to_next_milestone / stats.next_milestone_target) * 100, 100) : 0;

  const nextMilestone = milestones.find(m => 
    m.milestone_count > (stats?.total_count || 0) && !m.unlocked_at
  );

  const unlockedMilestones = milestones.filter(m => m.unlocked_at);
  const remainingToNext = stats ? 
    Math.max(stats.next_milestone_target - stats.total_count, 0) : 0;

  return (
    <Card className="w-full max-w-2xl mx-auto bg-black/40 backdrop-blur-sm border-blue-800/30 hover:border-blue-600/50 transition-all duration-300">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Target className="h-6 w-6 text-blue-400" />
          {title}
        </CardTitle>
        <CardDescription className="text-gray-300 text-lg">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300 flex items-center gap-2">
              <Users className="h-4 w-4" />
              {stats?.total_count || 0} supporters
            </span>
            <span className="text-blue-400 font-semibold">
              {remainingToNext} more to unlock!
            </span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-3 bg-gray-800"
          />
          
          {nextMilestone && (
            <div className="text-center">
              <p className="text-yellow-400 font-semibold">{nextMilestone.title}</p>
              <p className="text-gray-400 text-sm">{nextMilestone.description}</p>
            </div>
          )}
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-2 gap-2">
          {milestones.slice(0, 4).map((milestone) => {
            const isUnlocked = milestone.unlocked_at || (stats?.total_count || 0) >= milestone.milestone_count;
            const isCurrent = milestone === nextMilestone;
            
            return (
              <Badge 
                key={milestone.id}
                variant={isUnlocked ? "default" : "outline"}
                className={`p-2 flex flex-col items-center gap-1 h-auto ${
                  isCurrent ? 'border-yellow-400 animate-pulse' : ''
                }`}
              >
                <Trophy className={`h-4 w-4 ${isUnlocked ? 'text-yellow-400' : 'text-gray-500'}`} />
                <span className="text-xs text-center">{milestone.milestone_count}</span>
                <span className="text-xs text-center font-medium">{milestone.title}</span>
              </Badge>
            );
          })}
        </div>

        {/* Join Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/20 border-gray-600 text-white placeholder-gray-400"
              required
            />
            <Button 
              type="submit" 
              disabled={joining}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 min-w-[120px]"
            >
              {joining ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-1" />
                  Join Waitlist
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Social Sharing */}
        <div className="flex justify-center space-x-4 pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={shareOnTwitter}
            className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share & Boost
          </Button>
          
          {stats && stats.total_count > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Gift className="h-3 w-3" />
              Early access rewards available!
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
