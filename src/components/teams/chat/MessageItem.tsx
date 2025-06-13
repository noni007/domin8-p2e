
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type TeamMessage = Tables<'team_messages'> & {
  sender_profile: Tables<'profiles'>;
};

interface MessageItemProps {
  message: TeamMessage;
  isCurrentUser: boolean;
}

export const MessageItem = ({ message, isCurrentUser }: MessageItemProps) => {
  return (
    <div
      className={`flex space-x-3 ${
        isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''
      }`}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.sender_profile?.avatar_url || undefined} />
        <AvatarFallback>
          {message.sender_profile?.username?.charAt(0).toUpperCase() || 
           message.sender_profile?.email.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className={`max-w-[70%] ${
        isCurrentUser ? 'text-right' : ''
      }`}>
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-medium text-gray-300">
            {message.sender_profile?.username || message.sender_profile?.email}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>
        <div className={`p-3 rounded-lg ${
          isCurrentUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-100'
        }`}>
          <p className="text-sm">{message.message}</p>
        </div>
      </div>
    </div>
  );
};
