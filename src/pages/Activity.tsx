
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/layout/Navigation";
import { EnhancedActivityFeed } from "@/components/activity/EnhancedActivityFeed";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

const Activity = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Please Sign In</h3>
              <p className="text-gray-400">You need to be signed in to view your activity.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Activity History</h1>
            <p className="text-gray-400">
              Track your gaming journey and achievements
            </p>
          </div>
          
          <EnhancedActivityFeed 
            title="All Activities"
            showFilters={true}
          />
        </div>
      </main>
    </div>
  );
};

export default Activity;
