import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Provide fallback values during development to prevent app crashes
const defaultUrl = supabaseUrl || 'https://your-project.supabase.co'
const defaultKey = supabaseAnonKey || 'your-anon-key'

// Only throw error in production or when explicitly needed
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(defaultUrl, defaultKey)

// Database types
export interface Profile {
  id: string
  username: string
  email: string
  user_type: 'player' | 'creator' | 'organizer' | 'brand'
  avatar_url?: string
  bio?: string
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
