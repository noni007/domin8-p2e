import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy, Users, Calendar, Star, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
  userType?: string;
}

export const WelcomeModal = ({ isOpen, onClose, username, userType }: WelcomeModalProps) => {
  const getWelcomeMessage = () => {
    switch (userType) {
      case 'player':
        return "Ready to dominate the competitive scene?";
      case 'organizer':
        return "Time to create epic tournaments!";
      case 'creator':
        return "Let's build amazing content together!";
      default:
        return "Welcome to the Africa Esports ecosystem!";
    }
  };

  const getNextSteps = () => {
    switch (userType) {
      case 'player':
        return [
          { icon: Trophy, text: "Browse active tournaments", action: "tournaments" },
          { icon: Users, text: "Connect with other players", action: "friends" },
          { icon: Star, text: "Complete your profile", action: "profile" }
        ];
      case 'organizer':
        return [
          { icon: Trophy, text: "Create your first tournament", action: "create" },
          { icon: Calendar, text: "Set up tournament schedule", action: "tournaments" },
          { icon: Users, text: "Build your community", action: "friends" }
        ];
      case 'creator':
        return [
          { icon: Star, text: "Set up your creator profile", action: "profile" },
          { icon: Trophy, text: "Join tournaments to create content", action: "tournaments" },
          { icon: Users, text: "Connect with the community", action: "friends" }
        ];
      default:
        return [
          { icon: Trophy, text: "Explore tournaments", action: "tournaments" },
          { icon: Users, text: "Meet the community", action: "friends" },
          { icon: Star, text: "Complete your profile", action: "profile" }
        ];
    }
  };

  const handleAction = (action: string) => {
    onClose();
    setTimeout(() => {
      switch (action) {
        case 'tournaments':
          window.location.href = '/tournaments';
          break;
        case 'create':
          window.location.href = '/tournaments';
          break;
        case 'friends':
          window.location.href = '/friends';
          break;
        case 'profile':
          window.location.href = '/profile';
          break;
        default:
          break;
      }
    }, 100);
  };

  const nextSteps = getNextSteps();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-black/95 to-blue-900/20 border-blue-400/50 text-white">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            Welcome, {username || 'Champion'}! 🎉
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-lg">
            {getWelcomeMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Type Badge */}
          <div className="flex justify-center">
            <Badge className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2">
              {userType?.charAt(0).toUpperCase() + userType?.slice(1)} Account
            </Badge>
          </div>

          {/* Next Steps */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-center text-white">Your next steps:</h3>
            <div className="space-y-2">
              {nextSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleAction(step.action)}
                    className="w-full justify-between border-blue-400/50 bg-black/20 text-white hover:bg-blue-400/20 hover:border-blue-400"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-4 w-4 text-blue-400" />
                      <span>{step.text}</span>
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-black/30 rounded-lg p-4 border border-blue-800/30">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Platform Highlights:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <p className="text-blue-400 font-semibold">50+</p>
                <p className="text-gray-400">Active Players</p>
              </div>
              <div className="text-center">
                <p className="text-green-400 font-semibold">₦2M+</p>
                <p className="text-gray-400">Prize Pools</p>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold"
          >
            Let's Get Started!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};