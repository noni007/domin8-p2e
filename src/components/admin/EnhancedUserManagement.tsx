import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Shield, 
  Mail, 
  Calendar,
  MoreHorizontal,
  Ban,
  UnlockKeyhole
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<'profiles'>;

interface UserWithStats extends Profile {
  tournament_count?: number;
  wallet_balance?: number;
  last_activity?: string;
  is_banned?: boolean;
  admin_role?: string;
}

export const EnhancedUserManagement = () => {
  const { isAdmin, adminRole, logAdminAction } = useAdmin();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users with extended stats
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_wallets(balance),
          admin_roles(role)
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Enhance with tournament participation count
      const enhancedUsers = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count: tournamentCount } = await supabase
            .from('tournament_participants')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);

          const { data: activityData } = await supabase
            .from('user_activities')
            .select('created_at')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            ...profile,
            tournament_count: tournamentCount || 0,
            wallet_balance: (profile as any).user_wallets?.[0]?.balance || 0,
            last_activity: activityData?.[0]?.created_at,
            admin_role: (profile as any).admin_roles?.[0]?.role,
            is_banned: profile.user_type === 'banned'
          };
        })
      );

      setUsers(enhancedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: "Error", description: 'Error fetching users' });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserBan = async (userId: string, currentlyBanned: boolean) => {
    try {
      const newStatus = currentlyBanned ? 'player' : 'banned';
      
      await supabase
        .from('profiles')
        .update({ user_type: newStatus })
        .eq('id', userId);

      await logAdminAction(
        currentlyBanned ? 'user_unbanned' : 'user_banned',
        'user',
        userId,
        { previous_status: currentlyBanned ? 'banned' : 'active' }
      );

      toast({ title: "Success", description: `User ${currentlyBanned ? 'unbanned' : 'banned'} successfully` });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user ban:', error);
      toast({ title: "Error", description: 'Error updating user status' });
    }
  };

  const promoteToAdmin = async (userId: string, role: 'admin' | 'moderator') => {
    if (adminRole !== 'super_admin') {
      toast({ title: "Access Denied", description: 'Only super admins can promote users' });
      return;
    }

    try {
      await supabase
        .from('admin_roles')
        .insert({
          user_id: userId,
          role,
          granted_by: userId // Should be current admin user ID
        });

      await logAdminAction('user_promoted', 'user', userId, { role });
      toast({ title: "Success", description: `User promoted to ${role} successfully` });
      fetchUsers();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({ title: "Error", description: 'Error promoting user' });
    }
  };

  const revokeAdminRole = async (userId: string) => {
    if (adminRole !== 'super_admin') {
      toast({ title: "Access Denied", description: 'Only super admins can revoke admin roles' });
      return;
    }

    try {
      await supabase
        .from('admin_roles')
        .delete()
        .eq('user_id', userId);

      await logAdminAction('admin_role_revoked', 'user', userId);
      toast({ title: "Success", description: 'Admin role revoked successfully' });
      fetchUsers();
    } catch (error) {
      console.error('Error revoking admin role:', error);
      toast({ title: "Error", description: 'Error revoking admin role' });
    }
  };

  const sendNotificationToUser = async (userId: string, title: string, message: string) => {
    try {
      // Insert notification (assuming notifications table exists)
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'admin_message',
          title,
          message
        });

      await logAdminAction('notification_sent', 'user', userId, { title, message });
      toast({ title: "Success", description: 'Notification sent successfully' });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({ title: "Error", description: 'Error sending notification' });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'banned' && user.is_banned) ||
                         (statusFilter === 'active' && !user.is_banned);
    
    const matchesRole = roleFilter === 'all' ||
                       (roleFilter === 'admin' && user.admin_role) ||
                       (roleFilter === 'player' && !user.admin_role);

    return matchesSearch && matchesStatus && matchesRole;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const getUserStatusBadge = (user: UserWithStats) => {
    if (user.is_banned) {
      return <Badge className="bg-red-600 text-white">Banned</Badge>;
    }
    if (user.admin_role) {
      return <Badge className="bg-blue-600 text-white">{user.admin_role}</Badge>;
    }
    return <Badge className="bg-green-600 text-white">Active</Badge>;
  };

  if (!isAdmin) {
    return <div className="text-center text-red-400">Access denied</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Enhanced User Management</h2>
        <div className="flex items-center gap-2">
          <Button onClick={fetchUsers} variant="outline" size="sm">
            Refresh
          </Button>
          {selectedUsers.length > 0 && (
            <Badge className="bg-blue-600 text-white">
              {selectedUsers.length} selected
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search" className="text-gray-300">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status" className="text-gray-300">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="role" className="text-gray-300">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="player">Players</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
              <p className="text-gray-400 mt-2">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Tournaments</TableHead>
                    <TableHead className="text-gray-300">Wallet</TableHead>
                    <TableHead className="text-gray-300">Last Activity</TableHead>
                    <TableHead className="text-gray-300">Joined</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-gray-700">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                            {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {user.username || 'No username'}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getUserStatusBadge(user)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {user.tournament_count || 0}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        ${((user.wallet_balance || 0) / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {formatDate(user.last_activity)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!user.is_banned ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => toggleUserBan(user.id, false)}
                            >
                              <Ban className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleUserBan(user.id, true)}
                            >
                              <UnlockKeyhole className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {!user.admin_role && adminRole === 'super_admin' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => promoteToAdmin(user.id, 'moderator')}
                            >
                              <Shield className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {user.admin_role && adminRole === 'super_admin' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => revokeAdminRole(user.id)}
                            >
                              <UserX className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendNotificationToUser(
                              user.id, 
                              'Admin Notice', 
                              'You have received a message from the administration team.'
                            )}
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No users found matching the current filters.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};