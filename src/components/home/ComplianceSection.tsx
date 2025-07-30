import { Shield, Lock, Check } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useMobileInteractions } from "@/hooks/useMobileInteractions";

export const ComplianceSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { createTouchHandler } = useMobileInteractions();
  return (
    <div ref={ref} className="bg-black/40 backdrop-blur-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-8 transition-all duration-1000 ${
          isVisible ? 'opacity-100 animate-fadeInUp' : 'opacity-0 translate-y-10'
        }`}>
          <h3 className="text-xl font-semibold text-white mb-2">Trusted & Secure Platform</h3>
          <p className="text-sm text-gray-400">Your data and transactions are protected by industry-leading security standards</p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
          {/* PCI DSS Compliance */}
          <div 
            className={`flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700 hover:border-blue-400 transition-all duration-300 group hover-scale cursor-pointer ${
              isVisible ? 'opacity-100 animate-fadeInUp' : 'opacity-0 translate-y-10'
            }`}
            style={{ animationDelay: '200ms' }}
            {...createTouchHandler(() => {}, 'light')}
          >
            <Lock className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-sm font-medium text-white">PCI DSS</div>
              <div className="text-xs text-gray-400">Level 1</div>
            </div>
          </div>

          {/* SSL Encryption */}
          <div 
            className={`flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700 hover:border-green-400 transition-all duration-300 group hover-scale cursor-pointer ${
              isVisible ? 'opacity-100 animate-fadeInUp' : 'opacity-0 translate-y-10'
            }`}
            style={{ animationDelay: '400ms' }}
            {...createTouchHandler(() => {}, 'light')}
          >
            <Check className="h-4 w-4 text-green-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-sm font-medium text-white">SSL</div>
              <div className="text-xs text-gray-400">256-bit</div>
            </div>
          </div>

          {/* Data Protection */}
          <div 
            className={`flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700 hover:border-purple-400 transition-all duration-300 group hover-scale cursor-pointer ${
              isVisible ? 'opacity-100 animate-fadeInUp' : 'opacity-0 translate-y-10'
            }`}
            style={{ animationDelay: '600ms' }}
            {...createTouchHandler(() => {}, 'light')}
          >
            <Shield className="h-4 w-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-sm font-medium text-white">ISO 27001</div>
              <div className="text-xs text-gray-400">Certified</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};