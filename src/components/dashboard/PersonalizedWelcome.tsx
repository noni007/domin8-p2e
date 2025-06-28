
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Users, 
  Target, 
  User, 
  Lightbulb, 
  RefreshCw, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { usePersonalizedContent } from "@/hooks/usePersonalizedContent";

const iconMap = {
  Trophy,
  Users,
  Target,
  User,
  Lightbulb,
  Sparkles
};

export const PersonalizedWelcome = () => {
  const { content, loading, regenerateContent } = usePersonalizedContent();

  if (loading || !content) {
    return (
      <Card className="bg-gradient-to-r from-blue-900/40 to-teal-900/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700/50 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-blue-900/40 to-teal-900/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">{content.welcomeMessage}</h2>
              </div>
              <p className="text-gray-300 italic">"{content.motivationalQuote}"</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={regenerateContent}
              className="text-blue-400 hover:text-blue-300"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Personalized Recommendations */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-400" />
            Recommended for You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.recommendations.map((rec, index) => {
              const Icon = iconMap[rec.icon as keyof typeof iconMap] || Target;
              return (
                <div key={index} className="p-4 bg-black/20 rounded-lg border border-blue-800/20 hover:border-blue-700/40 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${
                      rec.type === 'tournament' ? 'bg-yellow-400/10 text-yellow-400' :
                      rec.type === 'social' ? 'bg-green-400/10 text-green-400' :
                      rec.type === 'feature' ? 'bg-blue-400/10 text-blue-400' :
                      'bg-purple-400/10 text-purple-400'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className={`text-xs ${
                      rec.priority === 'high' ? 'border-red-400 text-red-400' :
                      rec.priority === 'medium' ? 'border-yellow-400 text-yellow-400' :
                      'border-gray-400 text-gray-400'
                    }`}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-white mb-2">{rec.title}</h4>
                  <p className="text-gray-400 text-sm mb-3">{rec.description}</p>
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
                    {rec.action}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ChevronRight className="h-5 w-5 mr-2 text-green-400" />
            Your Next Steps
          </h3>
          <div className="space-y-3">
            {content.nextSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                  {index + 1}
                </div>
                <span className="text-gray-300">{step}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
