
import * as React from 'react';
import { useAuth } from './useAuth';

interface PersonalizedContent {
  welcomeMessage: string;
  recommendations: Recommendation[];
  motivationalQuote: string;
  nextSteps: string[];
}

interface Recommendation {
  type: 'tournament' | 'feature' | 'social' | 'learning';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

export const usePersonalizedContent = () => {
  const { user, profile } = useAuth();
  const [content, setContent] = React.useState<PersonalizedContent | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user && profile) {
      generatePersonalizedContent();
    }
  }, [user, profile]);

  const generatePersonalizedContent = () => {
    if (!profile) return;

    const username = profile.username || user?.email?.split('@')[0] || 'Champion';
    const timeOfDay = getTimeOfDay();
    
    // Generate personalized welcome message
    const welcomeMessages = [
      `${timeOfDay}, ${username}! Ready to dominate the leaderboards today?`,
      `Welcome back, ${username}! Your gaming empire awaits.`,
      `${timeOfDay}, ${username}! Time to show everyone what you're made of.`,
      `Hey ${username}! The arena is calling your name.`
    ];

    // Generate recommendations based on profile data
    const recommendations = generateRecommendations();

    // Generate motivational quote
    const motivationalQuotes = [
      "Every expert was once a beginner. Every pro was once an amateur.",
      "The only way to do great work is to love what you do.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      "Champions aren't made in comfort zones."
    ];

    // Generate next steps
    const nextSteps = generateNextSteps();

    setContent({
      welcomeMessage: welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
      recommendations,
      motivationalQuote: motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
      nextSteps
    });

    setLoading(false);
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    // Tournament recommendations based on experience level
    if (profile?.bio?.includes('beginner') || Math.random() > 0.7) {
      recommendations.push({
        type: 'tournament',
        title: 'Join a Beginner Tournament',
        description: 'Perfect for building confidence and gaining experience',
        action: 'Browse beginner-friendly tournaments',
        priority: 'high',
        icon: 'Trophy'
      });
    } else {
      recommendations.push({
        type: 'tournament',
        title: 'Take on Advanced Competitions',
        description: 'Challenge yourself against skilled opponents',
        action: 'View advanced tournaments',
        priority: 'high',
        icon: 'Target'
      });
    }

    // Social recommendations
    recommendations.push({
      type: 'social',
      title: 'Connect with Fellow Gamers',
      description: 'Build your network and find teammates',
      action: 'Discover players',
      priority: 'medium',
      icon: 'Users'
    });

    // Feature recommendations based on profile completion
    if (!profile?.bio || profile.bio.length < 50) {
      recommendations.push({
        type: 'feature',
        title: 'Complete Your Profile',
        description: 'A complete profile helps others connect with you',
        action: 'Update profile',
        priority: 'medium',
        icon: 'User'
      });
    }

    // Learning recommendations
    recommendations.push({
      type: 'learning',
      title: 'Explore Platform Features',
      description: 'Discover all the tools available to enhance your gaming',
      action: 'Take feature tour',
      priority: 'low',
      icon: 'Lightbulb'
    });

    return recommendations.slice(0, 3); // Limit to top 3 recommendations
  };

  const generateNextSteps = (): string[] => {
    const steps: string[] = [];

    // Based on profile completeness
    if (!profile?.bio) {
      steps.push('Add a bio to your profile');
    }

    // Based on activity level
    steps.push('Join your first tournament');
    steps.push('Connect with other players');
    steps.push('Explore the leaderboards');

    return steps.slice(0, 3);
  };

  return {
    content,
    loading,
    regenerateContent: generatePersonalizedContent
  };
};
