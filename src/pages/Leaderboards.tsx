
import { GlobalLeaderboard } from "@/components/rankings/GlobalLeaderboard";
import { TierDistribution } from "@/components/rankings/TierDistribution";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

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
            <ErrorBoundary fallback={
              <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-6 text-center">
                <p className="text-red-400">Unable to load leaderboard data</p>
              </div>
            }>
              <GlobalLeaderboard />
            </ErrorBoundary>
          </div>
          <div>
            <ErrorBoundary fallback={
              <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-6 text-center">
                <p className="text-red-400">Unable to load tier distribution</p>
              </div>
            }>
              <TierDistribution />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboards;
