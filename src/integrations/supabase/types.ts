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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      campuses: {
        Row: {
          church_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          church_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          church_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "campuses_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      churches: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      initiative_activity: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          initiative_id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          initiative_id: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          initiative_id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "initiative_activity_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_notes: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          initiative_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          initiative_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          initiative_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiative_notes_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      initiatives: {
        Row: {
          audience: string | null
          campus_id: string | null
          channels_requested: string[] | null
          church_id: string
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          goal: string | null
          id: string
          initiative_brief: string | null
          initiative_type: string
          ministry_id: string
          missing_info_checklist: Json | null
          recommended_strategy: Json | null
          start_date: string
          status: string
          suggested_timeline: Json | null
          target_outcome: string | null
          title: string
          token_cost_estimate: number | null
          token_cost_final: number | null
          updated_at: string
        }
        Insert: {
          audience?: string | null
          campus_id?: string | null
          channels_requested?: string[] | null
          church_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          goal?: string | null
          id?: string
          initiative_brief?: string | null
          initiative_type?: string
          ministry_id: string
          missing_info_checklist?: Json | null
          recommended_strategy?: Json | null
          start_date: string
          status?: string
          suggested_timeline?: Json | null
          target_outcome?: string | null
          title: string
          token_cost_estimate?: number | null
          token_cost_final?: number | null
          updated_at?: string
        }
        Update: {
          audience?: string | null
          campus_id?: string | null
          channels_requested?: string[] | null
          church_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          goal?: string | null
          id?: string
          initiative_brief?: string | null
          initiative_type?: string
          ministry_id?: string
          missing_info_checklist?: Json | null
          recommended_strategy?: Json | null
          start_date?: string
          status?: string
          suggested_timeline?: Json | null
          target_outcome?: string | null
          title?: string
          token_cost_estimate?: number | null
          token_cost_final?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiatives_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiatives_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "initiatives_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
        ]
      }
      ministries: {
        Row: {
          church_id: string
          color: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          church_id: string
          color?: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          church_id?: string
          color?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ministries_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          church_id: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          church_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          church_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
        ]
      }
      token_balances: {
        Row: {
          allocated: number
          church_id: string
          created_at: string
          id: string
          ministry_id: string
          month: string
          spent: number
        }
        Insert: {
          allocated?: number
          church_id: string
          created_at?: string
          id?: string
          ministry_id: string
          month: string
          spent?: number
        }
        Update: {
          allocated?: number
          church_id?: string
          created_at?: string
          id?: string
          ministry_id?: string
          month?: string
          spent?: number
        }
        Relationships: [
          {
            foreignKeyName: "token_balances_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_balances_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
        ]
      }
      token_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          initiative_id: string
          ministry_id: string
          reason: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          initiative_id: string
          ministry_id: string
          reason: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          initiative_id?: string
          ministry_id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_transactions_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_transactions_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      work_items: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          external_link: string | null
          external_task_id: string | null
          external_tool: string | null
          id: string
          initiative_id: string
          status: string
          title: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          external_link?: string | null
          external_task_id?: string | null
          external_tool?: string | null
          id?: string
          initiative_id: string
          status?: string
          title: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          external_link?: string | null
          external_task_id?: string | null
          external_tool?: string | null
          id?: string
          initiative_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_items_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_church_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "creative_team"
        | "ministry_leader"
        | "mentor"
        | "community_member"
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
        "admin",
        "creative_team",
        "ministry_leader",
        "mentor",
        "community_member",
      ],
    },
  },
} as const
