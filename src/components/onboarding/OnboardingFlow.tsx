
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ChevronRight, Trophy, Users, Gamepad2, Star, Wallet, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingAnalytics } from "@/hooks/useOnboardingAnalytics";
import { ProfileSetupStep } from "./ProfileSetupStep";
import { FeatureDiscoveryStep } from "./FeatureDiscoveryStep";
import { FirstTournamentStep } from "./FirstTournamentStep";
import { OnboardingProgress } from "./OnboardingProgress";
import { toast } from "@/hooks/use-toast";

interface OnboardingFlowProps {
  onComplete?: () => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  content: React.ReactNode;
  canSkip?: boolean;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const { user, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<string[]>([]);
  const [startTime] = React.useState(new Date());
  const [stepStartTime, setStepStartTime] = React.useState(new Date());
  const [profileData, setProfileData] = React.useState({
    username: '',
    favoriteGames: [] as string[],
    experienceLevel: '',
    bio: ''
  });

  const {
    trackStepStart,
    trackStepComplete,
    trackStepSkipped,
    trackOnboardingComplete,
    trackProfileSetup,
    trackTournamentRegistration
  } = useOnboardingAnalytics();

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Domin8",
      description: "Your journey to esports greatness starts here",
      icon: Trophy,
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-white">
            Welcome to Domin8, {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Champion'}!
          </h3>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            You've just joined Africa's premier esports ranking platform. We'll help you set up your profile, 
            discover amazing tournaments, and connect with the gaming community. Let's get started!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-black/40 rounded-lg border border-blue-800/30">
              <Target className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h4 className="font-medium text-white mb-1">Compete</h4>
              <p className="text-gray-300 text-sm">Join tournaments and climb the rankings</p>
            </div>
            <div className="p-4 bg-black/40 rounded-lg border border-blue-800/30">
              <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h4 className="font-medium text-white mb-1">Connect</h4>
              <p className="text-gray-300 text-sm">Meet fellow gamers and form teams</p>
            </div>
            <div className="p-4 bg-black/40 rounded-lg border border-blue-800/30">
              <Wallet className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <h4 className="font-medium text-white mb-1">Earn</h4>
              <p className="text-gray-300 text-sm">Win prizes and build your reputation</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "profile",
      title: "Set Up Your Gaming Profile",
      description: "Tell the community about your gaming style",
      icon: Users,
      content: (
        <ProfileSetupStep 
          profileData={profileData}
          setProfileData={setProfileData}
          userEmail={user?.email || ''}
        />
      )
    },
    {
      id: "features",
      title: "Discover Key Features",
      description: "Learn what makes Domin8 special",
      icon: Star,
      content: <FeatureDiscoveryStep />
    },
    {
      id: "tournaments",
      title: "Your First Tournament",
      description: "Ready to compete? Let's find you a tournament",
      icon: Gamepad2,
      content: <FirstTournamentStep />,
      canSkip: true
    }
  ];

  // Track step start when step changes
  React.useEffect(() => {
    if (steps[currentStep]) {
      trackStepStart(steps[currentStep].id);
      setStepStartTime(new Date());
    }
  }, [currentStep]);

  const handleNext = async () => {
    const current = steps[currentStep];
    const timeSpent = Math.floor((new Date().getTime() - stepStartTime.getTime()) / 1000);
    
    // Track step completion
    trackStepComplete(current.id, timeSpent);
    
    // Mark current step as completed
    if (!completedSteps.includes(current.id)) {
      setCompletedSteps([...completedSteps, current.id]);
    }

    // Handle profile setup step
    if (current.id === 'profile' && profileData.username) {
      try {
        trackProfileSetup(profileData);
        await refreshProfile();
        toast({
          title: "Profile Updated!",
          description: "Your gaming profile has been set up successfully.",
        });
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }

    // Move to next step or complete onboarding
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    const current = steps[currentStep];
    trackStepSkipped(current.id);
    
    if (current.canSkip && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const totalTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    trackOnboardingComplete(totalTime, completedSteps);
    
    // Use user-specific localStorage key
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
    
    toast({
      title: "Welcome to Domin8! 🎉",
      description: "Your account is all set up. Time to dominate some tournaments!",
    });
    
    if (onComplete) {
      onComplete();
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl bg-black/60 border-blue-800/30 backdrop-blur-sm my-8">
        <div className="p-8 space-y-6">
          {/* Analytics Progress */}
          <OnboardingProgress
            currentStep={currentStep}
            totalSteps={steps.length}
            completedSteps={completedSteps}
            startTime={startTime}
          />

          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">Step {currentStep + 1} of {steps.length}</span>
              <span className="text-blue-400 font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Step Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-3 text-blue-400 bg-blue-400/10 rounded-full px-4 py-2">
              <Icon className="h-6 w-6" />
              <span className="font-medium">{currentStepData.title}</span>
            </div>
            <p className="text-gray-400">{currentStepData.description}</p>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px] flex items-center justify-center">
            {currentStepData.content}
          </div>

          {/* Navigation Actions */}
          <div className="flex justify-between pt-6 border-t border-blue-800/30">
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="text-gray-400 hover:text-white"
            >
              {currentStepData.canSkip ? 'Skip for now' : 'Skip tour'}
            </Button>
            
            <div className="flex space-x-3">
              {currentStep > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="border-blue-800/50 text-blue-400 hover:bg-blue-400/10"
                >
                  Previous
                </Button>
              )}
              <Button 
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 min-w-[120px]"
                disabled={currentStep === 1 && !profileData.username}
              >
                {currentStep < steps.length - 1 ? 'Continue' : 'Get Started'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
