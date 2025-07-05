import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Smartphone, Download, Play, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const MobileDevelopmentGuide = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-gray-300 hover:text-white mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">
            Mobile Development Guide
          </h1>
          <p className="text-xl text-gray-300">
            How to run Domin8 P2E on mobile devices using Capacitor
          </p>
        </div>

        {/* Prerequisites */}
        <Card className="mb-8 bg-black/20 border-blue-800/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Prerequisites
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <ul className="list-disc pl-6 space-y-2">
              <li>Node.js and npm installed</li>
              <li>Android Studio (for Android development)</li>
              <li>Xcode (for iOS development - Mac only)</li>
              <li>Git access to transfer the project</li>
            </ul>
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <Card className="mb-8 bg-black/20 border-blue-800/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Setup Instructions
            </CardTitle>
            <CardDescription className="text-gray-300">
              Follow these steps to get the mobile app running
            </CardDescription>
          </CardHeader>
          <CardContent className="text-gray-300">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">1. Export and Clone Project</h3>
                <p className="mb-2">Transfer the project to your GitHub repository:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Click "Export to Github" button in Lovable</li>
                  <li>Clone the repository to your local machine</li>
                  <li>Run <code className="bg-gray-800 px-2 py-1 rounded">npm install</code></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">2. Add Mobile Platforms</h3>
                <p className="mb-2">Add iOS and/or Android platforms:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><code className="bg-gray-800 px-2 py-1 rounded">npx cap add ios</code> (Mac only)</li>
                  <li><code className="bg-gray-800 px-2 py-1 rounded">npx cap add android</code></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">3. Update and Build</h3>
                <p className="mb-2">Update native dependencies and build:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><code className="bg-gray-800 px-2 py-1 rounded">npx cap update ios</code> or <code className="bg-gray-800 px-2 py-1 rounded">npx cap update android</code></li>
                  <li><code className="bg-gray-800 px-2 py-1 rounded">npm run build</code></li>
                  <li><code className="bg-gray-800 px-2 py-1 rounded">npx cap sync</code></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">4. Run on Device</h3>
                <p className="mb-2">Launch the app on a device or emulator:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><code className="bg-gray-800 px-2 py-1 rounded">npx cap run android</code></li>
                  <li><code className="bg-gray-800 px-2 py-1 rounded">npx cap run ios</code> (Mac only)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testing Features */}
        <Card className="mb-8 bg-black/20 border-blue-800/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              What to Test
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Tournament Registration:</strong> Join tournaments and test mobile-optimized forms</li>
              <li><strong>Real-time Updates:</strong> Match results and leaderboard changes</li>
              <li><strong>Wallet Functionality:</strong> Deposits, withdrawals, and transaction history</li>
              <li><strong>Push Notifications:</strong> Tournament updates and match notifications</li>
              <li><strong>Social Features:</strong> Friend system and team management</li>
              <li><strong>Performance:</strong> Loading times and smooth navigation</li>
            </ul>
          </CardContent>
        </Card>

        {/* Hot Reload Info */}
        <Card className="bg-black/20 border-blue-800/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Play className="h-5 w-5 mr-2" />
              Development Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <p className="mb-4">
              <strong>Hot Reload Enabled:</strong> The mobile app is configured to connect directly to the Lovable preview URL, 
              so any changes made in Lovable will instantly appear on your mobile device without rebuilding.
            </p>
            <p>
              This makes it perfect for rapid testing and development with your team!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileDevelopmentGuide;