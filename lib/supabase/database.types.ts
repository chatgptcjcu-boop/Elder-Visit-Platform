export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          auth_user_id: string | null;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["accounts"]["Insert"]>;
      };
      units: {
        Row: {
          id: string;
          unit_name: string;
          unit_type: string | null;
          city: string | null;
          district: string | null;
          logo_url: string | null;
          theme_color: string | null;
          status: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          unit_name: string;
          unit_type?: string | null;
          city?: string | null;
          district?: string | null;
          logo_url?: string | null;
          theme_color?: string | null;
          status?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["units"]["Insert"]>;
      };
      workspaces: {
        Row: {
          id: string;
          unit_id: string;
          workspace_name: string;
          workspace_type: string | null;
          blueprint_id: string | null;
          status: string;
          created_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
          restore_deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          unit_id: string;
          workspace_name: string;
          workspace_type?: string | null;
          blueprint_id?: string | null;
          status?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
          restore_deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workspaces"]["Insert"]>;
      };
      platform_blueprints: {
        Row: {
          id: string;
          blueprint_name: string;
          blueprint_type: string;
          description: string | null;
          config: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          blueprint_name: string;
          blueprint_type: string;
          description?: string | null;
          config?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["platform_blueprints"]["Insert"]>;
      };
      workspace_registration_requests: {
        Row: {
          id: string;
          account_id: string | null;
          email: string;
          full_name: string;
          requested_unit_name: string | null;
          requested_workspace_id: string | null;
          requested_role_key: string;
          status: string;
          review_note: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          submitted_at: string;
          created_at: string;
          root_unit_name: string | null;
          department_name: string | null;
          department_other: string | null;
          job_title: string | null;
          job_title_other: string | null;
          display_name: string | null;
          gender: string | null;
          national_id: string | null;
          worker_group: string | null;
          official_email: string | null;
          phone: string | null;
          training_completed: boolean;
          training_completed_at: string | null;
          visitor_certificate_no: string | null;
          headshot_original_url: string | null;
          headshot_processed_url: string | null;
          social_bureau_review_status: string;
          social_bureau_reviewed_at: string | null;
          social_bureau_review_note: string | null;
          registration_code: string | null;
          auth_invite_status: string;
          auth_invited_at: string | null;
          auth_activated_at: string | null;
          profile_completion_status: string;
          profile_submitted_at: string | null;
          profile_reviewed_at: string | null;
          profile_return_reason: string | null;
          visitor_code: string | null;
          qr_code_payload: string | null;
        };
        Insert: {
          id?: string;
          account_id?: string | null;
          email: string;
          full_name: string;
          requested_unit_name?: string | null;
          requested_workspace_id?: string | null;
          requested_role_key: string;
          status?: string;
          review_note?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          submitted_at?: string;
          created_at?: string;
          root_unit_name?: string | null;
          department_name?: string | null;
          department_other?: string | null;
          job_title?: string | null;
          job_title_other?: string | null;
          display_name?: string | null;
          gender?: string | null;
          national_id?: string | null;
          worker_group?: string | null;
          official_email?: string | null;
          phone?: string | null;
          training_completed?: boolean;
          training_completed_at?: string | null;
          visitor_certificate_no?: string | null;
          headshot_original_url?: string | null;
          headshot_processed_url?: string | null;
          social_bureau_review_status?: string;
          social_bureau_reviewed_at?: string | null;
          social_bureau_review_note?: string | null;
          registration_code?: string | null;
          auth_invite_status?: string;
          auth_invited_at?: string | null;
          auth_activated_at?: string | null;
          profile_completion_status?: string;
          profile_submitted_at?: string | null;
          profile_reviewed_at?: string | null;
          profile_return_reason?: string | null;
          visitor_code?: string | null;
          qr_code_payload?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["workspace_registration_requests"]["Insert"]>;
      };
    };
  };
};
