
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "@/components/auth/AuthModal";
import { User, Settings, LogOut, Trophy, BarChart3, Users } from "lucide-react";

interface UserMenuProps {
  user: any;
  onSignOut: () => void;
}

export const UserMenu = ({ user, onSignOut }: UserMenuProps) => {
  const { profile } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!user) {
    return (
      <>
        <Button 
          onClick={() => setShowAuthModal(true)}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold"
        >
          Login / Sign Up
        </Button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  const getUserInitials = () => {
    if (profile?.username) {
      return profile.username.slice(0, 2).toUpperCase();
    }
    return user.email?.slice(0, 2).toUpperCase() || "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-blue-400">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username || "User"} />
            <AvatarFallback className="bg-blue-600 text-white">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-black/95 border-blue-800/30 text-white" 
        align="end"
      >
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-white">
              {profile?.username || "User"}
            </p>
            <p className="w-[200px] truncate text-sm text-gray-400">
              {user.email}
            </p>
            {profile?.user_type && (
              <p className="text-xs text-blue-400 capitalize">
                {profile.user_type}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator className="bg-blue-800/30" />
        <DropdownMenuItem 
          className="text-white hover:bg-blue-900/50 cursor-pointer"
          onClick={() => window.location.href = '/profile'}
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-white hover:bg-blue-900/50 cursor-pointer"
          onClick={() => window.location.href = '/friends'}
        >
          <Users className="mr-2 h-4 w-4" />
          Friends
        </DropdownMenuItem>
        <DropdownMenuItem className="text-white hover:bg-blue-900/50 cursor-pointer">
          <Trophy className="mr-2 h-4 w-4" />
          My Tournaments
        </DropdownMenuItem>
        <DropdownMenuItem className="text-white hover:bg-blue-900/50 cursor-pointer">
          <BarChart3 className="mr-2 h-4 w-4" />
          Statistics
        </DropdownMenuItem>
        <DropdownMenuItem className="text-white hover:bg-blue-900/50 cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-blue-800/30" />
        <DropdownMenuItem 
          className="text-red-400 hover:bg-red-900/50 cursor-pointer"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
