
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { MembersList } from "./members/MembersList";
import { useTeamMembers } from "@/hooks/useTeamMembers";

interface TeamMembersProps {
  teamId: string;
}

export const TeamMembers = ({ teamId }: TeamMembersProps) => {
  const { members, loading, canManageMembers, removeMember, user } = useTeamMembers(teamId);

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Team Members ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MembersList
          members={members}
          currentUserId={user?.id}
          onRemoveMember={removeMember}
          canManageMembers={canManageMembers}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
};
