
import { GamedWaitlist } from '@/components/waitlist/GamedWaitlist';
import { Rocket, TrendingUp, BarChart3, Sparkles, Users, Clock } from 'lucide-react';

export const ComingSoonSection = () => {
  const upcomingFeatures = [
    {
      icon: BarChart3,
      title: "Historical Stats Upload",
      description: "Import your gaming history from other platforms and see your complete journey",
      benefits: ["Complete match history", "Progress tracking", "Cross-platform analytics", "Personal insights"],
      component: <GamedWaitlist feature="historical_stats_upload" />,
      gradient: "from-blue-600/20 to-purple-600/20",
      iconColor: "text-blue-400",
      accentColor: "text-blue-300"
    }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/50 to-purple-900/30" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Rocket className="h-10 w-10 text-blue-400 animate-bounce" />
              <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent animate-fade-in-up">
              Coming Soon
            </h2>
          </div>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Help us prioritize which features to build next! Join the waitlist to show your interest 
            and get early access when we reach our development milestones.
          </p>
          
          {/* Stats bar */}
          <div className="flex justify-center items-center gap-8 mt-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users className="h-4 w-4 text-teal-400" />
              <span>Community driven</span>
            </div>
            <div className="w-px h-6 bg-gray-600" />
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="h-4 w-4 text-blue-400" />
              <span>Early access available</span>
            </div>
            <div className="w-px h-6 bg-gray-600" />
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <span>Vote with your signup</span>
            </div>
          </div>
        </div>

        <div className="space-y-20">
          {upcomingFeatures.map((feature, index) => (
            <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Feature Details */}
              <div className={`space-y-8 ${index % 2 === 1 ? 'lg:order-2' : ''} animate-fade-in-up`} style={{ animationDelay: `${0.6 + index * 0.2}s` }}>
                <div className={`p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border border-white/10 hover-lift`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10`}>
                      <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-3xl font-bold text-white">{feature.title}</h3>
                  </div>
                  
                  <p className="text-gray-300 text-lg leading-relaxed mb-8">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-4">
                    <h4 className={`text-xl font-semibold text-white flex items-center gap-3`}>
                      <TrendingUp className={`h-6 w-6 ${feature.iconColor}`} />
                      What you'll get:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {feature.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                          <div className={`w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex-shrink-0`} />
                          <span className="text-gray-300 text-sm font-medium">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Waitlist Component */}
              <div className={`${index % 2 === 1 ? 'lg:order-1' : ''} animate-fade-in-up`} style={{ animationDelay: `${0.8 + index * 0.2}s` }}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl" />
                  <div className="relative">
                    {feature.component}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Call to Action - Reverted Colors */}
        <div className="text-center mt-20 animate-fade-in-up" style={{ animationDelay: '1s' }}>
          <div className="relative p-12 bg-gradient-to-br from-slate-800/80 via-gray-800/70 to-slate-900/80 rounded-3xl border border-gray-700/50 backdrop-blur-sm overflow-hidden hover-lift">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(156,163,175,0.3),transparent_70%)]" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
                <h3 className="text-4xl font-bold bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent">
                  Your Voice Matters
                </h3>
                <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
                Each signup shows us what features matter most to our community. Reach the milestones 
                faster and we'll prioritize development to get these features in your hands sooner!
              </p>
              
              {/* Progress indicators */}
              <div className="flex justify-center items-center gap-6 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/30 rounded-full border border-gray-600/30">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                  <span className="text-gray-300 font-medium">Community Driven</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/30 rounded-full border border-gray-600/30">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                  <span className="text-gray-300 font-medium">Milestone Based</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/30 rounded-full border border-gray-600/30">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
                  <span className="text-gray-300 font-medium">Early Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
