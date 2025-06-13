
// This file is deprecated - now using the integrated Supabase client
// All imports should use: import { supabase } from "@/integrations/supabase/client"

export * from "@/integrations/supabase/client";

// Re-export types using Supabase's generated types
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<'profiles'>;
export type Tournament = Tables<'tournaments'>;
export type TournamentParticipant = Tables<'tournament_participants'>;
export type Match = Tables<'matches'>;
export type Notification = Tables<'notifications'>;
export type NotificationPreferences = Tables<'notification_preferences'>;
export type Team = Tables<'teams'>;
export type TeamMember = Tables<'team_members'>;
export type TeamInvitation = Tables<'team_invitations'>;
export type TeamMessage = Tables<'team_messages'>;

export interface BracketNode {
  id: string
  match: Match | null
  player1: TournamentParticipant | null
  player2: TournamentParticipant | null
  winner: TournamentParticipant | null
  round: number
  position: number
  nextMatchId?: string
}
