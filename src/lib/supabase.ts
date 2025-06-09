
// This file is deprecated - now using the integrated Supabase client
// All imports should use: import { supabase } from "@/integrations/supabase/client"

export * from "@/integrations/supabase/client";

// Re-export types for backward compatibility
export interface Profile {
  id: string
  username: string | null
  email: string
  user_type: 'player' | 'creator' | 'organizer' | 'brand'
  avatar_url?: string | null
  bio?: string | null
  created_at: string
  updated_at: string
}

export interface Tournament {
  id: string
  title: string
  description: string
  game: string
  prize_pool: number
  max_participants: number
  start_date: string
  end_date: string
  registration_deadline: string
  status: 'upcoming' | 'registration_open' | 'in_progress' | 'completed'
  organizer_id: string
  bracket_generated: boolean
  created_at: string
  updated_at: string
}

export interface TournamentParticipant {
  id: string
  tournament_id: string
  user_id: string
  team_name?: string
  registration_date: string
  status: 'registered' | 'checked_in' | 'disqualified'
}

export interface Match {
  id: string
  tournament_id: string
  round: number
  match_number: number
  player1_id: string
  player2_id?: string
  winner_id?: string
  score_player1?: number
  score_player2?: number
  scheduled_time: string
  status: 'scheduled' | 'in_progress' | 'completed'
  bracket_position: number
  created_at: string
}

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
