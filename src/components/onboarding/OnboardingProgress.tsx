
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Trophy, Users, CheckCircle } from "lucide-react";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  startTime: Date;
}

export const OnboardingProgress = ({ 
  currentStep, 
  totalSteps, 
  completedSteps, 
  startTime 
}: OnboardingProgressProps) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const timeElapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60); // in minutes

  const milestones = [
    { step: 1, title: "Getting Started", icon: Users, color: "bg-blue-500" },
    { step: 2, title: "Profile Setup", icon: Users, color: "bg-green-500" },
    { step: 3, title: "Feature Discovery", icon: Trophy, color: "bg-purple-500" },
    { step: 4, title: "First Tournament", icon: Trophy, color: "bg-yellow-500" }
  ];

  return (
    <Card className="bg-black/20 border-blue-800/30 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-300">
              {timeElapsed} min{timeElapsed !== 1 ? 's' : ''} elapsed
            </span>
          </div>
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            {completedSteps.length}/{totalSteps} completed
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">Overall Progress</span>
            <span className="text-blue-400 font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="grid grid-cols-4 gap-2 mt-4">
            {milestones.map((milestone) => {
              const Icon = milestone.icon;
              const isCompleted = completedSteps.length >= milestone.step;
              const isCurrent = currentStep + 1 === milestone.step;
              
              return (
                <div 
                  key={milestone.step}
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                    isCurrent ? 'bg-blue-900/30 border border-blue-600/50' : 
                    isCompleted ? 'bg-green-900/20' : 'bg-gray-800/30'
                  }`}
                >
                  <div className={`p-2 rounded-full mb-1 ${
                    isCompleted ? 'bg-green-600' : 
                    isCurrent ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-3 w-3 text-white" />
                    ) : (
                      <Icon className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className={`text-xs text-center ${
                    isCurrent ? 'text-blue-300' : 
                    isCompleted ? 'text-green-300' : 'text-gray-400'
                  }`}>
                    {milestone.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
