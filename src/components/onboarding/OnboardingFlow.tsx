
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ChevronRight, Trophy, Users, Gamepad2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

export const OnboardingFlow = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Domin8",
      description: "Your journey to esports greatness starts here",
      icon: Trophy,
      content: (
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">Welcome, {user?.user_metadata?.display_name || 'Champion'}!</h3>
          <p className="text-gray-300 max-w-md mx-auto">
            Domin8 is Africa's premier esports ranking platform. Let's get you set up to start competing and climbing the ranks.
          </p>
        </div>
      )
    },
    {
      id: "profile",
      title: "Complete Your Profile",
      description: "Tell other players about yourself",
      icon: Users,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Set Up Your Gaming Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-black/40 rounded-lg border border-blue-800/30">
              <h4 className="font-medium text-white mb-2">Favorite Games</h4>
              <p className="text-gray-300 text-sm">Choose your main competitive games</p>
            </div>
            <div className="p-4 bg-black/40 rounded-lg border border-blue-800/30">
              <h4 className="font-medium text-white mb-2">Gaming Experience</h4>
              <p className="text-gray-300 text-sm">Share your competitive background</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "tournaments",
      title: "Discover Tournaments",
      description: "Find competitions that match your skill level",
      icon: Gamepad2,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Ready to Compete?</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-black/40 rounded-lg border border-blue-800/30">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-white">Browse active tournaments</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-black/40 rounded-lg border border-blue-800/30">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-white">Join tournaments in your skill bracket</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-black/40 rounded-lg border border-blue-800/30">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-white">Track your AER ranking progress</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    const current = steps[currentStep];
    if (!completedSteps.includes(current.id)) {
      setCompletedSteps([...completedSteps, current.id]);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete
      localStorage.setItem('onboarding_completed', 'true');
      window.location.href = '/tournaments';
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    window.location.href = '/tournaments';
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <div className="p-6 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-blue-400">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicator */}
          <div className="flex items-center space-x-2 text-blue-400">
            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium">{currentStepData.title}</span>
          </div>

          {/* Content */}
          <div className="min-h-[300px] flex items-center">
            {currentStepData.content}
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="text-gray-400 hover:text-white"
            >
              Skip for now
            </Button>
            <Button 
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            >
              {currentStep < steps.length - 1 ? 'Continue' : 'Get Started'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
