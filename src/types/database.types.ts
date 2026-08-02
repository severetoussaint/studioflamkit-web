export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          bio: string | null
          company: string | null
          country: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          language: string | null
          phone: string | null
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          language?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          company?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          language?: string | null
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chapters: {
        Row: {
          chapter_number: number
          created_at: string
          currency: string
          duration_minutes: number | null
          id: string
          pfh_rate_used: number
          price: number | null
          project_id: string
          status: string
          tier: string | null
          title: string | null
          updated_at: string
          word_count: number
        }
        Insert: {
          chapter_number: number
          created_at?: string
          currency?: string
          duration_minutes?: number | null
          id?: string
          pfh_rate_used?: number
          price?: number | null
          project_id: string
          status?: string
          tier?: string | null
          title?: string | null
          updated_at?: string
          word_count: number
        }
        Update: {
          chapter_number?: number
          created_at?: string
          currency?: string
          duration_minutes?: number | null
          id?: string
          pfh_rate_used?: number
          price?: number | null
          project_id?: string
          status?: string
          tier?: string | null
          title?: string | null
          updated_at?: string
          word_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "chapters_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          status: string | null
          storage_path: string
          title: string
          version: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          status?: string | null
          storage_path: string
          title: string
          version?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          status?: string | null
          storage_path?: string
          title?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          created_at: string | null
          estimated_time: string | null
          feasibility: string | null
          id: string
          narrative_quality: string | null
          observations: string | null
          request_id: string
          result: string | null
          technical_difficulty: string | null
        }
        Insert: {
          created_at?: string | null
          estimated_time?: string | null
          feasibility?: string | null
          id?: string
          narrative_quality?: string | null
          observations?: string | null
          request_id: string
          result?: string | null
          technical_difficulty?: string | null
        }
        Update: {
          created_at?: string | null
          estimated_time?: string | null
          feasibility?: string | null
          id?: string
          narrative_quality?: string | null
          observations?: string | null
          request_id?: string
          result?: string | null
          technical_difficulty?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "project_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          bucket: string
          created_at: string | null
          id: string
          mime_type: string | null
          owner_id: string | null
          path: string
          project_id: string | null
          size_bytes: number | null
        }
        Insert: {
          bucket: string
          created_at?: string | null
          id?: string
          mime_type?: string | null
          owner_id?: string | null
          path: string
          project_id?: string | null
          size_bytes?: number | null
        }
        Update: {
          bucket?: string
          created_at?: string | null
          id?: string
          mime_type?: string | null
          owner_id?: string | null
          path?: string
          project_id?: string | null
          size_bytes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "files_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_notes: {
        Row: {
          author_id: string | null
          created_at: string | null
          id: string
          note: string
          project_id: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string | null
          id?: string
          note: string
          project_id: string
        }
        Update: {
          author_id?: string | null
          created_at?: string | null
          id?: string
          note?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          file_path: string | null
          id: string
          invoice_number: string
          payment_id: string
        }
        Insert: {
          created_at?: string | null
          file_path?: string | null
          id?: string
          invoice_number: string
          payment_id: string
        }
        Update: {
          created_at?: string | null
          file_path?: string | null
          id?: string
          invoice_number?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      manuscripts: {
        Row: {
          author_id: string
          created_at: string | null
          genre: string | null
          id: string
          language: string | null
          original_file_path: string | null
          status: string | null
          synopsis: string | null
          title: string
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          author_id: string
          created_at?: string | null
          genre?: string | null
          id?: string
          language?: string | null
          original_file_path?: string | null
          status?: string | null
          synopsis?: string | null
          title: string
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          author_id?: string
          created_at?: string | null
          genre?: string | null
          id?: string
          language?: string | null
          original_file_path?: string | null
          status?: string | null
          synopsis?: string | null
          title?: string
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "manuscripts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          author_id: string
          created_at: string | null
          id: string
          message: string
          status: string | null
          title: string
        }
        Insert: {
          author_id: string
          created_at?: string | null
          id?: string
          message: string
          status?: string | null
          title: string
        }
        Update: {
          author_id?: string
          created_at?: string | null
          id?: string
          message?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_plans: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string | null
          id: string
          installment_number: number
          percentage: number
          project_id: string
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          installment_number: number
          percentage: number
          project_id: string
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          installment_number?: number
          percentage?: number
          project_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_plans_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          chapter_id: string | null
          created_at: string | null
          id: string
          method: string | null
          paid_at: string | null
          payment_plan_id: string
          receipt_url: string | null
          reference: string | null
        }
        Insert: {
          amount: number
          chapter_id?: string | null
          created_at?: string | null
          id?: string
          method?: string | null
          paid_at?: string | null
          payment_plan_id: string
          receipt_url?: string | null
          reference?: string | null
        }
        Update: {
          amount?: number
          chapter_id?: string | null
          created_at?: string | null
          id?: string
          method?: string | null
          paid_at?: string | null
          payment_plan_id?: string
          receipt_url?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_plan_id_fkey"
            columns: ["payment_plan_id"]
            isOneToOne: false
            referencedRelation: "payment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      production_stages: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          end_date: string | null
          id: string
          name: string
          notes: string | null
          order_index: number
          progress_percentage: number | null
          project_id: string
          start_date: string | null
          status: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          name: string
          notes?: string | null
          order_index: number
          progress_percentage?: number | null
          project_id: string
          start_date?: string | null
          status?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          order_index?: number
          progress_percentage?: number | null
          project_id?: string
          start_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_requests: {
        Row: {
          channel: string | null
          created_at: string | null
          id: string
          manuscript_id: string
          status: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          id?: string
          manuscript_id: string
          status?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          id?: string
          manuscript_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_requests_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          author_id: string
          created_at: string | null
          id: string
          manuscript_id: string
          proposal_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          created_at?: string | null
          id?: string
          manuscript_id: string
          proposal_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          created_at?: string | null
          id?: string
          manuscript_id?: string
          proposal_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          deadline: string | null
          expires_at: string | null
          id: string
          request_id: string
          revisions_included: number | null
          services: Json | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          deadline?: string | null
          expires_at?: string | null
          id?: string
          request_id: string
          revisions_included?: number | null
          services?: Json | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          deadline?: string | null
          expires_at?: string | null
          id?: string
          request_id?: string
          revisions_included?: number | null
          services?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "project_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          chapter_title: string | null
          comment: string
          created_at: string | null
          deliverable_id: string
          file_path: string | null
          id: string
          status: string | null
        }
        Insert: {
          chapter_title?: string | null
          comment: string
          created_at?: string | null
          deliverable_id: string
          file_path?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          chapter_title?: string | null
          comment?: string
          created_at?: string | null
          deliverable_id?: string
          file_path?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline: {
        Row: {
          created_at: string | null
          details: string | null
          event: string
          id: string
          project_id: string
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          event: string
          id?: string
          project_id: string
        }
        Update: {
          created_at?: string | null
          details?: string | null
          event?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const