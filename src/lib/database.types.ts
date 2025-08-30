export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          phone: string;
          first_name: string;
          last_name: string;
          id_number: string;
          avatar_url?: string;
          role: 'user' | 'trainer' | 'admin';
          language: 'gr' | 'en';
          referral_code: string;
          referred_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone: string;
          first_name: string;
          last_name: string;
          id_number: string;
          avatar_url?: string;
          role?: 'user' | 'trainer' | 'admin';
          language?: 'gr' | 'en';
          referral_code?: string;
          referred_by?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      subscription_packages: {
        Row: {
          id: string;
          name_gr: string;
          name_en: string;
          duration_months: number;
          sessions_per_week: number;
          total_credits: number;
          price: number;
          description_gr?: string;
          description_en?: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscription_packages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['subscription_packages']['Insert']>;
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          package_id: string;
          status: 'pending' | 'active' | 'expired' | 'cancelled';
          credits_remaining: number;
          payment_status: 'pending' | 'approved' | 'rejected';
          payment_due_date?: string;
          approved_by?: string;
          approved_at?: string;
          starts_at?: string;
          expires_at?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_subscriptions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['user_subscriptions']['Insert']>;
      };
      class_types: {
        Row: {
          id: string;
          name_gr: string;
          name_en: string;
          description_gr?: string;
          description_en?: string;
          icon: string;
          color: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['class_types']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['class_types']['Insert']>;
      };
      rooms: {
        Row: {
          id: string;
          name_gr: string;
          name_en: string;
          class_type_id: string;
          max_capacity: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>;
      };
      class_sessions: {
        Row: {
          id: string;
          schedule_id: string;
          room_id: string;
          trainer_id?: string;
          session_date: string;
          start_time: string;
          end_time: string;
          current_bookings: number;
          max_capacity: number;
          status: 'available' | 'full' | 'cancelled';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['class_sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['class_sessions']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          subscription_id: string;
          qr_code: string;
          status: 'active' | 'cancelled' | 'completed' | 'no_show';
          checked_in_at?: string;
          checked_out_at?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'qr_code' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
    };
    Enums: {};
  };
}