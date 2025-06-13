
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { MessageList } from "./chat/MessageList";
import { MessageInput } from "./chat/MessageInput";
import { useTeamChat } from "@/hooks/useTeamChat";

interface TeamChatProps {
  teamId: string;
}

export const TeamChat = ({ teamId }: TeamChatProps) => {
  const { messages, loading, sending, sendMessage, user } = useTeamChat(teamId);

  if (loading) {
    return <div className="text-center text-gray-400">Loading chat...</div>;
  }

  return (
    <Card className="bg-black/40 border-blue-800/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Team Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MessageList messages={messages} currentUserId={user?.id} />
        <MessageInput onSendMessage={sendMessage} sending={sending} />
      </CardContent>
    </Card>
  );
};
