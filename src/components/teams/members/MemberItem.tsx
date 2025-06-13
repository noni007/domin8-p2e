
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserMinus, Crown, Shield } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type TeamMember = Tables<'team_members'> & {
  member_profile: Tables<'profiles'>;
};

interface MemberItemProps {
  member: TeamMember;
  currentUserId: string | undefined;
  onRemoveMember: (memberId: string) => void;
  canManageMembers: boolean;
}

export const MemberItem = ({ member, currentUserId, onRemoveMember, canManageMembers }: MemberItemProps) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-400" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-600';
      case 'admin':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={member.member_profile?.avatar_url || undefined} />
          <AvatarFallback>
            {member.member_profile?.username?.charAt(0).toUpperCase() || 
             member.member_profile?.email.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-white font-medium">
              {member.member_profile?.username || member.member_profile?.email}
            </h3>
            {getRoleIcon(member.role)}
          </div>
          <p className="text-gray-400 text-sm">
            Joined {new Date(member.joined_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Badge className={getRoleColor(member.role)}>
          {member.role}
        </Badge>
        {canManageMembers && 
         member.role !== 'owner' && 
         member.user_id !== currentUserId && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRemoveMember(member.id)}
            className="border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
          >
            <UserMinus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
