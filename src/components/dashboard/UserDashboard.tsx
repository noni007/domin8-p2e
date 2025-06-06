
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Calendar, Users, Plus, TrendingUp } from "lucide-react";

export const UserDashboard = () => {
  const { user, profile } = useAuth();

  if (!user) return null;

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'player': return 'bg-blue-600';
      case 'creator': return 'bg-purple-600';
      case 'organizer': return 'bg-green-600';
      case 'brand': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getQuickActions = () => {
    switch (profile?.user_type) {
      case 'organizer':
        return [
          { icon: Plus, label: "Create Tournament", href: "/tournaments" },
          { icon: Users, label: "Manage Teams", href: "/profile" }
        ];
      case 'creator':
        return [
          { icon: TrendingUp, label: "Analytics", href: "/profile" },
          { icon: Calendar, label: "Schedule Content", href: "/profile" }
        ];
      case 'brand':
        return [
          { icon: Trophy, label: "Sponsor Tournament", href: "/tournaments" },
          { icon: TrendingUp, label: "Campaign Analytics", href: "/profile" }
        ];
      default:
        return [
          { icon: Trophy, label: "Join Tournament", href: "/tournaments" },
          { icon: Calendar, label: "View Schedule", href: "/profile" }
        ];
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Welcome back, {profile?.username || user.email?.split('@')[0]}!
        </h2>
        <Badge className={`${getUserTypeColor(profile?.user_type || 'player')} text-white capitalize text-sm px-4 py-2`}>
          {profile?.user_type || 'Player'}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Trophy className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white mb-1">0</h3>
            <p className="text-gray-400 text-sm">Tournaments Won</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Calendar className="h-10 w-10 text-blue-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white mb-1">0</h3>
            <p className="text-gray-400 text-sm">Events Joined</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-10 w-10 text-green-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-white mb-1">-</h3>
            <p className="text-gray-400 text-sm">AER Rank</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {getQuickActions().map((action, index) => (
              <Button
                key={index}
                onClick={() => window.location.href = action.href}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 h-auto p-4 flex flex-col items-center space-y-2"
              >
                <action.icon className="h-6 w-6" />
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No recent activity</p>
            <p className="text-sm text-gray-500 mt-2">
              Your tournament participation and achievements will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
