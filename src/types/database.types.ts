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
      chapters: {
        Row: {
          id: string;
          project_id: string;
          chapter_number: number;
          title?: string;
          duration_seconds?: number;
          status?: 'pending' | 'ready' | 'review';
          created_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['chapters']['Row'], 'id' | 'created_at'>> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['chapters']['Insert']>;
      };
      quotes: {
        Row: {
          id: string;
          project_id: string;
          amount: number;
          deposit_percentage: number;
          status: 'draft' | 'sent' | 'accepted' | 'rejected';
          created_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['quotes']['Row'], 'id' | 'created_at'>> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['quotes']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          quote_id: string;
          amount: number;
          status: 'pending' | 'partial' | 'paid';
          paid_at?: string;
          created_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      deliveries: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          type: 'final' | 'sample' | 'review';
          url?: string;
          created_at: string;
        };
        Insert: Partial<Omit<Database['public']['Tables']['deliveries']['Row'], 'id' | 'created_at'>> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['deliveries']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
