export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      application_essays: {
        Row: {
          id: string
          application_id: string
          student_id: string
          essay_label: string
          essay_prompt: string | null
          word_limit: number | null
          essay_feedback_id: string | null
          status: string
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          student_id: string
          essay_label: string
          essay_prompt?: string | null
          word_limit?: number | null
          essay_feedback_id?: string | null
          status?: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          student_id?: string
          essay_label?: string
          essay_prompt?: string | null
          word_limit?: number | null
          essay_feedback_id?: string | null
          status?: string
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_essays_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_essays_essay_feedback_id_fkey"
            columns: ["essay_feedback_id"]
            isOneToOne: false
            referencedRelation: "essay_feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          id: string
          student_id: string
          school_name: string
          application_type: string
          deadline_date: string
          status: string
          program: string | null
          required_essays: number
          completed_essays: number
          notes: string | null
          recommendations_requested: number
          recommendations_submitted: number
          completion_percentage: number
          urgent: boolean
          ai_score_avg: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          school_name: string
          application_type: string
          deadline_date: string
          status?: string
          program?: string | null
          notes?: string | null
          required_essays?: number
          completed_essays?: number
          recommendations_requested?: number
          recommendations_submitted?: number
          completion_percentage?: number
          urgent?: boolean
          ai_score_avg?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          school_name?: string
          application_type?: string
          deadline_date?: string
          status?: string
          notes?: string | null
          program?: string | null
          required_essays?: number
          completed_essays?: number
          recommendations_requested?: number
          recommendations_submitted?: number
          completion_percentage?: number
          urgent?: boolean
          ai_score_avg?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      counselor_profiles: {
        Row: {
          id: string
          user_id: string
          phone: string | null
          bio: string | null
          title: string | null
          years_of_experience: number | null
          specialization: string | null
          max_students: number | null
          certifications: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          phone?: string | null
          bio?: string | null
          title?: string | null
          years_of_experience?: number | null
          specialization?: string | null
          max_students?: number | null
          certifications?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          phone?: string | null
          bio?: string | null
          title?: string | null
          years_of_experience?: number | null
          specialization?: string | null
          max_students?: number | null
          certifications?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      essay_feedback_history: {
        Row: {
          id: string
          essay_id: string
          student_id: string
          counselor_id: string
          version: number
          feedback_items: Json | null
          manual_notes: string | null
          personal_message: string | null
          ai_analysis: Json | null
          status: string
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          essay_id: string
          student_id: string
          counselor_id: string
          version?: number
          feedback_items?: Json | null
          manual_notes?: string | null
          personal_message?: string | null
          ai_analysis?: Json | null
          status?: string
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          essay_id?: string
          student_id?: string
          counselor_id?: string
          version?: number
          feedback_items?: Json | null
          manual_notes?: string | null
          personal_message?: string | null
          ai_analysis?: Json | null
          status?: string
          sent_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "essay_feedback_history_essay_id_fkey"
            columns: ["essay_id"]
            isOneToOne: false
            referencedRelation: "essay_feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      extracurriculars: {
        Row: {
          id: string
          student_id: string
          activity: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          activity: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          activity?: string
          created_at?: string
        }
        Relationships: []
      }
      meeting_notes: {
        Row: {
          id: string
          student_id: string
          counselor_id: string
          meeting_date: string
          summary: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          counselor_id: string
          meeting_date: string
          summary: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          counselor_id?: string
          meeting_date?: string
          summary?: string
          created_at?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          id: string
          student_id: string
          label: string
          completed: boolean
          completed_at: string | null
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          label: string
          completed?: boolean
          completed_at?: string | null
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          label?: string
          completed?: boolean
          completed_at?: string | null
          due_date?: string | null
          created_at?: string
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
      student_profiles: {
        Row: {
          id: string
          user_id: string
          grade: string | null
          graduation_year: number | null
          phone: string | null
          gpa: number | null
          sat_score: number | null
          act_score: number | null
          parent_name: string | null
          parent_email: string | null
          parent_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          grade?: string | null
          graduation_year?: number | null
          phone?: string | null
          gpa?: number | null
          sat_score?: number | null
          act_score?: number | null
          parent_name?: string | null
          parent_email?: string | null
          parent_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          grade?: string | null
          graduation_year?: number | null
          phone?: string | null
          gpa?: number | null
          sat_score?: number | null
          act_score?: number | null
          parent_name?: string | null
          parent_email?: string | null
          parent_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      submitted_applications: {
        Row: {
          id: string
          application_id: string
          student_id: string
          submitted_at: string
          essay_snapshots: Json
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          student_id: string
          submitted_at?: string
          essay_snapshots?: Json
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          student_id?: string
          submitted_at?: string
          essay_snapshots?: Json
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submitted_applications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      target_schools: {
        Row: {
          id: string
          student_id: string
          school_name: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          school_name: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          school_name?: string
          created_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          student_id: string
          counselor_id: string | null
          task: string
          due_date: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          counselor_id?: string | null
          task: string
          due_date?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          counselor_id?: string | null
          task?: string
          due_date?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
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
      get_student_stats: {
        Args: never
        Returns: Json
      }
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
      get_any_counselor_id: {
        Args: Record<never, never>
        Returns: string
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