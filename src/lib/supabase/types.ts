@@ .. @@
         created_at: string
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