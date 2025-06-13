
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  Trophy, 
  DollarSign, 
  Settings, 
  Activity,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { AdminUserManagement } from "./AdminUserManagement";
import { AdminTournamentManagement } from "./AdminTournamentManagement";
import { AdminWalletManagement } from "./AdminWalletManagement";
import { AdminPlatformConfig } from "./AdminPlatformConfig";
import { AdminAuditLog } from "./AdminAuditLog";
import { supabase } from "@/integrations/supabase/client";

export const AdminDashboard = () => {
  const { isAdmin, adminRole, loading } = useAdmin();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTournaments: 0,
    totalRevenue: 0,
    pendingTransactions: 0
  });

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
    }
  }, [isAdmin]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch active tournaments
      const { count: tournamentCount } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true })
        .in('status', ['upcoming', 'active']);

      // Fetch total revenue (completed transactions)
      const { data: revenueData } = await supabase
        .from('wallet_transactions')
        .select('amount')
        .eq('status', 'completed')
        .in('transaction_type', ['tournament_fee']);

      const totalRevenue = revenueData?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Fetch pending transactions
      const { count: pendingCount } = await supabase
        .from('wallet_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalUsers: userCount || 0,
        activeTournaments: tournamentCount || 0,
        totalRevenue,
        pendingTransactions: pendingCount || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400">Loading admin dashboard...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-gray-400">You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center mt-2">
            <Badge className={`${
              adminRole === 'super_admin' ? 'bg-red-600' :
              adminRole === 'admin' ? 'bg-blue-600' : 'bg-green-600'
            } text-white`}>
              <Shield className="h-3 w-3 mr-1" />
              {adminRole?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
        <Button onClick={fetchDashboardStats} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh Stats
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Tournaments</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeTournaments}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${(stats.totalRevenue / 100).toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Pending Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pendingTransactions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-black/40 border-blue-800/30">
          <TabsTrigger value="users" className="data-[state=active]:bg-blue-600">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="data-[state=active]:bg-blue-600">
            <Trophy className="h-4 w-4 mr-2" />
            Tournaments
          </TabsTrigger>
          <TabsTrigger value="wallets" className="data-[state=active]:bg-blue-600">
            <DollarSign className="h-4 w-4 mr-2" />
            Wallets
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-blue-600">
            <Settings className="h-4 w-4 mr-2" />
            Config
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-blue-600">
            <Activity className="h-4 w-4 mr-2" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <AdminUserManagement />
        </TabsContent>

        <TabsContent value="tournaments">
          <AdminTournamentManagement />
        </TabsContent>

        <TabsContent value="wallets">
          <AdminWalletManagement />
        </TabsContent>

        <TabsContent value="config">
          <AdminPlatformConfig />
        </TabsContent>

        <TabsContent value="audit">
          <AdminAuditLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};
