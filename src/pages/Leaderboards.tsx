
import React from 'react';
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { PerformanceOptimizedLayout } from "@/components/performance/PerformanceOptimizedLayout";
import { LazyGlobalLeaderboard } from "@/components/rankings/LazyGlobalLeaderboard";
import { MobileOptimizedTierDistribution } from "@/components/rankings/MobileOptimizedTierDistribution";

export const Leaderboards = () => {
  return (
    <PerformanceOptimizedLayout priority="high">
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Tournament Leaderboards</h1>
            <p className="text-muted-foreground">See how you stack up against the competition in tournaments across Africa.</p>
          </div>
          
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ErrorBoundary fallback={
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                  <p className="text-destructive">Unable to load leaderboard data</p>
                </div>
              }>
            <LazyGlobalLeaderboard />
              </ErrorBoundary>
            </div>
            <div>
              <ErrorBoundary fallback={
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                  <p className="text-destructive">Unable to load tier distribution</p>
                </div>
              }>
            <MobileOptimizedTierDistribution />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </PerformanceOptimizedLayout>
  );
};


