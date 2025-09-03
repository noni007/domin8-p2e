
import React, { Suspense } from 'react';
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LazyImage, withLazyLoad } from "@/components/performance/LazyLoadOptimizer";
import { PerformanceOptimizedLayout } from "@/components/performance/PerformanceOptimizedLayout";
import { LeaderboardSkeleton } from "@/components/rankings/LeaderboardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load components for better performance
const LazyGlobalLeaderboard = withLazyLoad(
  () => import("@/components/rankings/LazyGlobalLeaderboard").then(m => ({ default: m.LazyGlobalLeaderboard })),
  { delay: 150 }
);

const MobileOptimizedTierDistribution = withLazyLoad(
  () => import("@/components/rankings/MobileOptimizedTierDistribution").then(m => ({ default: m.MobileOptimizedTierDistribution })),
  { delay: 100 }
);

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
                <Suspense fallback={<LeaderboardSkeleton />}>
                  <LazyGlobalLeaderboard />
                </Suspense>
              </ErrorBoundary>
            </div>
            <div>
              <ErrorBoundary fallback={
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                  <p className="text-destructive">Unable to load tier distribution</p>
                </div>
              }>
                <Suspense fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                }>
                  <MobileOptimizedTierDistribution />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </PerformanceOptimizedLayout>
  );
};


