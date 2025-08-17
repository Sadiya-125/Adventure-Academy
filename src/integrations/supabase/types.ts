export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)";
  };
  public: {
    Tables: {
      badges: {
        Row: {
          created_at: string;
          criteria: Json;
          description: string | null;
          emoji: string;
          id: string;
          is_active: boolean | null;
          name: string;
          points_value: number | null;
        };
        Insert: {
          created_at?: string;
          criteria: Json;
          description?: string | null;
          emoji: string;
          id?: string;
          is_active?: boolean | null;
          name: string;
          points_value?: number | null;
        };
        Update: {
          created_at?: string;
          criteria?: Json;
          description?: string | null;
          emoji?: string;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          points_value?: number | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          class_level: number | null;
          created_at: string;
          daily_time_limit: number | null;
          email: string;
          full_name: string;
          id: string;
          parent_id: string | null;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
          user_id: string;
          weekly_time_limit: number | null;
          active: boolean;
        };
        Insert: {
          avatar_url?: string | null;
          class_level?: number | null;
          created_at?: string;
          daily_time_limit?: number | null;
          email: string;
          full_name: string;
          id?: string;
          parent_id?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
          user_id: string;
          weekly_time_limit?: number | null;
          active?: boolean;
        };
        Update: {
          avatar_url?: string | null;
          class_level?: number | null;
          created_at?: string;
          daily_time_limit?: number | null;
          email?: string;
          full_name?: string;
          id?: string;
          parent_id?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
          user_id?: string;
          weekly_time_limit?: number | null;
          active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      quiz_questions: {
        Row: {
          correct_answer: string;
          created_at: string;
          explanation: string | null;
          id: string;
          options: Json | null;
          order_index: number;
          points: number;
          question_text: string;
          question_type: Database["public"]["Enums"]["quiz_question_type"];
          quiz_id: string;
        };
        Insert: {
          correct_answer: string;
          created_at?: string;
          explanation?: string | null;
          id?: string;
          options?: Json | null;
          order_index: number;
          points?: number;
          question_text: string;
          question_type?: Database["public"]["Enums"]["quiz_question_type"];
          quiz_id: string;
        };
        Update: {
          correct_answer?: string;
          created_at?: string;
          explanation?: string | null;
          id?: string;
          options?: Json | null;
          order_index?: number;
          points?: number;
          question_text?: string;
          question_type?: Database["public"]["Enums"]["quiz_question_type"];
          quiz_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey";
            columns: ["quiz_id"];
            isOneToOne: false;
            referencedRelation: "quizzes";
            referencedColumns: ["id"];
          }
        ];
      };
      quizzes: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          passing_score: number;
          points_reward: number;
          realm_id: string;
          title: string;
          total_questions: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          passing_score?: number;
          points_reward?: number;
          realm_id: string;
          title: string;
          total_questions?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          passing_score?: number;
          points_reward?: number;
          realm_id?: string;
          title?: string;
          total_questions?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quizzes_realm_id_fkey";
            columns: ["realm_id"];
            isOneToOne: false;
            referencedRelation: "realms";
            referencedColumns: ["id"];
          }
        ];
      };
      realms: {
        Row: {
          created_at: string;
          description: string | null;
          emoji: string;
          id: string;
          is_active: boolean | null;
          name: string;
          order_index: number;
          updated_at: string;
          video_title: string | null;
          video_url: string | null;
          world_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          emoji: string;
          id?: string;
          is_active?: boolean | null;
          name: string;
          order_index: number;
          updated_at?: string;
          video_title?: string | null;
          video_url?: string | null;
          world_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          emoji?: string;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          order_index?: number;
          updated_at?: string;
          video_title?: string | null;
          video_url?: string | null;
          world_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "realms_world_id_fkey";
            columns: ["world_id"];
            isOneToOne: false;
            referencedRelation: "worlds";
            referencedColumns: ["id"];
          }
        ];
      };
      student_badges: {
        Row: {
          badge_id: string;
          earned_at: string;
          id: string;
          student_id: string;
        };
        Insert: {
          badge_id: string;
          earned_at?: string;
          id?: string;
          student_id: string;
        };
        Update: {
          badge_id?: string;
          earned_at?: string;
          id?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_badges_badge_id_fkey";
            columns: ["badge_id"];
            isOneToOne: false;
            referencedRelation: "badges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_badges_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      student_progress: {
        Row: {
          completed_at: string | null;
          created_at: string;
          id: string;
          is_completed: boolean | null;
          points_earned: number | null;
          quiz_attempts: number | null;
          quiz_best_score: number | null;
          quiz_completed: boolean | null;
          quiz_completed_at: string | null;
          quiz_score: number | null;
          realm_id: string;
          student_id: string;
          updated_at: string;
          video_watched: boolean | null;
          video_watched_at: string | null;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          is_completed?: boolean | null;
          points_earned?: number | null;
          quiz_attempts?: number | null;
          quiz_best_score?: number | null;
          quiz_completed?: boolean | null;
          quiz_completed_at?: string | null;
          quiz_score?: number | null;
          realm_id: string;
          student_id: string;
          updated_at?: string;
          video_watched?: boolean | null;
          video_watched_at?: string | null;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          is_completed?: boolean | null;
          points_earned?: number | null;
          quiz_attempts?: number | null;
          quiz_best_score?: number | null;
          quiz_completed?: boolean | null;
          quiz_completed_at?: string | null;
          quiz_score?: number | null;
          realm_id?: string;
          student_id?: string;
          updated_at?: string;
          video_watched?: boolean | null;
          video_watched_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "student_progress_realm_id_fkey";
            columns: ["realm_id"];
            isOneToOne: false;
            referencedRelation: "realms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_progress_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      worlds: {
        Row: {
          created_at: string;
          description: string | null;
          emoji: string;
          id: string;
          is_active: boolean | null;
          name: string;
          order_index: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          emoji: string;
          id?: string;
          is_active?: boolean | null;
          name: string;
          order_index: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          emoji?: string;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          order_index?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      content_type: "video" | "quiz";
      quiz_question_type: "mcq" | "true_false";
      user_role: "student" | "parent" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      content_type: ["video", "quiz"],
      quiz_question_type: ["mcq", "true_false"],
      user_role: ["student", "parent", "admin"],
    },
  },
} as const;
