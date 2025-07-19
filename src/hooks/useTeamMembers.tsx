import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { useSimpleToast } from "@/hooks/useSimpleToast";

type TeamMember = Tables<'team_members'> & {
  member_profile: Tables<'profiles'>;
};

export const useTeamMembers = (teamId: string) => {
  const { user } = useAuth();
  const { toast } = useSimpleToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
    fetchUserRole();
  }, [teamId]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          member_profile:profiles(*)
        `)
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({ title: "Error", description: "Failed to load team members.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setUserRole(data?.role || null);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setMembers(prev => prev.filter(member => member.id !== memberId));
      toast({ title: "Success", description: "Member removed from team." });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({ title: "Error", description: "Failed to remove member.", variant: "destructive" });
    }
  };

  const canManageMembers = userRole === 'owner' || userRole === 'admin';

  return {
    members,
    loading,
    userRole,
    canManageMembers,
    removeMember,
    user
  };
};