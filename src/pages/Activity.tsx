
import { useAuth } from "@/hooks/useAuth";
import { EnhancedActivityFeed } from "@/components/activity/EnhancedActivityFeed";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

const Activity = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Please Sign In</h3>
            <p className="text-gray-400">You need to be signed in to view your activity.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
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
  );
};

export default Activity;
