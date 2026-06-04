export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type TaskStatus = "registered" | "in_progress" | "review_requested" | "completed";
export type MemberRole =
  | "CEO"
  | "OPERATIONS_MANAGER"
  | "DEVELOPMENT_LEAD"
  | "DESIGNER"
  | "MARKETER"
  | "DEVELOPER"
  | "CONTENT_MANAGER"
  | "STAFF";

export type Database = {
  public: {
    Tables: {
      member: {
        Row: {
          id: string;
          auth_user_id: string | null;
          login_id: string;
          name: string;
          avatar_url: string | null;
          role_type: MemberRole;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["member"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["member"]["Row"]>;
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: TaskStatus;
          assignee_id: string;
          created_by: string;
          due_at: string | null;
          completed_at: string | null;
          is_draft: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tasks"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["tasks"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      member_role: MemberRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
