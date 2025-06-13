
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Users, Calendar, TrendingUp, Activity, UserPlus } from "lucide-react";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { SocialActivityFeed } from "@/components/activity/SocialActivityFeed";
import { RecentActivities } from "@/components/activity/RecentActivities";

export const UserDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    { label: "Tournaments Played", value: "12", icon: Trophy, color: "text-yellow-500" },
    { label: "Matches Won", value: "45", icon: TrendingUp, color: "text-green-500" },
    { label: "Friends", value: "28", icon: Users, color: "text-blue-500" },
    { label: "Upcoming Events", value: "3", icon: Calendar, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {profile?.username || user?.email?.split('@')[0] || 'Champion'}!
        </h1>
        <p className="text-gray-300">Ready to dominate the leaderboards?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-black/40 border-blue-800/30">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-blue-600">
            <Activity className="h-4 w-4 mr-2" />
            Activity Feed
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-blue-600">
            <Users className="h-4 w-4 mr-2" />
            Social
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Quick Actions */}
            <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  onClick={() => window.location.href = '/tournaments'}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Browse Tournaments
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black"
                  onClick={() => window.location.href = '/rankings'}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Rankings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-black"
                  onClick={() => window.location.href = '/friends'}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Find Friends
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity Preview */}
            <div className="lg:col-span-2">
              <RecentActivities 
                userId={user?.id}
                title="Your Recent Activity"
                maxItems={3}
              />
            </div>
          </div>

          {/* Current Rank & Achievements */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Current Rank</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-yellow-400 rounded-full flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-black" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Gold III</h3>
                    <p className="text-gray-400">1,247 AER Points</p>
                    <Badge className="mt-1 bg-yellow-600 text-black">
                      Rank #1,234
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-300">Tournament Winner</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-300">5-Game Win Streak</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-300">Social Butterfly</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <ActivityFeed />
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <SocialActivityFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
};
