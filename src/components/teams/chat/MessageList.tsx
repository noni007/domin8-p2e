
import { useRef, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { MessageItem } from "./MessageItem";
import type { Tables } from "@/integrations/supabase/types";

type TeamMessage = Tables<'team_messages'> & {
  sender_profile: Tables<'profiles'>;
};

interface MessageListProps {
  messages: TeamMessage[];
  currentUserId: string | undefined;
}

export const MessageList = ({ messages, currentUserId }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-96 overflow-y-auto space-y-4 p-4 bg-black/20 rounded-lg">
      {messages.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <MessageSquare className="h-12 w-12 mx-auto mb-4" />
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isCurrentUser={message.sender_id === currentUserId}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
