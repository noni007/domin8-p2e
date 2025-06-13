
import { Users } from "lucide-react";
import { MemberItem } from "./MemberItem";
import type { Tables } from "@/integrations/supabase/types";

type TeamMember = Tables<'team_members'> & {
  member_profile: Tables<'profiles'>;
};

interface MembersListProps {
  members: TeamMember[];
  currentUserId: string | undefined;
  onRemoveMember: (memberId: string) => void;
  canManageMembers: boolean;
  loading: boolean;
}

export const MembersList = ({ 
  members, 
  currentUserId, 
  onRemoveMember, 
  canManageMembers, 
  loading 
}: MembersListProps) => {
  if (loading) {
    return <div className="text-center text-gray-400">Loading members...</div>;
  }

  return (
    <div className="space-y-4">
      {members.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No members yet</p>
        </div>
      ) : (
        members.map((member) => (
          <MemberItem
            key={member.id}
            member={member}
            currentUserId={currentUserId}
            onRemoveMember={onRemoveMember}
            canManageMembers={canManageMembers}
          />
        ))
      )}
    </div>
  );
};
