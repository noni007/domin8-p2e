
import { GlobalLeaderboard } from "@/components/rankings/GlobalLeaderboard";
import { TierDistribution } from "@/components/rankings/TierDistribution";

export const Leaderboards = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboards</h1>
          <p className="text-gray-400">See how you stack up against the competition across Africa.</p>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <GlobalLeaderboard />
          </div>
          <div>
            <TierDistribution />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;
