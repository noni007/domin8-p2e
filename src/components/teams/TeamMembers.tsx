
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Shield, Users, UserPlus, UserMinus, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type TeamMember = Tables<'team_members'> & {
  profiles: Tables<'profiles'>;
};

interface TeamMembersProps {
  teamId: string;
  userRole: string | null;
  onUpdate: () => void;
}

export const TeamMembers = ({ teamId, userRole, onUpdate }: TeamMembersProps) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [teamId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles(*)
        `)
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userRole || !['owner', 'admin'].includes(userRole)) return;

    setInviting(true);
    try {
      // First find the user by email
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail)
        .single();

      if (profileError || !profileData) {
        toast({
          title: "Error",
          description: "User not found with that email.",
          variant: "destructive"
        });
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', profileData.id)
        .single();

      if (existingMember) {
        toast({
          title: "Error",
          description: "User is already a team member.",
          variant: "destructive"
        });
        return;
      }

      // Create invitation
      const { error } = await supabase
        .from('team_invitations')
        .insert({
          team_id: teamId,
          invited_by: user.id,
          invited_user_id: profileData.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation sent successfully!",
      });

      setInviteEmail('');
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation.",
        variant: "destructive"
      });
    } finally {
      setInviting(false);
    }
  };

  const handlePromote = async (memberId: string, currentRole: string) => {
    if (!userRole || userRole !== 'owner') return;

    const newRole = currentRole === 'member' ? 'admin' : currentRole === 'admin' ? 'owner' : 'member';
    
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Member role updated to ${newRole}.`,
      });

      fetchMembers();
      onUpdate();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role.",
        variant: "destructive"
      });
    }
  };

  const handleRemove = async (memberId: string, memberUserId: string) => {
    if (!userRole || !['owner', 'admin'].includes(userRole) || memberUserId === user?.id) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed from team.",
      });

      fetchMembers();
      onUpdate();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member.",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-400" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-400" />;
      default:
        return <Users className="h-4 w-4 text-gray-400" />;
    }
  };

  const canManageMembers = userRole && ['owner', 'admin'].includes(userRole);

  if (loading) {
    return <div className="text-center text-gray-400">Loading members...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Invite Members */}
      {canManageMembers && (
        <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Invite Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex space-x-2">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                required
                className="bg-black/20 border-blue-800/30 text-white"
              />
              <Button
                type="submit"
                disabled={inviting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                {inviting ? 'Inviting...' : 'Invite'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Team Members ({members.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 rounded-lg bg-black/20">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={member.profiles.avatar_url || undefined} />
                    <AvatarFallback>
                      {member.profiles.username?.charAt(0).toUpperCase() || 
                       member.profiles.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">
                      {member.profiles.username || member.profiles.email}
                    </p>
                    <p className="text-sm text-gray-400">{member.profiles.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="flex items-center space-x-1">
                    {getRoleIcon(member.role)}
                    <span className="capitalize">{member.role}</span>
                  </Badge>

                  {canManageMembers && member.user_id !== user?.id && (
                    <div className="flex space-x-2">
                      {userRole === 'owner' && member.role !== 'owner' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePromote(member.id, member.role)}
                        >
                          {member.role === 'member' ? 'Promote' : 'Demote'}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemove(member.id, member.user_id)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
