
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad, Trophy, Users, Star, Target, Zap, BarChart3, Heart, Briefcase } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("home");

  // Platform verticals data
  const verticals = [
    {
      name: "AER",
      fullName: "African Esports Rising",
      description: "Competitive grassroots vertical for Tier 2 & 3 players",
      tagline: "Grassroots Today. Greatness Tomorrow.",
      features: ["Tournament Opportunities", "Talent Development", "Performance Tracking", "Rising Player Network"],
      color: "from-orange-500 to-red-600"
    },
    {
      name: "Tournament Hub",
      fullName: "Tournament Infrastructure",
      description: "Complete tournament management and organization platform",
      tagline: "Seamless Competition Management",
      features: ["Bracket Systems", "Sign-up Management", "Live Statistics", "Prize Distribution"],
      color: "from-blue-500 to-teal-600"
    },
    {
      name: "Creator Connect",
      fullName: "Creator Network",
      description: "Platform for content creators, streamers, and influencers",
      tagline: "Where Creators Thrive",
      features: ["Creator Portfolios", "Brand Collaborations", "Content Tools", "Monetization"],
      color: "from-purple-500 to-pink-600"
    }
  ];

  // User benefits by type
  const userBenefits = [
    {
      type: "Players",
      icon: Gamepad,
      benefits: ["Competitive opportunities", "Skill development", "Performance tracking", "Community connection"],
      color: "text-blue-400"
    },
    {
      type: "Creators",
      icon: Star,
      benefits: ["Content tools", "Brand partnerships", "Audience growth", "Revenue streams"],
      color: "text-purple-400"
    },
    {
      type: "Tournament Organizers",
      icon: Trophy,
      benefits: ["Infrastructure tools", "Management systems", "Analytics dashboard", "Streamlined operations"],
      color: "text-yellow-400"
    },
    {
      type: "Brands & Partners",
      icon: Briefcase,
      benefits: ["Audience engagement", "Talent partnerships", "Data insights", "Community access"],
      color: "text-green-400"
    }
  ];

  // Ecosystem modules
  const ecosystemModules = [
    {
      name: "Competitive",
      description: "Tournament infrastructure and player development",
      icon: Target,
      features: ["AER Tournaments", "Ranking Systems", "Match Analytics"]
    },
    {
      name: "Social",
      description: "Community building and creator connections",
      icon: Users,
      features: ["Player Profiles", "Creator Network", "Community Hubs"]
    },
    {
      name: "Analytics",
      description: "Performance tracking and data insights",
      icon: BarChart3,
      features: ["Player Stats", "Tournament Data", "Platform Metrics"]
    },
    {
      name: "Monetization",
      description: "Revenue streams for all platform participants",
      icon: Zap,
      features: ["Prize Pools", "Creator Revenue", "Brand Partnerships"]
    }
  ];

  const handleWaitlistSignup = () => {
    toast({
      title: "Welcome to Domin8!",
      description: "You've been added to our waitlist. We'll notify you when early access opens!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-blue-800/30 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="https://images.unsplash.com/photo-1616389884404-2ab423ebddae?w=32&h=32&fit=crop&crop=center" alt="Domin8 Logo" className="h-8 w-8" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                Domin8
              </span>
            </div>
            <div className="hidden md:flex space-x-8">
              <button
                onClick={() => setSelectedTab("home")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  selectedTab === "home"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-300 hover:text-blue-400"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setSelectedTab("about")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  selectedTab === "about"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-300 hover:text-blue-400"
                }`}
              >
                About
              </button>
              <button
                onClick={() => setSelectedTab("aer")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  selectedTab === "aer"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-300 hover:text-blue-400"
                }`}
              >
                AER
              </button>
              <button
                onClick={() => setSelectedTab("partners")}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  selectedTab === "partners"
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-300 hover:text-blue-400"
                }`}
              >
                Partners
              </button>
            </div>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold"
              onClick={handleWaitlistSignup}
            >
              Join Waitlist
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-teal-600/20 blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-teal-200 bg-clip-text text-transparent">
            Powering the Next Era of Esports in Africa
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
            Domin8 is the digital infrastructure empowering esports, creators, and communities across Africa. Where players rise, creators thrive, and brands engage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold px-8 py-3 text-lg"
              onClick={handleWaitlistSignup}
            >
              Get Early Access
            </Button>
            <Button size="lg" variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black px-8 py-3 text-lg">
              Explore Platform
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Home Tab */}
        {selectedTab === "home" && (
          <div className="space-y-16">
            {/* What is Domin8 Section */}
            <section className="text-center">
              <h2 className="text-4xl font-bold text-white mb-6">What is Domin8?</h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-12">
                Domin8 is Africa's premier digital infrastructure platform designed to revolutionize the esports ecosystem. 
                We connect players, creators, organizers, and brands through innovative technology and community-driven experiences.
              </p>
              
              {/* Ecosystem Modules */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ecosystemModules.map((module, index) => (
                  <Card key={index} className="bg-black/40 border-blue-800/30 backdrop-blur-sm hover:border-blue-600/50 transition-all duration-300">
                    <CardHeader className="text-center">
                      <module.icon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <CardTitle className="text-white">{module.name}</CardTitle>
                      <CardDescription className="text-gray-400">{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-300">
                        {module.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Heart className="h-3 w-3 text-teal-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Featured Verticals */}
            <section>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Platform Verticals</h2>
                <p className="text-gray-400 text-lg">Specialized ecosystems designed for different aspects of African esports</p>
              </div>
              
              <div className="grid lg:grid-cols-3 gap-8">
                {verticals.map((vertical, index) => (
                  <Card key={index} className="bg-black/40 border-blue-800/30 backdrop-blur-sm hover:border-blue-600/50 transition-all duration-300 overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${vertical.color}`}></div>
                    <CardHeader>
                      <CardTitle className="text-white text-2xl">{vertical.name}</CardTitle>
                      <CardDescription className="text-lg font-semibold text-gray-200">{vertical.fullName}</CardDescription>
                      <p className="text-sm text-gray-400 italic">"{vertical.tagline}"</p>
                      <p className="text-gray-300">{vertical.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {vertical.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-teal-400" />
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Platform Benefits by User Type */}
            <section>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Built for Every Role in Esports</h2>
                <p className="text-gray-400 text-lg">Domin8 delivers value across the entire esports ecosystem</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {userBenefits.map((userType, index) => (
                  <Card key={index} className="bg-black/40 border-blue-800/30 backdrop-blur-sm hover:border-blue-600/50 transition-all duration-300">
                    <CardHeader className="text-center">
                      <userType.icon className={`h-12 w-12 mx-auto mb-4 ${userType.color}`} />
                      <CardTitle className="text-white">{userType.type}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {userType.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-300 text-sm">
                            <Star className="h-3 w-3 text-yellow-400" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="text-center">
              <Card className="bg-gradient-to-r from-blue-900/30 to-teal-900/30 border-blue-600/50 backdrop-blur-sm">
                <CardContent className="p-12">
                  <h2 className="text-4xl font-bold text-white mb-6">Ready to Join the Revolution?</h2>
                  <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                    Be among the first to experience Africa's most comprehensive esports platform. 
                    Early access members get exclusive benefits and priority access to all features.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold px-8 py-3 text-lg"
                      onClick={handleWaitlistSignup}
                    >
                      Join the Waitlist
                    </Button>
                    <Button size="lg" variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black px-8 py-3 text-lg">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        )}

        {/* About Tab */}
        {selectedTab === "about" && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-6">About Domin8</h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                Our vision is to power African esports infrastructure by creating a comprehensive ecosystem 
                that connects all stakeholders in the gaming community.
              </p>
            </div>
            
            <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6">Our Communities</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Trophy className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-white mb-2">AER Players</h4>
                    <p className="text-gray-400">Rising talent in competitive gaming seeking opportunities to showcase their skills</p>
                  </div>
                  <div className="text-center">
                    <Star className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-white mb-2">Creators</h4>
                    <p className="text-gray-400">Content creators and streamers building audiences and monetizing their passion</p>
                  </div>
                  <div className="text-center">
                    <Briefcase className="h-12 w-12 text-green-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-white mb-2">Partners</h4>
                    <p className="text-gray-400">Brands and organizations looking to engage with Africa's gaming community</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AER Tab */}
        {selectedTab === "aer" && (
          <div className="space-y-12">
            <div className="text-center">
              <div className="mb-6">
                <Badge className="bg-orange-600 text-white text-lg px-4 py-2 mb-4">AER</Badge>
                <h2 className="text-4xl font-bold text-white mb-4">African Esports Rising</h2>
                <p className="text-xl text-orange-400 font-semibold italic mb-4">"Grassroots Today. Greatness Tomorrow."</p>
                <p className="text-lg text-gray-300 max-w-4xl mx-auto">
                  AER is our dedicated vertical for Tier 2 & 3 players, providing competitive opportunities, 
                  talent development programs, and a clear pathway to professional esports.
                </p>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-black/40 border-orange-600/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-6 w-6 text-orange-400" />
                    Purpose & Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    AER focuses on creating sustainable competitive opportunities for emerging talent across Africa. 
                    We believe that every player deserves a chance to develop their skills and compete at their level.
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li>• Regular tournament opportunities</li>
                    <li>• Skill development programs</li>
                    <li>• Performance tracking and analytics</li>
                    <li>• Community building and networking</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 border-orange-600/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-orange-400" />
                    Talent Development
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    Our comprehensive tracking and development tools help players understand their progress 
                    and identify areas for improvement.
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Performance Analytics</span>
                      <span className="text-orange-400">Coming Soon</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Coaching Resources</span>
                      <span className="text-orange-400">Coming Soon</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tournament History</span>
                      <span className="text-orange-400">Coming Soon</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Partners Tab */}
        {selectedTab === "partners" && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-6">Partnership Opportunities</h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                Join us in building Africa's esports future. We offer various partnership opportunities 
                for brands, organizations, and stakeholders looking to engage with our growing community.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Brand Partnerships</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">Connect with Africa's gaming community through sponsorships, collaborations, and brand activations.</p>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-600">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Tournament Sponsorship</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">Support competitive gaming by sponsoring AER tournaments and other esports events.</p>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-600">
                    Get Involved
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Technology Partners</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">Integrate your technology solutions with our platform to enhance the gaming experience.</p>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-600">
                    Collaborate
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-blue-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="https://images.unsplash.com/photo-1616389884404-2ab423ebddae?w=32&h=32&fit=crop&crop=center" alt="Domin8 Logo" className="h-8 w-8" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  Domin8
                </span>
              </div>
              <p className="text-gray-400">Powering the next era of esports in Africa through innovative technology and community-driven experiences.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>AER - African Esports Rising</li>
                <li>Tournament Hub</li>
                <li>Creator Connect</li>
                <li>Analytics Dashboard</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Players</li>
                <li>Creators</li>
                <li>Tournament Organizers</li>
                <li>Partners & Brands</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Discord Community</li>
                <li>WhatsApp Groups</li>
                <li>Social Media</li>
                <li>Newsletter</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800/30 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Domin8. All rights reserved. Powering Africa's esports future.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
