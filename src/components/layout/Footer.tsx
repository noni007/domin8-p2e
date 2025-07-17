
import { Button } from "@/components/ui/button";
import { 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  MapPin, 
  Phone
} from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/60 backdrop-blur-sm border-t border-blue-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4 text-left">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/be31ac20-7045-4c65-bf6f-1dda987cd378.png" 
                alt="Logo" 
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-300 leading-relaxed">
              Africa's premier esports ranking platform, connecting gamers across the continent for competitive glory and community building.
            </p>
            <div className="flex space-x-4">
              <Button size="icon" variant="ghost" className="text-gray-400 hover:text-lime-400">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-gray-400 hover:text-lime-400">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-gray-400 hover:text-lime-400">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 text-left">
            <h3 className="text-lg font-semibold text-white">Platform</h3>
            <div className="space-y-2">
              <a href="/tournaments" className="block text-gray-300 hover:text-lime-400 transition-colors">
                Tournaments
              </a>
              <a href="/leaderboards" className="block text-gray-300 hover:text-lime-400 transition-colors">
                Leaderboards
              </a>
              <a href="/rankings" className="block text-gray-300 hover:text-lime-400 transition-colors">
                Rankings
              </a>
              <a href="/friends" className="block text-gray-300 hover:text-lime-400 transition-colors">
                Community
              </a>
              <a href="/profile" className="block text-gray-300 hover:text-lime-400 transition-colors">
                Profile
              </a>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4 text-left">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-300 hover:text-lime-400 transition-colors">
                Help Center
              </a>
              <a href="#" className="block text-gray-300 hover:text-lime-400 transition-colors">
                Tournament Rules
              </a>
              <a href="#" className="block text-gray-300 hover:text-lime-400 transition-colors">
                Fair Play Policy
              </a>
              <a href="#" className="block text-gray-300 hover:text-lime-400 transition-colors">
                Report Issues
              </a>
              <a href="#" className="block text-gray-300 hover:text-lime-400 transition-colors">
                Contact Us
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 text-left">
            <h3 className="text-lg font-semibold text-white">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="h-4 w-4 text-lime-400" />
                <span className="text-sm">support@domin8.africa</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="h-4 w-4 text-lime-400" />
                <span className="text-sm">+27 (0) 11 123 4567</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="h-4 w-4 text-lime-400" />
                <span className="text-sm">Cape Town, South Africa</span>
              </div>
            </div>
            
            <div className="pt-4">
              <h4 className="text-sm font-semibold text-white mb-2">Newsletter</h4>
              <p className="text-xs text-gray-400 mb-3">Get tournament updates and esports news</p>
              <div className="flex space-x-2">
                <input 
                  type="email" 
                  placeholder="Enter email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-lime-400"
                />
                <Button size="sm" className="bg-lime-500 hover:bg-lime-600 text-black">
                  Join
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} Domin8. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-lime-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-lime-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-lime-400 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
