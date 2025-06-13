
import { GamedWaitlist } from '@/components/waitlist/GamedWaitlist';
import { Rocket, TrendingUp, BarChart3 } from 'lucide-react';

export const ComingSoonSection = () => {
  const upcomingFeatures = [
    {
      icon: BarChart3,
      title: "Historical Stats Upload",
      description: "Import your gaming history from other platforms and see your complete journey",
      benefits: ["Complete match history", "Progress tracking", "Cross-platform analytics", "Personal insights"],
      component: <GamedWaitlist feature="historical_stats_upload" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Rocket className="h-8 w-8 text-blue-400" />
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Coming Soon
          </h2>
        </div>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Help us prioritize which features to build next! Join the waitlist to show your interest 
          and get early access when we reach our development milestones.
        </p>
      </div>

      <div className="space-y-16">
        {upcomingFeatures.map((feature, index) => (
          <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Feature Details */}
            <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
              <div className="flex items-center gap-3">
                <feature.icon className="h-10 w-10 text-blue-400" />
                <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
              </div>
              
              <p className="text-gray-300 text-lg leading-relaxed">
                {feature.description}
              </p>
              
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-teal-400" />
                  What you'll get:
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Waitlist Component */}
            <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
              {feature.component}
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-16 p-8 bg-gradient-to-r from-blue-900/30 to-teal-900/30 rounded-xl border border-blue-800/30">
        <h3 className="text-2xl font-bold text-white mb-4">
          Your Voice Matters
        </h3>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Each signup shows us what features matter most to our community. Reach the milestones 
          faster and we'll prioritize development to get these features in your hands sooner!
        </p>
      </div>
    </div>
  );
};
