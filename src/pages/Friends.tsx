
import { FriendsList } from "@/components/friends/FriendsList";

export const Friends = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Friends</h1>
          <p className="text-gray-400">Connect with other players and build your gaming network.</p>
        </div>
        
        <FriendsList />
      </div>
    </div>
  );
};

export default Friends;
