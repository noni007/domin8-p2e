import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestingSuite } from '@/components/testing/TestingSuite';
import { MobileTestingSuite } from '@/components/testing/MobileTestingSuite';
import { PerformanceOptimizer } from '@/components/testing/PerformanceOptimizer';
import { FinalIntegrationSuite } from '@/components/testing/FinalIntegrationSuite';
import { ProductionReadinessChecker } from '@/components/testing/ProductionReadinessChecker';

export function Testing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-teal-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Testing & Quality Assurance</h1>
          <p className="text-xl text-gray-300">Comprehensive testing suite for all platform features</p>
        </div>

        <Tabs defaultValue="readiness" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-black/20">
            <TabsTrigger value="readiness">Production</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="functional">Functional</TabsTrigger>
          </TabsList>

          <TabsContent value="readiness">
            <ProductionReadinessChecker />
          </TabsContent>

          <TabsContent value="integration">
            <FinalIntegrationSuite />
          </TabsContent>

          <TabsContent value="mobile">
            <MobileTestingSuite />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceOptimizer />
          </TabsContent>

          <TabsContent value="functional">
            <TestingSuite />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}