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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      essay_feedback: {
        Row: {
          ai_analysis: Json | null
          counselor_id: string
          created_at: string
          essay_content: string
          essay_prompt: string | null
          essay_title: string
          feedback_items: Json | null
          id: string
          manual_notes: string | null
          personal_message: string | null
          sent_at: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          counselor_id: string
          created_at?: string
          essay_content: string
          essay_prompt?: string | null
          essay_title: string
          feedback_items?: Json | null
          id?: string
          manual_notes?: string | null
          personal_message?: string | null
          sent_at?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          counselor_id?: string
          created_at?: string
          essay_content?: string
          essay_prompt?: string | null
          essay_title?: string
          feedback_items?: Json | null
          id?: string
          manual_notes?: string | null
          personal_message?: string | null
          sent_at?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      parent_student_assignments: {
        Row: {
          created_at: string
          id: string
          invitation_code: string | null
          parent_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitation_code?: string | null
          parent_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invitation_code?: string | null
          parent_id?: string
          student_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          school_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          school_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          school_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_requests: {
        Row: {
          best_moment: string | null
          counselor_notes: string | null
          created_at: string
          difficulties_overcome: string | null
          generated_letter: string | null
          id: string
          meaningful_project: string | null
          personal_notes: string | null
          referee_name: string
          referee_role: string | null
          relationship_capacity: string | null
          relationship_duration: string | null
          status: Database["public"]["Enums"]["recommendation_status"]
          strengths: string[] | null
          student_id: string
          updated_at: string
        }
        Insert: {
          best_moment?: string | null
          counselor_notes?: string | null
          created_at?: string
          difficulties_overcome?: string | null
          generated_letter?: string | null
          id?: string
          meaningful_project?: string | null
          personal_notes?: string | null
          referee_name: string
          referee_role?: string | null
          relationship_capacity?: string | null
          relationship_duration?: string | null
          status?: Database["public"]["Enums"]["recommendation_status"]
          strengths?: string[] | null
          student_id: string
          updated_at?: string
        }
        Update: {
          best_moment?: string | null
          counselor_notes?: string | null
          created_at?: string
          difficulties_overcome?: string | null
          generated_letter?: string | null
          id?: string
          meaningful_project?: string | null
          personal_notes?: string | null
          referee_name?: string
          referee_role?: string | null
          relationship_capacity?: string | null
          relationship_duration?: string | null
          status?: Database["public"]["Enums"]["recommendation_status"]
          strengths?: string[] | null
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      student_counselor_assignments: {
        Row: {
          counselor_id: string
          created_at: string
          id: string
          student_id: string
        }
        Insert: {
          counselor_id: string
          created_at?: string
          id?: string
          student_id: string
        }
        Update: {
          counselor_id?: string
          created_at?: string
          id?: string
          student_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_counselor_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_student_counselor: {
        Args: { _counselor_id: string; _student_id: string }
        Returns: boolean
      }
      is_student_parent: {
        Args: { _parent_id: string; _student_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "counselor" | "admin" | "parent"
      recommendation_status: "draft" | "pending" | "in_progress" | "sent"
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
      app_role: ["student", "counselor", "admin", "parent"],
      recommendation_status: ["draft", "pending", "in_progress", "sent"],
    },
  },
} as const
