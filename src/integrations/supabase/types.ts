export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      affiliate_links: {
        Row: {
          created_at: string
          id: string
          link_url: string
          product_id: string | null
          provider: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_url: string
          product_id?: string | null
          provider?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          link_url?: string
          product_id?: string | null
          provider?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      aquarium_parameter_settings: {
        Row: {
          aquarium_id: string
          created_at: string
          id: string
          max_value: number | null
          min_value: number | null
          parameter: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aquarium_id: string
          created_at?: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          parameter: string
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aquarium_id?: string
          created_at?: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          parameter?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aquarium_parameter_settings_aquarium_id_fkey"
            columns: ["aquarium_id"]
            isOneToOne: false
            referencedRelation: "aquariums"
            referencedColumns: ["id"]
          },
        ]
      }
      aquariums: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          size: number | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          size?: number | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          size?: number | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          aquarium_id: string
          brand: string | null
          created_at: string
          id: string
          image_url: string | null
          installed_at: string | null
          model: string | null
          notes: string | null
          type: string
          user_id: string
        }
        Insert: {
          aquarium_id: string
          brand?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          installed_at?: string | null
          model?: string | null
          notes?: string | null
          type: string
          user_id: string
        }
        Update: {
          aquarium_id?: string
          brand?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          installed_at?: string | null
          model?: string | null
          notes?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_aquarium_id_fkey"
            columns: ["aquarium_id"]
            isOneToOne: false
            referencedRelation: "aquariums"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          aquarium_id: string
          content: string | null
          created_at: string
          entry_date: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          aquarium_id: string
          content?: string | null
          created_at?: string
          entry_date?: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          aquarium_id?: string
          content?: string | null
          created_at?: string
          entry_date?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_aquarium_id_fkey"
            columns: ["aquarium_id"]
            isOneToOne: false
            referencedRelation: "aquariums"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_articles: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string | null
          created_at: string
          id: string
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "knowledge_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      livestock: {
        Row: {
          added_at: string
          aquarium_id: string
          created_at: string
          id: string
          image_url: string | null
          name: string | null
          notes: string | null
          quantity: number
          species: string
          user_id: string
        }
        Insert: {
          added_at?: string
          aquarium_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string | null
          notes?: string | null
          quantity?: number
          species: string
          user_id: string
        }
        Update: {
          added_at?: string
          aquarium_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string | null
          notes?: string | null
          quantity?: number
          species?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "livestock_aquarium_id_fkey"
            columns: ["aquarium_id"]
            isOneToOne: false
            referencedRelation: "aquariums"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance: {
        Row: {
          aquarium_id: string
          completed_date: string | null
          created_at: string
          due_date: string | null
          equipment_id: string | null
          frequency: string | null
          id: string
          notes: string | null
          task: string
          user_id: string
        }
        Insert: {
          aquarium_id: string
          completed_date?: string | null
          created_at?: string
          due_date?: string | null
          equipment_id?: string | null
          frequency?: string | null
          id?: string
          notes?: string | null
          task: string
          user_id: string
        }
        Update: {
          aquarium_id?: string
          completed_date?: string | null
          created_at?: string
          due_date?: string | null
          equipment_id?: string | null
          frequency?: string | null
          id?: string
          notes?: string | null
          task?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_aquarium_id_fkey"
            columns: ["aquarium_id"]
            isOneToOne: false
            referencedRelation: "aquariums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          enable_maintenance_notifications: boolean
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          enable_maintenance_notifications?: boolean
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          enable_maintenance_notifications?: boolean
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tank_type_presets: {
        Row: {
          created_at: string
          id: string
          max_value: number | null
          min_value: number | null
          name: string
          parameter: string
          unit: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          name: string
          parameter: string
          unit?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          name?: string
          parameter?: string
          unit?: string | null
        }
        Relationships: []
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
      water_parameters: {
        Row: {
          alkalinity: number | null
          ammonia: number | null
          aquarium_id: string
          calcium: number | null
          co2: number | null
          copper: number | null
          created_at: string
          gh: number | null
          id: string
          kh: number | null
          magnesium: number | null
          nitrate: number | null
          nitrite: number | null
          ph: number | null
          phosphate: number | null
          recorded_at: string
          salinity: number | null
          temperature: number | null
          user_id: string
        }
        Insert: {
          alkalinity?: number | null
          ammonia?: number | null
          aquarium_id: string
          calcium?: number | null
          co2?: number | null
          copper?: number | null
          created_at?: string
          gh?: number | null
          id?: string
          kh?: number | null
          magnesium?: number | null
          nitrate?: number | null
          nitrite?: number | null
          ph?: number | null
          phosphate?: number | null
          recorded_at?: string
          salinity?: number | null
          temperature?: number | null
          user_id: string
        }
        Update: {
          alkalinity?: number | null
          ammonia?: number | null
          aquarium_id?: string
          calcium?: number | null
          co2?: number | null
          copper?: number | null
          created_at?: string
          gh?: number | null
          id?: string
          kh?: number | null
          magnesium?: number | null
          nitrate?: number | null
          nitrite?: number | null
          ph?: number | null
          phosphate?: number | null
          recorded_at?: string
          salinity?: number | null
          temperature?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "water_parameters_aquarium_id_fkey"
            columns: ["aquarium_id"]
            isOneToOne: false
            referencedRelation: "aquariums"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          aquarium_id: string
          created_at: string
          estimated_price: number | null
          id: string
          item_type: string
          name: string
          notes: string | null
          priority: number | null
          user_id: string
        }
        Insert: {
          aquarium_id: string
          created_at?: string
          estimated_price?: number | null
          id?: string
          item_type: string
          name: string
          notes?: string | null
          priority?: number | null
          user_id: string
        }
        Update: {
          aquarium_id?: string
          created_at?: string
          estimated_price?: number | null
          id?: string
          item_type?: string
          name?: string
          notes?: string | null
          priority?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_aquarium_id_fkey"
            columns: ["aquarium_id"]
            isOneToOne: false
            referencedRelation: "aquariums"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_role_exists: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_pending_maintenance_notifications: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
