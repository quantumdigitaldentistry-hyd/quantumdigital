export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      appointment_messages: {
        Row: {
          appointment_id: string;
          body: string;
          channel: string;
          created_at: string;
          id: string;
          provider_ref: string | null;
          sent_by: string | null;
          status: string;
          to_phone: string;
        };
        Insert: {
          appointment_id: string;
          body: string;
          channel: string;
          created_at?: string;
          id?: string;
          provider_ref?: string | null;
          sent_by?: string | null;
          status?: string;
          to_phone: string;
        };
        Update: {
          appointment_id?: string;
          body?: string;
          channel?: string;
          created_at?: string;
          id?: string;
          provider_ref?: string | null;
          sent_by?: string | null;
          status?: string;
          to_phone?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'appointment_messages_appointment_id_fkey';
            columns: ['appointment_id'];
            isOneToOne: false;
            referencedRelation: 'appointments';
            referencedColumns: ['id'];
          },
        ];
      };
      appointments: {
        Row: {
          created_at: string;
          doctor_id: string | null;
          ends_at: string | null;
          id: string;
          internal_notes: string | null;
          kind: string;
          message: string | null;
          patient_name: string;
          patient_phone: string;
          preferred_date: string | null;
          preferred_time: string | null;
          source: string;
          starts_at: string | null;
          status: Database['public']['Enums']['appointment_status'];
          treatment_slug: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string;
          doctor_id?: string | null;
          ends_at?: string | null;
          id?: string;
          internal_notes?: string | null;
          kind?: string;
          message?: string | null;
          patient_name: string;
          patient_phone: string;
          preferred_date?: string | null;
          preferred_time?: string | null;
          source?: string;
          starts_at?: string | null;
          status?: Database['public']['Enums']['appointment_status'];
          treatment_slug?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string;
          doctor_id?: string | null;
          ends_at?: string | null;
          id?: string;
          internal_notes?: string | null;
          kind?: string;
          message?: string | null;
          patient_name?: string;
          patient_phone?: string;
          preferred_date?: string | null;
          preferred_time?: string | null;
          source?: string;
          starts_at?: string | null;
          status?: Database['public']['Enums']['appointment_status'];
          treatment_slug?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'appointments_doctor_id_fkey';
            columns: ['doctor_id'];
            isOneToOne: false;
            referencedRelation: 'team_members';
            referencedColumns: ['id'];
          },
        ];
      };
      articles: {
        Row: {
          author_id: string | null;
          body: string;
          cover_alt: string;
          cover_path: string | null;
          created_at: string;
          excerpt: string;
          id: string;
          kind: string;
          published_at: string | null;
          slug: string;
          status: string;
          title: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          author_id?: string | null;
          body?: string;
          cover_alt?: string;
          cover_path?: string | null;
          created_at?: string;
          excerpt?: string;
          id?: string;
          kind?: string;
          published_at?: string | null;
          slug: string;
          status?: string;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          author_id?: string | null;
          body?: string;
          cover_alt?: string;
          cover_path?: string | null;
          created_at?: string;
          excerpt?: string;
          id?: string;
          kind?: string;
          published_at?: string | null;
          slug?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      gallery_items: {
        Row: {
          alt: string;
          created_at: string;
          created_by: string | null;
          height: number | null;
          id: string;
          image_path: string | null;
          kind: string;
          published: boolean;
          sort: number;
          updated_at: string;
          updated_by: string | null;
          video_id: string | null;
          width: number | null;
        };
        Insert: {
          alt: string;
          created_at?: string;
          created_by?: string | null;
          height?: number | null;
          id?: string;
          image_path?: string | null;
          kind?: string;
          published?: boolean;
          sort?: number;
          updated_at?: string;
          updated_by?: string | null;
          video_id?: string | null;
          width?: number | null;
        };
        Update: {
          alt?: string;
          created_at?: string;
          created_by?: string | null;
          height?: number | null;
          id?: string;
          image_path?: string | null;
          kind?: string;
          published?: boolean;
          sort?: number;
          updated_at?: string;
          updated_by?: string | null;
          video_id?: string | null;
          width?: number | null;
        };
        Relationships: [];
      };
      result_cases: {
        Row: {
          after_path: string;
          before_path: string;
          consent_confirmed: boolean;
          created_at: string;
          created_by: string | null;
          id: string;
          published: boolean;
          sort: number;
          title: string;
          treatment_slug: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          after_path: string;
          before_path: string;
          consent_confirmed?: boolean;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          published?: boolean;
          sort?: number;
          title: string;
          treatment_slug: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          after_path?: string;
          before_path?: string;
          consent_confirmed?: boolean;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          published?: boolean;
          sort?: number;
          title?: string;
          treatment_slug?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: NonNullable<Json>;
        };
        Insert: {
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value: NonNullable<Json>;
        };
        Update: {
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: NonNullable<Json>;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          active: boolean;
          colour: string;
          created_at: string;
          doctor_slug: string | null;
          email: string;
          full_name: string;
          id: string;
          invited_by: string | null;
          phone: string | null;
          role: Database['public']['Enums']['team_role'];
        };
        Insert: {
          active?: boolean;
          colour?: string;
          created_at?: string;
          doctor_slug?: string | null;
          email: string;
          full_name?: string;
          id: string;
          invited_by?: string | null;
          phone?: string | null;
          role?: Database['public']['Enums']['team_role'];
        };
        Update: {
          active?: boolean;
          colour?: string;
          created_at?: string;
          doctor_slug?: string | null;
          email?: string;
          full_name?: string;
          id?: string;
          invited_by?: string | null;
          phone?: string | null;
          role?: Database['public']['Enums']['team_role'];
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      allow_booking: {
        Args: { hash: string; max_per_window?: number; window_minutes?: number };
        Returns: boolean;
      };
      can_manage_team: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_team: { Args: Record<PropertyKey, never>; Returns: boolean };
      my_role: {
        Args: Record<PropertyKey, never>;
        Returns: Database['public']['Enums']['team_role'];
      };
      set_team_member: {
        Args: {
          member: string;
          new_active: boolean;
          new_doctor_slug?: string;
          new_role: Database['public']['Enums']['team_role'];
        };
        Returns: undefined;
      };
    };
    Enums: {
      appointment_status: 'requested' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
      team_role: 'super_admin' | 'doctor' | 'staff';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      appointment_status: ['requested', 'confirmed', 'completed', 'cancelled', 'no_show'],
      team_role: ['super_admin', 'doctor', 'staff'],
    },
  },
} as const;
