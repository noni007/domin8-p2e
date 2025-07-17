import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  BarChart3, 
  Activity, 
  Settings,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { AdminWeb3Config } from './AdminWeb3Config';
import { Web3TournamentDashboard } from './Web3TournamentDashboard';
import { RealtimeWeb3Monitor } from './RealtimeWeb3Monitor';
import { Web3AnalyticsDashboard } from './Web3AnalyticsDashboard';

export const Web3AdminDashboard = () => {
  const { isAdmin, adminRole, loading } = useAdmin();

  if (loading) {
    return <div className="text-center text-gray-400">Loading Web3 admin dashboard...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-gray-400">You don't have permission to access the Web3 admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Web3 Admin Dashboard</h1>
          <div className="flex items-center mt-2">
            <Badge className={`${
              adminRole === 'super_admin' ? 'bg-red-600' :
              adminRole === 'admin' ? 'bg-blue-600' : 'bg-green-600'
            } text-white`}>
              <Wallet className="h-3 w-3 mr-1" />
              Web3 {adminRole?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Web3 Admin Tabs */}
      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="tournaments">
            <Zap className="h-4 w-4 mr-2" />
            Tournaments
          </TabsTrigger>
          <TabsTrigger value="monitor">
            <Activity className="h-4 w-4 mr-2" />
            Monitor
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <AdminWeb3Config />
        </TabsContent>

        <TabsContent value="tournaments">
          <Web3TournamentDashboard />
        </TabsContent>

        <TabsContent value="monitor">
          <RealtimeWeb3Monitor />
        </TabsContent>

        <TabsContent value="analytics">
          <Web3AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};