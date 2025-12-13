export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          condition_data: Json | null
          condition_type: string
          created_at: string
          description: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          reward_amount: number
          updated_at: string
        }
        Insert: {
          category?: string
          condition_data?: Json | null
          condition_type: string
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          reward_amount?: number
          updated_at?: string
        }
        Update: {
          category?: string
          condition_data?: Json | null
          condition_type?: string
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          reward_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      crypto_transactions: {
        Row: {
          amount_formatted: number
          amount_wei: string
          block_number: number | null
          confirmed_at: string | null
          created_at: string
          gas_price_wei: string | null
          gas_used: number | null
          id: string
          metadata: Json | null
          network_id: number
          related_match_id: string | null
          related_tournament_id: string | null
          status: string
          token_address: string | null
          token_symbol: string
          transaction_hash: string
          transaction_type: string
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount_formatted: number
          amount_wei: string
          block_number?: number | null
          confirmed_at?: string | null
          created_at?: string
          gas_price_wei?: string | null
          gas_used?: number | null
          id?: string
          metadata?: Json | null
          network_id: number
          related_match_id?: string | null
          related_tournament_id?: string | null
          status?: string
          token_address?: string | null
          token_symbol?: string
          transaction_hash: string
          transaction_type: string
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          amount_formatted?: number
          amount_wei?: string
          block_number?: number | null
          confirmed_at?: string | null
          created_at?: string
          gas_price_wei?: string | null
          gas_used?: number | null
          id?: string
          metadata?: Json | null
          network_id?: number
          related_match_id?: string | null
          related_tournament_id?: string | null
          status?: string
          token_address?: string | null
          token_symbol?: string
          transaction_hash?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      feature_waitlist: {
        Row: {
          created_at: string
          email: string
          feature_name: string
          id: string
          join_position: number
          referral_code: string
          referred_by: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          feature_name?: string
          id?: string
          join_position: number
          referral_code?: string
          referred_by?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          feature_name?: string
          id?: string
          join_position?: number
          referral_code?: string
          referred_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_index?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          author_id: string
          category_id: string
          content: string
          created_at: string
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          last_reply_at: string | null
          reply_count: number | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_id: string
          category_id: string
          content: string
          created_at?: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          reply_count?: number | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_id?: string
          category_id?: string
          content?: string
          created_at?: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          reply_count?: number | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_post_author"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_post_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_reply_author"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reply_post"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_media: {
        Row: {
          created_at: string
          file_path: string | null
          generation_data: Json | null
          generation_model: string | null
          id: string
          image_url: string | null
          media_type: string
          prompt: string
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_path?: string | null
          generation_data?: Json | null
          generation_model?: string | null
          id?: string
          image_url?: string | null
          media_type: string
          prompt: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_path?: string | null
          generation_data?: Json | null
          generation_model?: string | null
          id?: string
          image_url?: string | null
          media_type?: string
          prompt?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      live_match_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          match_id: string
          metadata: Json | null
          spectator_count: number | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          match_id: string
          metadata?: Json | null
          spectator_count?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          match_id?: string
          metadata?: Json | null
          spectator_count?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_live_match"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_events: {
        Row: {
          created_at: string
          created_by: string | null
          event_data: Json | null
          event_type: string
          id: string
          match_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          match_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          match_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_event_match"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_spectators: {
        Row: {
          id: string
          is_active: boolean | null
          joined_at: string
          left_at: string | null
          match_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          joined_at?: string
          left_at?: string | null
          match_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          joined_at?: string
          left_at?: string | null
          match_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_spectator_match"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_spectator_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          bracket_position: number
          created_at: string
          id: string
          match_number: number
          player1_id: string
          player2_id: string | null
          round: number
          scheduled_time: string
          score_player1: number | null
          score_player2: number | null
          status: string
          tournament_id: string
          winner_id: string | null
        }
        Insert: {
          bracket_position: number
          created_at?: string
          id?: string
          match_number: number
          player1_id: string
          player2_id?: string | null
          round: number
          scheduled_time: string
          score_player1?: number | null
          score_player2?: number | null
          status?: string
          tournament_id: string
          winner_id?: string | null
        }
        Update: {
          bracket_position?: number
          created_at?: string
          id?: string
          match_number?: number
          player1_id?: string
          player2_id?: string | null
          round?: number
          scheduled_time?: string
          score_player1?: number | null
          score_player2?: number | null
          status?: string
          tournament_id?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          achievement_notifications: boolean
          created_at: string
          email_notifications: boolean
          friend_notifications: boolean
          id: string
          match_updates: boolean
          push_notifications: boolean
          tournament_updates: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_notifications?: boolean
          created_at?: string
          email_notifications?: boolean
          friend_notifications?: boolean
          id?: string
          match_updates?: boolean
          push_notifications?: boolean
          tournament_updates?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_notifications?: boolean
          created_at?: string
          email_notifications?: boolean
          friend_notifications?: boolean
          id?: string
          match_updates?: boolean
          push_notifications?: boolean
          tournament_updates?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_config: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          best_streak: number | null
          bio: string | null
          created_at: string
          current_streak: number | null
          email: string
          games_played: number | null
          id: string
          skill_rating: number | null
          updated_at: string
          user_type: string
          username: string | null
          win_rate: number | null
        }
        Insert: {
          avatar_url?: string | null
          best_streak?: number | null
          bio?: string | null
          created_at?: string
          current_streak?: number | null
          email: string
          games_played?: number | null
          id: string
          skill_rating?: number | null
          updated_at?: string
          user_type?: string
          username?: string | null
          win_rate?: number | null
        }
        Update: {
          avatar_url?: string | null
          best_streak?: number | null
          bio?: string | null
          created_at?: string
          current_streak?: number | null
          email?: string
          games_played?: number | null
          id?: string
          skill_rating?: number | null
          updated_at?: string
          user_type?: string
          username?: string | null
          win_rate?: number | null
        }
        Relationships: []
      }
      skill_rating_history: {
        Row: {
          created_at: string
          id: string
          match_id: string | null
          rating_after: number
          rating_before: number
          rating_change: number
          tournament_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id?: string | null
          rating_after: number
          rating_before: number
          rating_change: number
          tournament_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string | null
          rating_after?: number
          rating_before?: number
          rating_change?: number
          tournament_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_skill_rating_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_contracts: {
        Row: {
          abi_json: Json
          bytecode: string | null
          contract_address: string
          contract_name: string
          contract_type: string
          created_at: string
          deployed_at: string
          deployed_by_user_id: string | null
          deployer_address: string
          deployment_transaction_hash: string
          id: string
          is_active: boolean
          is_verified: boolean
          metadata: Json | null
          network_id: number
          updated_at: string
        }
        Insert: {
          abi_json: Json
          bytecode?: string | null
          contract_address: string
          contract_name: string
          contract_type: string
          created_at?: string
          deployed_at?: string
          deployed_by_user_id?: string | null
          deployer_address: string
          deployment_transaction_hash: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          metadata?: Json | null
          network_id: number
          updated_at?: string
        }
        Update: {
          abi_json?: Json
          bytecode?: string | null
          contract_address?: string
          contract_name?: string
          contract_type?: string
          created_at?: string
          deployed_at?: string
          deployed_by_user_id?: string | null
          deployer_address?: string
          deployment_transaction_hash?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          metadata?: Json | null
          network_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      social_integrations: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          id: string
          integration_data: Json | null
          is_active: boolean | null
          platform: string
          platform_user_id: string | null
          platform_username: string | null
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          integration_data?: Json | null
          is_active?: boolean | null
          platform: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          integration_data?: Json | null
          is_active?: boolean | null
          platform?: string
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          content_description: string | null
          content_title: string
          content_url: string | null
          created_at: string
          engagement_data: Json | null
          error_message: string | null
          id: string
          image_url: string | null
          platform: string
          platform_post_id: string | null
          post_status: string | null
          post_type: string
          posted_at: string | null
          scheduled_for: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_description?: string | null
          content_title: string
          content_url?: string | null
          created_at?: string
          engagement_data?: Json | null
          error_message?: string | null
          id?: string
          image_url?: string | null
          platform: string
          platform_post_id?: string | null
          post_status?: string | null
          post_type: string
          posted_at?: string | null
          scheduled_for?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_description?: string | null
          content_title?: string
          content_url?: string | null
          created_at?: string
          engagement_data?: Json | null
          error_message?: string | null
          id?: string
          image_url?: string | null
          platform?: string
          platform_post_id?: string | null
          post_status?: string | null
          post_type?: string
          posted_at?: string | null
          scheduled_for?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invited_by: string
          invited_user_id: string
          status: string
          team_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invited_by: string
          invited_user_id: string
          status?: string
          team_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invited_by?: string
          invited_user_id?: string
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_invitations_invited_by"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_team_invitations_invited_user_id"
            columns: ["invited_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_members_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_id: string
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_id: string
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_team_messages_sender_id"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_messages_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_public: boolean
          max_members: number
          name: string
          tag: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean
          max_members?: number
          name: string
          tag: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean
          max_members?: number
          name?: string
          tag?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_teams_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_analytics: {
        Row: {
          average_match_duration: unknown
          completion_rate: number | null
          created_at: string
          id: string
          revenue_generated: number | null
          spectator_engagement: Json | null
          total_matches: number | null
          total_participants: number | null
          tournament_id: string
        }
        Insert: {
          average_match_duration?: unknown
          completion_rate?: number | null
          created_at?: string
          id?: string
          revenue_generated?: number | null
          spectator_engagement?: Json | null
          total_matches?: number | null
          total_participants?: number | null
          tournament_id: string
        }
        Update: {
          average_match_duration?: unknown
          completion_rate?: number | null
          created_at?: string
          id?: string
          revenue_generated?: number | null
          spectator_engagement?: Json | null
          total_matches?: number | null
          total_participants?: number | null
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_analytics_tournament"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          id: string
          registration_date: string
          status: string
          team_name: string | null
          tournament_id: string
          user_id: string
        }
        Insert: {
          id?: string
          registration_date?: string
          status?: string
          team_name?: string | null
          tournament_id: string
          user_id: string
        }
        Update: {
          id?: string
          registration_date?: string
          status?: string
          team_name?: string | null
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          bracket_generated: boolean
          created_at: string
          description: string
          end_date: string
          entry_fee: number | null
          game: string
          id: string
          max_participants: number
          organizer_id: string
          prize_pool: number
          registration_deadline: string
          start_date: string
          status: string
          team_id: string | null
          title: string
          tournament_type: string
          updated_at: string
        }
        Insert: {
          bracket_generated?: boolean
          created_at?: string
          description: string
          end_date: string
          entry_fee?: number | null
          game: string
          id?: string
          max_participants: number
          organizer_id: string
          prize_pool?: number
          registration_deadline: string
          start_date: string
          status?: string
          team_id?: string | null
          title: string
          tournament_type?: string
          updated_at?: string
        }
        Update: {
          bracket_generated?: boolean
          created_at?: string
          description?: string
          end_date?: string
          entry_fee?: number | null
          game?: string
          id?: string
          max_participants?: number
          organizer_id?: string
          prize_pool?: number
          registration_deadline?: string
          start_date?: string
          status?: string
          team_id?: string | null
          title?: string
          tournament_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          reward_claimed: boolean | null
          reward_claimed_at: string | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          reward_claimed?: boolean | null
          reward_claimed_at?: string | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          reward_claimed?: boolean | null
          reward_claimed_at?: string | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_session_analytics: {
        Row: {
          actions_performed: number | null
          browser: string | null
          created_at: string
          device_type: string | null
          id: string
          pages_visited: number | null
          session_end: string | null
          session_start: string
          user_id: string
        }
        Insert: {
          actions_performed?: number | null
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          pages_visited?: number | null
          session_end?: string | null
          session_start: string
          user_id: string
        }
        Update: {
          actions_performed?: number | null
          browser?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          pages_visited?: number | null
          session_end?: string | null
          session_start?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_session_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wallets: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_web3_wallets: {
        Row: {
          connected_at: string
          created_at: string
          id: string
          is_active: boolean
          is_primary: boolean
          last_used_at: string
          metadata: Json | null
          network_id: number
          updated_at: string
          user_id: string
          wallet_address: string
          wallet_type: string
        }
        Insert: {
          connected_at?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          last_used_at?: string
          metadata?: Json | null
          network_id?: number
          updated_at?: string
          user_id: string
          wallet_address: string
          wallet_type: string
        }
        Update: {
          connected_at?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          last_used_at?: string
          metadata?: Json | null
          network_id?: number
          updated_at?: string
          user_id?: string
          wallet_address?: string
          wallet_type?: string
        }
        Relationships: []
      }
      waitlist_milestones: {
        Row: {
          created_at: string
          description: string
          feature_name: string
          id: string
          milestone_count: number
          reward_type: string
          title: string
          unlocked_at: string | null
        }
        Insert: {
          created_at?: string
          description: string
          feature_name: string
          id?: string
          milestone_count: number
          reward_type?: string
          title: string
          unlocked_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          feature_name?: string
          id?: string
          milestone_count?: number
          reward_type?: string
          title?: string
          unlocked_at?: string | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          metadata: Json | null
          reference_id: string | null
          status: string
          transaction_type: string
          updated_at: string
          user_id: string | null
          wallet_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          status?: string
          transaction_type: string
          updated_at?: string
          user_id?: string | null
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          status?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string | null
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_admin_role: {
        Args: { required_role?: string; user_id_param: string }
        Returns: boolean
      }
      check_user_achievements: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      decrement_spectator_count: {
        Args: { match_id: string }
        Returns: undefined
      }
      decrypt_social_token: {
        Args: { encrypted_token: string; user_id: string }
        Returns: string
      }
      distribute_tournament_prizes: {
        Args: { tournament_id_param: string }
        Returns: undefined
      }
      encrypt_social_token: {
        Args: { token_value: string; user_id: string }
        Returns: string
      }
      get_friend_profiles: {
        Args: { target_user_id?: string }
        Returns: {
          avatar_url: string
          best_streak: number
          created_at: string
          current_streak: number
          games_played: number
          id: string
          skill_rating: number
          user_type: string
          username: string
          win_rate: number
        }[]
      }
      get_public_profiles: {
        Args: { search_term?: string }
        Returns: {
          avatar_url: string
          best_streak: number
          created_at: string
          current_streak: number
          games_played: number
          id: string
          skill_rating: number
          user_type: string
          username: string
          win_rate: number
        }[]
      }
      get_user_social_integrations: {
        Args: { target_user_id?: string }
        Returns: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          integration_data: Json
          is_active: boolean
          platform: string
          platform_user_id: string
          platform_username: string
          refresh_token: string
          updated_at: string
          user_id: string
        }[]
      }
      get_waitlist_position: {
        Args: { feature?: string; user_email: string }
        Returns: number
      }
      get_waitlist_stats: {
        Args: { feature?: string }
        Returns: {
          next_milestone_target: number
          next_milestone_title: string
          progress_to_next_milestone: number
          total_count: number
        }[]
      }
      increment_spectator_count: {
        Args: { match_id: string }
        Returns: undefined
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      update_skill_rating: {
        Args: { loser_id: string; match_id: string; winner_id: string }
        Returns: undefined
      }
      update_tournament_prize_pool: {
        Args: { amount: number; tournament_id: string }
        Returns: undefined
      }
      upsert_social_integration: {
        Args: {
          p_access_token?: string
          p_expires_at?: string
          p_integration_data?: Json
          p_is_active?: boolean
          p_platform: string
          p_platform_user_id?: string
          p_platform_username?: string
          p_refresh_token?: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      team_role: "owner" | "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      team_role: ["owner", "admin", "member"],
    },
  },
} as const
