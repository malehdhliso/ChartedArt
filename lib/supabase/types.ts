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
          email: string
          full_name: string | null
          avatar_url: string | null
          shipping_address: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          shipping_address?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          shipping_address?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          size: string
          frame_type: string
          base_price: number
          created_at: string
        }
        Insert: {
          id?: string
          size: string
          frame_type: string
          base_price: number
          created_at?: string
        }
        Update: {
          id?: string
          size?: string
          frame_type?: string
          base_price?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: string
          shipping_address: Json
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status: string
          shipping_address: Json
          total_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          shipping_address?: Json
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          image_url: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          image_url: string
          quantity?: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          image_url?: string
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          user_id: string
          content: string
          rating: number
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          rating: number
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          rating?: number
          is_approved?: boolean
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          location: string
          event_date: string
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          location: string
          event_date: string
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          location?: string
          event_date?: string
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          author_id: string
          status: string
          featured_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          author_id: string
          status: string
          featured_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          author_id?: string
          status?: string
          featured_image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gallery_submissions: {
        Row: {
          id: string
          user_id: string
          order_item_id: string
          image_url: string
          description: string | null
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_item_id: string
          image_url: string
          description?: string | null
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_item_id?: string
          image_url?: string
          description?: string | null
          is_approved?: boolean
          created_at?: string
        }
      }
    }
  }
}