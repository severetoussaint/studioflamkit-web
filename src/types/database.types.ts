type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'author' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      authors: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          alias?: string;
          bio?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['authors']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['authors']['Insert']>;
      };
      manuscripts: {
        Row: {
          id: string;
          project_id?: string;
          title: string;
          content?: string;
          status: 'draft' | 'submitted' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['manuscripts']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['manuscripts']['Insert']>;
      };
      project_requests: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          summary?: string;
          status: 'draft' | 'submitted' | 'approved' | 'rejected';
          requested_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['project_requests']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['project_requests']['Insert']>;
      };
      evaluations: {
        Row: {
          id: string;
          project_request_id: string;
          reviewer_id: string;
          score: number;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['evaluations']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['evaluations']['Insert']>;
      };
      proposals: {
        Row: {
          id: string;
          project_request_id: string;
          amount: number;
          deposit_percentage: number;
          status: 'draft' | 'sent' | 'accepted' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['proposals']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['proposals']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          title: string;
          author_id?: string;
          client_id?: string;
          status: 'analisis' | 'produccion' | 'revisiones' | 'completado';
          word_count?: number;
          page_count?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      production_stages: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          status: 'pending' | 'in_progress' | 'complete';
          order_index: number;
          started_at?: string;
          completed_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['production_stages']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['production_stages']['Insert']>;
      };
      deliverables: {
        Row: {
          id: string;
          project_id: string;
          stage_id?: string;
          title: string;
          type: 'final' | 'sample' | 'review';
          url?: string;
          status: 'pending' | 'ready' | 'reviewed';
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['deliverables']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['deliverables']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          deliverable_id: string;
          reviewer_id?: string;
          comments?: string;
          status: 'pending' | 'approved' | 'changes_requested';
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      payment_plans: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          total_amount: number;
          currency: string;
          status: 'draft' | 'active' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['payment_plans']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payment_plans']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          payment_plan_id: string;
          amount: number;
          status: 'pending' | 'partial' | 'paid';
          paid_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      invoices: {
        Row: {
          id: string;
          payment_plan_id: string;
          invoice_number: string;
          amount: number;
          status: 'draft' | 'issued' | 'paid' | 'overdue';
          issued_at?: string;
          paid_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
      };
      files: {
        Row: {
          id: string;
          project_id?: string;
          bucket: string;
          path: string;
          mime_type?: string;
          size_bytes?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['files']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['files']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body?: string;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      timeline: {
        Row: {
          id: string;
          project_id: string;
          event_type: string;
          message: string;
          created_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['timeline']['Row'], 'id' | 'created_at'>> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['timeline']['Insert']>;
      };
      internal_notes: {
        Row: {
          id: string;
          project_id: string;
          author_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['internal_notes']['Row'], 'id' | 'created_at' | 'updated_at'>> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['internal_notes']['Insert']>;
      };
      audit_logs: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          action: string;
          user_id?: string;
          details?: JsonValue;
          created_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
