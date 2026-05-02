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
    };
  };
};
