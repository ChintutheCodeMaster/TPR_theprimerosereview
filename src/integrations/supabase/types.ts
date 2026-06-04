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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      application_essays: {
        Row: {
          application_id: string
          created_at: string
          display_order: number
          essay_feedback_id: string | null
          essay_label: string
          essay_prompt: string | null
          id: string
          status: string
          student_id: string
          updated_at: string
          word_limit: number | null
        }
        Insert: {
          application_id: string
          created_at?: string
          display_order?: number
          essay_feedback_id?: string | null
          essay_label: string
          essay_prompt?: string | null
          id?: string
          status?: string
          student_id: string
          updated_at?: string
          word_limit?: number | null
        }
        Update: {
          application_id?: string
          created_at?: string
          display_order?: number
          essay_feedback_id?: string | null
          essay_label?: string
          essay_prompt?: string | null
          id?: string
          status?: string
          student_id?: string
          updated_at?: string
          word_limit?: number | null
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
          ai_score_avg: number | null
          application_platform: string | null
          application_type: string
          completed_essays: number
          completion_percentage: number
          created_at: string
          deadline_date: string
          id: string
          notes: string | null
          program: string | null
          recommendations_requested: number
          recommendations_submitted: number
          required_essays: number
          school_name: string
          status: string
          student_id: string
          updated_at: string
          urgent: boolean
        }
        Insert: {
          ai_score_avg?: number | null
          application_platform?: string | null
          application_type: string
          completed_essays?: number
          completion_percentage?: number
          created_at?: string
          deadline_date: string
          id?: string
          notes?: string | null
          program?: string | null
          recommendations_requested?: number
          recommendations_submitted?: number
          required_essays?: number
          school_name: string
          status?: string
          student_id: string
          updated_at?: string
          urgent?: boolean
        }
        Update: {
          ai_score_avg?: number | null
          application_platform?: string | null
          application_type?: string
          completed_essays?: number
          completion_percentage?: number
          created_at?: string
          deadline_date?: string
          id?: string
          notes?: string | null
          program?: string | null
          recommendations_requested?: number
          recommendations_submitted?: number
          required_essays?: number
          school_name?: string
          status?: string
          student_id?: string
          updated_at?: string
          urgent?: boolean
        }
        Relationships: []
      }
      challenge_submissions: {
        Row: {
          ai_scores: Json | null
          challenge_id: string
          hook_text: string
          id: string
          student_id: string
          submitted_at: string
        }
        Insert: {
          ai_scores?: Json | null
          challenge_id: string
          hook_text: string
          id?: string
          student_id: string
          submitted_at?: string
        }
        Update: {
          ai_scores?: Json | null
          challenge_id?: string
          hook_text?: string
          id?: string
          student_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "weekly_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          counselor_id: string
          created_at: string
          id: string
          parent_id: string | null
          status: string
          student_id: string
          tags: string[] | null
        }
        Insert: {
          counselor_id: string
          created_at?: string
          id?: string
          parent_id?: string | null
          status?: string
          student_id: string
          tags?: string[] | null
        }
        Update: {
          counselor_id?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          status?: string
          student_id?: string
          tags?: string[] | null
        }
        Relationships: []
      }
      cost_plans: {
        Row: {
          affordability: string | null
          annual_max: number
          annual_min: number
          city: string | null
          city_multiplier: number
          country: string
          created_at: string
          degree: string
          duration_years: number
          field_of_study: string
          id: string
          living_style: string
          monthly_living_max: number
          monthly_living_min: number
          program_max: number
          program_min: number
          student_id: string
        }
        Insert: {
          affordability?: string | null
          annual_max: number
          annual_min: number
          city?: string | null
          city_multiplier?: number
          country: string
          created_at?: string
          degree: string
          duration_years: number
          field_of_study: string
          id?: string
          living_style: string
          monthly_living_max: number
          monthly_living_min: number
          program_max: number
          program_min: number
          student_id: string
        }
        Update: {
          affordability?: string | null
          annual_max?: number
          annual_min?: number
          city?: string | null
          city_multiplier?: number
          country?: string
          created_at?: string
          degree?: string
          duration_years?: number
          field_of_study?: string
          id?: string
          living_style?: string
          monthly_living_max?: number
          monthly_living_min?: number
          program_max?: number
          program_min?: number
          student_id?: string
        }
        Relationships: []
      }
      counselor_invites: {
        Row: {
          counselor_id: string
          created_at: string | null
          id: string
          invite_code: string
          invite_role: string | null
          is_active: boolean | null
        }
        Insert: {
          counselor_id: string
          created_at?: string | null
          id?: string
          invite_code: string
          invite_role?: string | null
          is_active?: boolean | null
        }
        Update: {
          counselor_id?: string
          created_at?: string | null
          id?: string
          invite_code?: string
          invite_role?: string | null
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "counselor_invites_counselor_id_fkey"
            columns: ["counselor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      counselor_profiles: {
        Row: {
          bio: string | null
          certifications: string[] | null
          created_at: string
          id: string
          max_students: number | null
          phone: string | null
          specialization: string | null
          title: string | null
          updated_at: string
          user_id: string
          years_of_experience: number | null
        }
        Insert: {
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          id?: string
          max_students?: number | null
          phone?: string | null
          specialization?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          years_of_experience?: number | null
        }
        Update: {
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          id?: string
          max_students?: number | null
          phone?: string | null
          specialization?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          years_of_experience?: number | null
        }
        Relationships: []
      }
      counselor_tasks: {
        Row: {
          color: string
          counselor_id: string
          created_at: string
          done: boolean
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          color?: string
          counselor_id: string
          created_at?: string
          done?: boolean
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          color?: string
          counselor_id?: string
          created_at?: string
          done?: boolean
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      essay_feedback: {
        Row: {
          ai_analysis: Json | null
          counselor_id: string | null
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
          target_school: string | null
          track_changes: Json | null
          updated_at: string
          word_limit: number | null
        }
        Insert: {
          ai_analysis?: Json | null
          counselor_id?: string | null
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
          target_school?: string | null
          track_changes?: Json | null
          updated_at?: string
          word_limit?: number | null
        }
        Update: {
          ai_analysis?: Json | null
          counselor_id?: string | null
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
          target_school?: string | null
          track_changes?: Json | null
          updated_at?: string
          word_limit?: number | null
        }
        Relationships: []
      }
      essay_feedback_history: {
        Row: {
          ai_analysis: Json | null
          counselor_id: string
          created_at: string
          essay_content: string | null
          essay_id: string
          feedback_items: Json | null
          id: string
          manual_notes: string | null
          personal_message: string | null
          sent_at: string | null
          status: string
          student_id: string
          track_changes: Json | null
          version: number
        }
        Insert: {
          ai_analysis?: Json | null
          counselor_id: string
          created_at?: string
          essay_content?: string | null
          essay_id: string
          feedback_items?: Json | null
          id?: string
          manual_notes?: string | null
          personal_message?: string | null
          sent_at?: string | null
          status?: string
          student_id: string
          track_changes?: Json | null
          version?: number
        }
        Update: {
          ai_analysis?: Json | null
          counselor_id?: string
          created_at?: string
          essay_content?: string | null
          essay_id?: string
          feedback_items?: Json | null
          id?: string
          manual_notes?: string | null
          personal_message?: string | null
          sent_at?: string | null
          status?: string
          student_id?: string
          track_changes?: Json | null
          version?: number
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
      essay_teacher_shares: {
        Row: {
          ai_analysis: Json | null
          essay_feedback_id: string
          feedback_items: Json | null
          id: string
          personal_message: string | null
          sent_at: string | null
          shared_at: string
          student_id: string
          teacher_id: string
          teacher_notes: string | null
          teacher_status: string | null
          track_changes: Json | null
        }
        Insert: {
          ai_analysis?: Json | null
          essay_feedback_id: string
          feedback_items?: Json | null
          id?: string
          personal_message?: string | null
          sent_at?: string | null
          shared_at?: string
          student_id: string
          teacher_id: string
          teacher_notes?: string | null
          teacher_status?: string | null
          track_changes?: Json | null
        }
        Update: {
          ai_analysis?: Json | null
          essay_feedback_id?: string
          feedback_items?: Json | null
          id?: string
          personal_message?: string | null
          sent_at?: string | null
          shared_at?: string
          student_id?: string
          teacher_id?: string
          teacher_notes?: string | null
          teacher_status?: string | null
          track_changes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "essay_teacher_shares_essay_feedback_id_fkey"
            columns: ["essay_feedback_id"]
            isOneToOne: false
            referencedRelation: "essay_feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_results: {
        Row: {
          created_at: string
          essay_snapshot: string
          id: string
          roadmap: Json | null
          story_score: Json | null
          student_id: string
          title: string | null
          universities: string[] | null
          university_fit: Json | null
        }
        Insert: {
          created_at?: string
          essay_snapshot: string
          id?: string
          roadmap?: Json | null
          story_score?: Json | null
          student_id: string
          title?: string | null
          universities?: string[] | null
          university_fit?: Json | null
        }
        Update: {
          created_at?: string
          essay_snapshot?: string
          id?: string
          roadmap?: Json | null
          story_score?: Json | null
          student_id?: string
          title?: string | null
          universities?: string[] | null
          university_fit?: Json | null
        }
        Relationships: []
      }
      extracurriculars: {
        Row: {
          activity: string
          created_at: string
          id: string
          student_id: string
        }
        Insert: {
          activity: string
          created_at?: string
          id?: string
          student_id: string
        }
        Update: {
          activity?: string
          created_at?: string
          id?: string
          student_id?: string
        }
        Relationships: []
      }
      feedback_student: {
        Row: {
          category: string | null
          created_at: string | null
          feedback_text: string
          id: string
          mood: string | null
          rating: number | null
          student_id: string
          student_name: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          feedback_text: string
          id?: string
          mood?: string | null
          rating?: number | null
          student_id: string
          student_name?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          feedback_text?: string
          id?: string
          mood?: string | null
          rating?: number | null
          student_id?: string
          student_name?: string | null
        }
        Relationships: []
      }
      meeting_notes: {
        Row: {
          counselor_id: string
          created_at: string
          id: string
          meeting_date: string
          student_id: string
          summary: string
        }
        Insert: {
          counselor_id: string
          created_at?: string
          id?: string
          meeting_date: string
          student_id: string
          summary: string
        }
        Update: {
          counselor_id?: string
          created_at?: string
          id?: string
          meeting_date?: string
          student_id?: string
          summary?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          label: string
          student_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          label: string
          student_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          label?: string
          student_id?: string
        }
        Relationships: []
      }
      onboarding_answers: {
        Row: {
          age_range: string | null
          anonymous_id: string | null
          answers: Json | null
          background: string | null
          career_goals: string | null
          completed: boolean | null
          created_at: string | null
          degree_interest: string | null
          degree_type: string | null
          gender: string | null
          id: string
          inspiration: string | null
          personal_story: string | null
          personal_strengths: string | null
          program: string | null
          university_name: string | null
          updated_at: string | null
          user_id: string | null
          years_experience: string | null
        }
        Insert: {
          age_range?: string | null
          anonymous_id?: string | null
          answers?: Json | null
          background?: string | null
          career_goals?: string | null
          completed?: boolean | null
          created_at?: string | null
          degree_interest?: string | null
          degree_type?: string | null
          gender?: string | null
          id?: string
          inspiration?: string | null
          personal_story?: string | null
          personal_strengths?: string | null
          program?: string | null
          university_name?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: string | null
        }
        Update: {
          age_range?: string | null
          anonymous_id?: string | null
          answers?: Json | null
          background?: string | null
          career_goals?: string | null
          completed?: boolean | null
          created_at?: string | null
          degree_interest?: string | null
          degree_type?: string | null
          gender?: string | null
          id?: string
          inspiration?: string | null
          personal_story?: string | null
          personal_strengths?: string | null
          program?: string | null
          university_name?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: string | null
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
      personal_statements: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          title?: string | null
          user_id?: string | null
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
      rec_letter_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          request_id: string
          sender_role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          request_id: string
          sender_role: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          request_id?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "rec_letter_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "recommendation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_requests: {
        Row: {
          application_id: string | null
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
          teacher_draft: string | null
          teacher_email: string | null
          teacher_id: string | null
          teacher_token: string | null
          updated_at: string
        }
        Insert: {
          application_id?: string | null
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
          teacher_draft?: string | null
          teacher_email?: string | null
          teacher_id?: string | null
          teacher_token?: string | null
          updated_at?: string
        }
        Update: {
          application_id?: string | null
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
          teacher_draft?: string | null
          teacher_email?: string | null
          teacher_id?: string | null
          teacher_token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_requests_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_requests_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      school_activities: {
        Row: {
          category: string
          created_at: string
          created_by: string
          date: string
          description: string | null
          id: string
          location: string | null
          school_id: string
          status: string
          time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          date: string
          description?: string | null
          id?: string
          location?: string | null
          school_id: string
          status?: string
          time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          date?: string
          description?: string | null
          id?: string
          location?: string | null
          school_id?: string
          status?: string
          time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_activities_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      school_at_risk_criteria: {
        Row: {
          at_risk_threshold: number
          deadline_count_threshold: number
          essay_weight: number
          needs_attention_threshold: number
          rec_weight: number
          school_id: string
          trigger_low_completion: boolean
          trigger_many_deadlines: boolean
          trigger_no_essays: boolean
          trigger_no_recs: boolean
          updated_at: string | null
        }
        Insert: {
          at_risk_threshold?: number
          deadline_count_threshold?: number
          essay_weight?: number
          needs_attention_threshold?: number
          rec_weight?: number
          school_id: string
          trigger_low_completion?: boolean
          trigger_many_deadlines?: boolean
          trigger_no_essays?: boolean
          trigger_no_recs?: boolean
          updated_at?: string | null
        }
        Update: {
          at_risk_threshold?: number
          deadline_count_threshold?: number
          essay_weight?: number
          needs_attention_threshold?: number
          rec_weight?: number
          school_id?: string
          trigger_low_completion?: boolean
          trigger_many_deadlines?: boolean
          trigger_no_essays?: boolean
          trigger_no_recs?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "school_at_risk_criteria_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: true
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      session_events: {
        Row: {
          created_at: string
          feature: string | null
          id: string
          page_path: string
          school_id: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feature?: string | null
          id?: string
          page_path: string
          school_id?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          feature?: string | null
          id?: string
          page_path?: string
          school_id?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_events_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
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
          act_score: number | null
          created_at: string
          gpa: number | null
          grade: string | null
          graduation_year: number | null
          id: string
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          phone: string | null
          sat_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          act_score?: number | null
          created_at?: string
          gpa?: number | null
          grade?: string | null
          graduation_year?: number | null
          id?: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          sat_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          act_score?: number | null
          created_at?: string
          gpa?: number | null
          grade?: string | null
          graduation_year?: number | null
          id?: string
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          sat_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_target_colleges: {
        Row: {
          college: string
          country: string | null
          created_at: string | null
          id: string
          student_id: string
        }
        Insert: {
          college: string
          country?: string | null
          created_at?: string | null
          id?: string
          student_id: string
        }
        Update: {
          college?: string
          country?: string | null
          created_at?: string | null
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_target_colleges_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      submitted_applications: {
        Row: {
          application_id: string
          created_at: string
          essay_snapshots: Json
          id: string
          notes: string | null
          student_id: string
          submitted_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          essay_snapshots?: Json
          id?: string
          notes?: string | null
          student_id: string
          submitted_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          essay_snapshots?: Json
          id?: string
          notes?: string | null
          student_id?: string
          submitted_at?: string
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
      support_tickets: {
        Row: {
          created_at: string | null
          id: string
          message: string
          subject: string
          user_email: string | null
          user_id: string | null
          user_name: string | null
          user_role: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          subject: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          subject?: string
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      target_schools: {
        Row: {
          created_at: string
          id: string
          school_name: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          school_name: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          school_name?: string
          student_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          color: string
          completed: boolean
          counselor_id: string | null
          created_at: string
          due_date: string | null
          id: string
          student_id: string
          task: string
          updated_at: string
        }
        Insert: {
          color?: string
          completed?: boolean
          counselor_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          student_id: string
          task: string
          updated_at?: string
        }
        Update: {
          color?: string
          completed?: boolean
          counselor_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          student_id?: string
          task?: string
          updated_at?: string
        }
        Relationships: []
      }
      teacher_profiles: {
        Row: {
          created_at: string
          id: string
          school_id: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          school_id?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          school_id?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          role?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string | null
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
      user_sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          last_activity_at: string
          role: string | null
          school_id: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          last_activity_at?: string
          role?: string | null
          school_id?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          last_activity_at?: string
          role?: string | null
          school_id?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_insights: {
        Row: {
          created_at: string | null
          id: string
          insights: Json
          quality: string | null
          student_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          insights?: Json
          quality?: string | null
          student_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          insights?: Json
          quality?: string | null
          student_id?: string | null
        }
        Relationships: []
      }
      weekly_challenges: {
        Row: {
          created_at: string
          description: string
          ends_at: string
          example_prompt: string | null
          id: string
          is_active: boolean
          starts_at: string
          theme: string
          title: string
          week_number: number
        }
        Insert: {
          created_at?: string
          description: string
          ends_at: string
          example_prompt?: string | null
          id?: string
          is_active?: boolean
          starts_at?: string
          theme: string
          title: string
          week_number: number
        }
        Update: {
          created_at?: string
          description?: string
          ends_at?: string
          example_prompt?: string | null
          id?: string
          is_active?: boolean
          starts_at?: string
          theme?: string
          title?: string
          week_number?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_teacher_message_by_token: {
        Args: { p_content: string; p_token: string }
        Returns: string
      }
      create_or_get_school: { Args: { school_name: string }; Returns: string }
      delete_platform_user: { Args: { p_user_id: string }; Returns: undefined }
      get_current_user_school_id: { Args: never; Returns: string }
      get_my_counselor_id: { Args: never; Returns: string }
      get_my_school_id: { Args: never; Returns: string }
      get_recommendation_by_token: { Args: { p_token: string }; Returns: Json }
      get_school_id_by_invite: {
        Args: { invite_code_param: string }
        Returns: string
      }
      get_school_id_by_student_invite: {
        Args: { invite_code_param: string }
        Returns: string
      }
      get_school_members: {
        Args: { p_school_id: string }
        Returns: {
          avatar_url: string
          full_name: string
          role: string
          user_id: string
        }[]
      }
      get_school_name_by_invite: {
        Args: { invite_code_param: string }
        Returns: string
      }
      get_student_stats: { Args: never; Returns: Json }
      get_teachers_by_school: {
        Args: { school_id_param: string }
        Returns: {
          full_name: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_school_principal: {
        Args: { _school_id: string; _user_id: string }
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
      link_parent_to_student: {
        Args: { _counselor_invite_code: string; _parent_email: string }
        Returns: string
      }
      submit_teacher_draft: {
        Args: { p_draft: string; p_token: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "student"
        | "counselor"
        | "admin"
        | "parent"
        | "principal"
        | "teacher"
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
      app_role: [
        "student",
        "counselor",
        "admin",
        "parent",
        "principal",
        "teacher",
      ],
      recommendation_status: ["draft", "pending", "in_progress", "sent"],
    },
  },
} as const
