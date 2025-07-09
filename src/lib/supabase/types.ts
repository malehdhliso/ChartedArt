@@ .. @@
         created_at: string
       }
      initiatives: {
        Row: {
          id: string
          title: string
          description: string
          organizer_id: string
          related_event_id: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          organizer_id: string
          related_event_id?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          organizer_id?: string
          related_event_id?: string | null
          status?: string
          created_at?: string
        }
      }
      collage_submissions: {
        Row: {
          id: string
          initiative_id: string
          user_id: string
          image_url: string
          description: string | null
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          initiative_id: string
          user_id: string
          image_url: string
          description?: string | null
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          initiative_id?: string
          user_id?: string
          image_url?: string
          description?: string | null
          is_approved?: boolean
          created_at?: string
        }
      }
      event_rsvps: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          status?: string
          created_at?: string
        }
      }
+      competitions: {
+        Row: {
+          id: string
+          title: string
+          description: string | null
+          theme: string | null
+          start_date: string
+          end_date: string
+          prize_details: string | null
+          is_active: boolean
+          created_at: string
+        }
+        Insert: {
+          id?: string
+          title: string
+          description?: string | null
+          theme?: string | null
+          start_date: string
+          end_date: string
+          prize_details?: string | null
+          is_active?: boolean
+          created_at?: string
+        }
+        Update: {
+          id?: string
+          title?: string
+          description?: string | null
+          theme?: string | null
+          start_date?: string
+          end_date?: string
+          prize_details?: string | null
+          is_active?: boolean
+          created_at?: string
+        }
+      }
+      competition_submissions: {
+        Row: {
+          id: string
+          competition_id: string
+          submission_id: string
+          user_id: string
+          created_at: string
+        }
+        Insert: {
+          id?: string
+          competition_id: string
+          submission_id: string
+          user_id: string
+          created_at?: string
+        }
+        Update: {
+          id?: string
+          competition_id?: string
+          submission_id?: string
+          user_id?: string
+          created_at?: string
+        }
+      }
+      votes: {
+        Row: {
+          id: string
+          user_id: string
+          submission_id: string
+          created_at: string
+        }
+        Insert: {
+          id?: string
+          user_id: string
+          submission_id: string
+          created_at?: string
+        }
+        Update: {
+          id?: string
+          user_id?: string
+          submission_id?: string
+          created_at?: string
+        }
+      }
+      user_awards: {
+        Row: {
+          id: string
+          user_id: string
+          award_name: string
+          award_description: string | null
+          competition_id: string | null
+          created_at: string
+        }
+        Insert: {
+          id?: string
+          user_id: string
+          award_name: string
+          award_description?: string | null
+          competition_id?: string | null
+          created_at?: string
+        }
+        Update: {
+          id?: string
+          user_id?: string
+          award_name?: string
+          award_description?: string | null
+          competition_id?: string | null
+          created_at?: string
+        }
+      }
     }
   }
 }