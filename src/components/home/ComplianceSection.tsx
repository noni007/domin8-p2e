import { Shield, Lock, Check } from "lucide-react";

export const ComplianceSection = () => {
  return (
    <div className="bg-black/40 backdrop-blur-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-white mb-2">Trusted & Secure Platform</h3>
          <p className="text-sm text-gray-400">Your data and transactions are protected by industry-leading security standards</p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
          {/* GDPR Compliance */}
          <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700 hover:border-green-400 transition-colors group">
            <Shield className="h-4 w-4 text-green-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-sm font-medium text-white">GDPR</div>
              <div className="text-xs text-gray-400">Compliant</div>
            </div>
          </div>

          {/* PCI DSS Compliance */}
          <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700 hover:border-blue-400 transition-colors group">
            <Lock className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-sm font-medium text-white">PCI DSS</div>
              <div className="text-xs text-gray-400">Level 1</div>
            </div>
          </div>

          {/* SSL Encryption */}
          <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700 hover:border-green-400 transition-colors group">
            <Check className="h-4 w-4 text-green-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="text-sm font-medium text-white">SSL</div>
              <div className="text-xs text-gray-400">256-bit</div>
            </div>
          </div>

          {/* Data Protection */}
          <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700 hover:border-purple-400 transition-colors group">
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