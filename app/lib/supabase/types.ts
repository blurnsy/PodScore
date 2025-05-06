export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shows: {
        Row: {
          id: string
          name: string
          publisher: string | null
          total_episodes: number | null
          images: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          publisher?: string | null
          total_episodes?: number | null
          images?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          publisher?: string | null
          total_episodes?: number | null
          images?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      episodes: {
        Row: {
          id: string
          show_id: string
          name: string
          description: string | null
          release_date: string | null
          duration_ms: number | null
          spotify_url: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          show_id: string
          name: string
          description?: string | null
          release_date?: string | null
          duration_ms?: number | null
          spotify_url?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          show_id?: string
          name?: string
          description?: string | null
          release_date?: string | null
          duration_ms?: number | null
          spotify_url?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          episode_id: string
          user_id: string
          rating: number
          review: string | null
          timestamp: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          episode_id: string
          user_id: string
          rating: number
          review?: string | null
          timestamp?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          episode_id?: string
          user_id?: string
          rating?: number
          review?: string | null
          timestamp?: string
          created_at?: string
          updated_at?: string
        }
      }
      listening_history: {
        Row: {
          id: string
          episode_id: string
          user_id: string
          listened_date: string
          timestamp: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          episode_id: string
          user_id: string
          listened_date: string
          timestamp?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          episode_id?: string
          user_id?: string
          listened_date?: string
          timestamp?: string
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          review_id: string
          user_id: string
          text: string
          timestamp: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          text: string
          timestamp?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          user_id?: string
          text?: string
          timestamp?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 