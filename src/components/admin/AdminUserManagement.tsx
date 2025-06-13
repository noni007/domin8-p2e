
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Shield, Ban, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<'profiles'>;

interface UserWithRole extends Profile {
  admin_role?: string;
}

export const AdminUserManagement = () => {
  const { adminRole, logAdminAction } = useAdmin();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          admin_roles(role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        admin_role: (profile as any).admin_roles?.[0]?.role
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const grantAdminRole = async (userId: string, role: 'admin' | 'moderator') => {
    if (adminRole !== 'super_admin') {
      toast({
        title: "Access Denied",
        description: "Only super admins can grant admin roles",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_roles')
        .upsert({
          user_id: userId,
          role,
          granted_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      await logAdminAction('grant_admin_role', 'user', userId, { role });
      await fetchUsers();

      toast({
        title: "Success",
        description: `${role} role granted successfully`,
      });
    } catch (error) {
      console.error('Error granting admin role:', error);
      toast({
        title: "Error",
        description: "Failed to grant admin role",
        variant: "destructive"
      });
    }
  };

  const revokeAdminRole = async (userId: string) => {
    if (adminRole !== 'super_admin') {
      toast({
        title: "Access Denied",
        description: "Only super admins can revoke admin roles",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      await logAdminAction('revoke_admin_role', 'user', userId);
      await fetchUsers();

      toast({
        title: "Success",
        description: "Admin role revoked successfully",
      });
    } catch (error) {
      console.error('Error revoking admin role:', error);
      toast({
        title: "Error",
        description: "Failed to revoke admin role",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || 
                       (filterRole === "admin" && user.admin_role) ||
                       (filterRole === "user" && !user.admin_role) ||
                       (filterRole === user.admin_role);
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <div className="text-center text-gray-400">Loading users...</div>;
  }

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          User Management ({filteredUsers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/20 border-blue-800/30 text-white"
              />
            </div>
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-48 bg-black/20 border-blue-800/30 text-white">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="user">Regular Users</SelectItem>
              <SelectItem value="super_admin">Super Admins</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="moderator">Moderators</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-blue-800/30">
                <TableHead className="text-gray-300">User</TableHead>
                <TableHead className="text-gray-300">Email</TableHead>
                <TableHead className="text-gray-300">Type</TableHead>
                <TableHead className="text-gray-300">Role</TableHead>
                <TableHead className="text-gray-300">Joined</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-blue-800/30">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {user.username?.slice(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white font-medium">
                        {user.username || "No username"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-blue-400 border-blue-400">
                      {user.user_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.admin_role ? (
                      <Badge className={`${
                        user.admin_role === 'super_admin' ? 'bg-red-600' :
                        user.admin_role === 'admin' ? 'bg-blue-600' : 'bg-green-600'
                      } text-white`}>
                        {user.admin_role.replace('_', ' ')}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">User</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {adminRole === 'super_admin' && !user.admin_role && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => grantAdminRole(user.id, 'moderator')}
                            className="text-green-400 border-green-400 hover:bg-green-400 hover:text-black"
                          >
                            Make Mod
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => grantAdminRole(user.id, 'admin')}
                            className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black"
                          >
                            Make Admin
                          </Button>
                        </>
                      )}
                      {adminRole === 'super_admin' && user.admin_role && user.admin_role !== 'super_admin' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => revokeAdminRole(user.id)}
                          className="text-red-400 border-red-400 hover:bg-red-400 hover:text-black"
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
