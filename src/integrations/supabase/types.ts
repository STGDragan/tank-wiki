export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          aquarium_id: string
          created_at: string
          data: Json | null
          description: string | null
          id: string
          image_url: string | null
          logged_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type: string
          aquarium_id: string
          created_at?: string
          data?: Json | null
          description?: string | null
          id?: string
          image_url?: string | null
          logged_at?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          aquarium_id?: string
          created_at?: string
          data?: Json | null
          description?: string | null
          id?: string
          image_url?: string | null
          logged_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_aquarium_id_fkey"
            columns: ["aquarium_id"]
            isOneToOne: false
            referencedRelation: "aquariums"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_log: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          id: string
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      admin_granted_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_at: string
          granted_by_admin_id: string
          granted_to_user_id: string
          id: string
          is_active: boolean
          notes: string | null
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by_admin_id: string
          granted_to_user_id: string
          id?: string
          is_active?: boolean
          notes?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by_admin_id?: string
          granted_to_user_id?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      aquarium_share_invitations: {
        Row: {
          accepted_at: string | null
          aquarium_id: string
          created_at: string
          expires_at: string
          id: string
          invitation_token: string
          invited_email: string
          owner_user_id: string
          permission: Database["public"]["Enums"]["permission_level"]
        }
        Insert: {
          accepted_at?: string | null
          aquarium_id: string
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_email: string
          owner_user_id: string
          permission?: Database["public"]["Enums"]["permission_level"]
        }
        Update: {
          accepted_at?: string | null
          aquarium_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_email?: string
          owner_user_id?: string
          permission?: Database["public"]["Enums"]["permission_level"]
        }
        Relationships: [
          {
            foreignKeyName: "aquarium_share_invitations_aquarium_id_fkey"
            columns: ["aquarium_id"]
            isOneToOne: false
            referencedRelation: "aquariums"
            referencedColumns: ["id"]
          },
        ]
      }
      aquarium_shares: {
        Row: {
          aquarium_id: string
          created_at: string
          id: string
          owner_user_id: string
          permission: Database["public"]["Enums"]["permission_level"]
          shared_with_user_id: string
        }
        Insert: {
          aquarium_id: string
          created_at?: string
          id?: string
          owner_user_id: string
          permission: Database["public"]["Enums"]["permission_level"]
          shared_with_user_id: string
        }
        Update: {
          aquarium_id?: string
          created_at?: string
          id?: string
          owner_user_id?: string
          permission?: Database["public"]["Enums"]["permission_level"]
          shared_with_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aquarium_shares_aquarium_id_fkey"
            columns: ["aquarium_id"]
            isOneToOne: false
            referencedRelation: "aquariums"
            referencedColumns: ["id"]
          },
        ]
      }
      aquarium_timeline: {
        Row: {
          aquarium_id: string
          created_at: string
          description: string | null
          entry_date: string
          id: string
          image_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aquarium_id: string
          created_at?: string
          description?: string | null
          entry_date?: string
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          aquarium_id?: string
          created_at?: string
          description?: string | null
          entry_date?: string
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aquarium_timeline_aquarium_id_fkey"
            columns: ["aquarium_id"]
            isOneToOne: false
            referencedRelation: "aquariums"
            referencedColumns: ["id"]
          },
        ]
      }
      aquarium_wizard_progress: {
        Row: {
          aquarium_id: string
          completed_steps: string[]
          created_at: string
          id: string
          updated_at: string
          user_id: string
          wizard_data: Json
        }
        Insert: {
          aquarium_id: string
          completed_steps?: string[]
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          wizard_data?: Json
        }
        Update: {
          aquarium_id?: string
          completed_steps?: string[]
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          wizard_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "aquarium_wizard_progress_aquarium_id_fkey"
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
      article_wizard_guides: {
        Row: {
          article_id: string
          created_at: string
          display_order: number
          guide_area_id: string
          id: string
          is_primary: boolean
          updated_at: string
        }
        Insert: {
          article_id: string
          created_at?: string
          display_order?: number
          guide_area_id: string
          id?: string
          is_primary?: boolean
          updated_at?: string
        }
        Update: {
          article_id?: string
          created_at?: string
          display_order?: number
          guide_area_id?: string
          id?: string
          is_primary?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_wizard_guides_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "knowledge_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_wizard_guides_guide_area_id_fkey"
            columns: ["guide_area_id"]
            isOneToOne: false
            referencedRelation: "wizard_guide_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      compatibility_tags: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          tag_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tag_type?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tag_type?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          discount_type: string | null
          discount_value: number
          id: string
          is_active: boolean | null
          maximum_discount_amount: number | null
          minimum_order_amount: number | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value: number
          id?: string
          is_active?: boolean | null
          maximum_discount_amount?: number | null
          minimum_order_amount?: number | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          maximum_discount_amount?: number | null
          minimum_order_amount?: number | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
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
      equipment_warranties: {
        Row: {
          created_at: string
          equipment_id: string
          id: string
          is_active: boolean | null
          proof_of_purchase_url: string | null
          updated_at: string
          user_id: string
          warranty_end_date: string
          warranty_provider: string | null
          warranty_start_date: string
          warranty_terms: string | null
        }
        Insert: {
          created_at?: string
          equipment_id: string
          id?: string
          is_active?: boolean | null
          proof_of_purchase_url?: string | null
          updated_at?: string
          user_id: string
          warranty_end_date: string
          warranty_provider?: string | null
          warranty_start_date: string
          warranty_terms?: string | null
        }
        Update: {
          created_at?: string
          equipment_id?: string
          id?: string
          is_active?: boolean | null
          proof_of_purchase_url?: string | null
          updated_at?: string
          user_id?: string
          warranty_end_date?: string
          warranty_provider?: string | null
          warranty_start_date?: string
          warranty_terms?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_warranties_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          browser_info: Json | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          page_url: string | null
          priority: string | null
          resolved_at: string | null
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          browser_info?: Json | null
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          page_url?: string | null
          priority?: string | null
          resolved_at?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          browser_info?: Json | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          page_url?: string | null
          priority?: string | null
          resolved_at?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      grades: {
        Row: {
          details: string | null
          grade_label: string
          id: string
          strain_id: string | null
        }
        Insert: {
          details?: string | null
          grade_label: string
          id?: string
          strain_id?: string | null
        }
        Update: {
          details?: string | null
          grade_label?: string
          id?: string
          strain_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_strain_id_fkey"
            columns: ["strain_id"]
            isOneToOne: false
            referencedRelation: "strains"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          contributor: string | null
          grade_id: string | null
          id: string
          image_url: string
          license: string | null
          source: string | null
        }
        Insert: {
          contributor?: string | null
          grade_id?: string | null
          id?: string
          image_url: string
          license?: string | null
          source?: string | null
        }
        Update: {
          contributor?: string | null
          grade_id?: string | null
          id?: string
          image_url?: string
          license?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "images_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades"
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
          content_type: string | null
          created_at: string
          html_content: string | null
          id: string
          image_url: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          tldr: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          content_type?: string | null
          created_at?: string
          html_content?: string | null
          id?: string
          image_url?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          tldr?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string | null
          content_type?: string | null
          created_at?: string
          html_content?: string | null
          id?: string
          image_url?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          tldr?: string | null
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
      legal_documents: {
        Row: {
          content: string | null
          created_at: string
          document_type: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          document_type: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          document_type?: string
          id?: string
          title?: string
          updated_at?: string
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
          actual_cost: number | null
          actual_duration: number | null
          aquarium_id: string
          completed_date: string | null
          completion_percentage: number | null
          cost_estimate: number | null
          created_at: string
          due_date: string | null
          equipment_id: string | null
          estimated_duration: number | null
          frequency: string | null
          id: string
          maintenance_category: string | null
          next_due_date: string | null
          notes: string | null
          priority: string | null
          recurring_pattern: string | null
          skip_reason: string | null
          skipped_at: string | null
          supplier_id: string | null
          task: string
          template_id: string | null
          user_id: string
        }
        Insert: {
          actual_cost?: number | null
          actual_duration?: number | null
          aquarium_id: string
          completed_date?: string | null
          completion_percentage?: number | null
          cost_estimate?: number | null
          created_at?: string
          due_date?: string | null
          equipment_id?: string | null
          estimated_duration?: number | null
          frequency?: string | null
          id?: string
          maintenance_category?: string | null
          next_due_date?: string | null
          notes?: string | null
          priority?: string | null
          recurring_pattern?: string | null
          skip_reason?: string | null
          skipped_at?: string | null
          supplier_id?: string | null
          task: string
          template_id?: string | null
          user_id: string
        }
        Update: {
          actual_cost?: number | null
          actual_duration?: number | null
          aquarium_id?: string
          completed_date?: string | null
          completion_percentage?: number | null
          cost_estimate?: number | null
          created_at?: string
          due_date?: string | null
          equipment_id?: string | null
          estimated_duration?: number | null
          frequency?: string | null
          id?: string
          maintenance_category?: string | null
          next_due_date?: string | null
          notes?: string | null
          priority?: string | null
          recurring_pattern?: string | null
          skip_reason?: string | null
          skipped_at?: string | null
          supplier_id?: string | null
          task?: string
          template_id?: string | null
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
          {
            foreignKeyName: "maintenance_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "maintenance_suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "maintenance_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_analytics: {
        Row: {
          aquarium_id: string
          calculated_at: string
          equipment_id: string | null
          id: string
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
          user_id: string
        }
        Insert: {
          aquarium_id: string
          calculated_at?: string
          equipment_id?: string | null
          id?: string
          metric_type: string
          metric_value: number
          period_end: string
          period_start: string
          user_id: string
        }
        Update: {
          aquarium_id?: string
          calculated_at?: string
          equipment_id?: string | null
          id?: string
          metric_type?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_analytics_aquarium_id_fkey"
            columns: ["aquarium_id"]
            isOneToOne: false
            referencedRelation: "aquariums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_analytics_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_costs: {
        Row: {
          cost_amount: number
          cost_type: string | null
          created_at: string
          currency: string | null
          id: string
          maintenance_id: string
          notes: string | null
          receipt_url: string | null
          user_id: string
          vendor_name: string | null
        }
        Insert: {
          cost_amount: number
          cost_type?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          maintenance_id: string
          notes?: string | null
          receipt_url?: string | null
          user_id: string
          vendor_name?: string | null
        }
        Update: {
          cost_amount?: number
          cost_type?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          maintenance_id?: string
          notes?: string | null
          receipt_url?: string | null
          user_id?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_costs_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "maintenance"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean | null
          escalation_days: number | null
          escalation_enabled: boolean | null
          id: string
          notification_time: string | null
          reminder_intervals: number[] | null
          sms_enabled: boolean | null
          sms_number: string | null
          task_type_preferences: Json | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean | null
          escalation_days?: number | null
          escalation_enabled?: boolean | null
          id?: string
          notification_time?: string | null
          reminder_intervals?: number[] | null
          sms_enabled?: boolean | null
          sms_number?: string | null
          task_type_preferences?: Json | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean | null
          escalation_days?: number | null
          escalation_enabled?: boolean | null
          id?: string
          notification_time?: string | null
          reminder_intervals?: number[] | null
          sms_enabled?: boolean | null
          sms_number?: string | null
          task_type_preferences?: Json | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      maintenance_suppliers: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          notes: string | null
          preferred_supplier: boolean | null
          specialties: string[] | null
          supplier_name: string
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          preferred_supplier?: boolean | null
          specialties?: string[] | null
          supplier_name: string
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          preferred_supplier?: boolean | null
          specialties?: string[] | null
          supplier_name?: string
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      maintenance_templates: {
        Row: {
          created_at: string
          equipment_type: string
          estimated_cost: number | null
          frequency_days: number
          id: string
          instructions: string | null
          is_active: boolean | null
          priority: string | null
          required_supplies: Json | null
          task_description: string
          template_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment_type: string
          estimated_cost?: number | null
          frequency_days: number
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          priority?: string | null
          required_supplies?: Json | null
          task_description: string
          template_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment_type?: string
          estimated_cost?: number | null
          frequency_days?: number
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          priority?: string | null
          required_supplies?: Json | null
          task_description?: string
          template_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          aquarium_id: string
          created_at: string
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          name: string
          notes: string | null
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aquarium_id: string
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          name: string
          notes?: string | null
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          aquarium_id?: string
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          name?: string
          notes?: string | null
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_aquarium_id_fkey"
            columns: ["aquarium_id"]
            isOneToOne: false
            referencedRelation: "aquariums"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          total_price: number
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string | null
          currency: string | null
          discount_amount: number | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          shipping_address: Json | null
          shipping_amount: number | null
          status: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string | null
          currency?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_amount?: number | null
          status?: string | null
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          created_at?: string | null
          currency?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_amount?: number | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      predefined_subcategories: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "predefined_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories_new"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      product_categories_new: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_new_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories_new"
            referencedColumns: ["id"]
          },
        ]
      }
      product_category_assignments: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          product_id: string | null
          subcategory_name: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          subcategory_name?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          subcategory_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_category_assignments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories_new"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_category_assignments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_compatibility_tags: {
        Row: {
          compatibility_tag_id: string | null
          created_at: string
          id: string
          product_id: string | null
        }
        Insert: {
          compatibility_tag_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
        }
        Update: {
          compatibility_tag_id?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_compatibility_tags_compatibility_tag_id_fkey"
            columns: ["compatibility_tag_id"]
            isOneToOne: false
            referencedRelation: "compatibility_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_compatibility_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          created_at: string | null
          helpful_votes: number | null
          id: string
          product_id: string | null
          rating: number | null
          review_text: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          verified_purchase: boolean | null
        }
        Insert: {
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          product_id?: string | null
          rating?: number | null
          review_text?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified_purchase?: boolean | null
        }
        Update: {
          created_at?: string | null
          helpful_votes?: number | null
          id?: string
          product_id?: string | null
          rating?: number | null
          review_text?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          created_at: string
          product_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string | null
          id: string
          price_adjustment: number | null
          product_id: string | null
          sku: string | null
          stock_quantity: number | null
          updated_at: string | null
          variant_name: string
          variant_value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          price_adjustment?: number | null
          product_id?: string | null
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          variant_name: string
          variant_value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          price_adjustment?: number | null
          product_id?: string | null
          sku?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
          variant_name?: string
          variant_value?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          affiliate_url: string | null
          amazon_url: string | null
          brand: string | null
          care_level: string | null
          category: string | null
          category_id: string | null
          condition: string | null
          created_at: string
          description: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          dimensions: Json | null
          id: string
          image_url: string | null
          images: string[] | null
          imageurls: Json | null
          is_featured: boolean
          is_livestock: boolean | null
          is_on_sale: boolean | null
          is_recommended: boolean
          low_stock_threshold: number | null
          max_size: string | null
          meta_description: string | null
          meta_title: string | null
          min_tank_size: string | null
          model: string | null
          name: string
          onSale: boolean
          regular_price: number | null
          sale_end_date: string | null
          sale_price: number | null
          sale_start_date: string | null
          shipping_class: string | null
          size_class: Database["public"]["Enums"]["size_class"] | null
          sku: string | null
          stock_quantity: number | null
          subcategories: string[] | null
          subcategory: string | null
          tags: string[] | null
          tank_types: Database["public"]["Enums"]["tank_type"][] | null
          temperament: Database["public"]["Enums"]["temperament"] | null
          track_inventory: boolean | null
          updated_at: string
          visible: boolean
          warranty_info: string | null
          water_params: Json | null
          weight: number | null
        }
        Insert: {
          affiliate_url?: string | null
          amazon_url?: string | null
          brand?: string | null
          care_level?: string | null
          category?: string | null
          category_id?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          dimensions?: Json | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          imageurls?: Json | null
          is_featured?: boolean
          is_livestock?: boolean | null
          is_on_sale?: boolean | null
          is_recommended?: boolean
          low_stock_threshold?: number | null
          max_size?: string | null
          meta_description?: string | null
          meta_title?: string | null
          min_tank_size?: string | null
          model?: string | null
          name: string
          onSale?: boolean
          regular_price?: number | null
          sale_end_date?: string | null
          sale_price?: number | null
          sale_start_date?: string | null
          shipping_class?: string | null
          size_class?: Database["public"]["Enums"]["size_class"] | null
          sku?: string | null
          stock_quantity?: number | null
          subcategories?: string[] | null
          subcategory?: string | null
          tags?: string[] | null
          tank_types?: Database["public"]["Enums"]["tank_type"][] | null
          temperament?: Database["public"]["Enums"]["temperament"] | null
          track_inventory?: boolean | null
          updated_at?: string
          visible?: boolean
          warranty_info?: string | null
          water_params?: Json | null
          weight?: number | null
        }
        Update: {
          affiliate_url?: string | null
          amazon_url?: string | null
          brand?: string | null
          care_level?: string | null
          category?: string | null
          category_id?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          dimensions?: Json | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          imageurls?: Json | null
          is_featured?: boolean
          is_livestock?: boolean | null
          is_on_sale?: boolean | null
          is_recommended?: boolean
          low_stock_threshold?: number | null
          max_size?: string | null
          meta_description?: string | null
          meta_title?: string | null
          min_tank_size?: string | null
          model?: string | null
          name?: string
          onSale?: boolean
          regular_price?: number | null
          sale_end_date?: string | null
          sale_price?: number | null
          sale_start_date?: string | null
          shipping_class?: string | null
          size_class?: Database["public"]["Enums"]["size_class"] | null
          sku?: string | null
          stock_quantity?: number | null
          subcategories?: string[] | null
          subcategory?: string | null
          tags?: string[] | null
          tank_types?: Database["public"]["Enums"]["tank_type"][] | null
          temperament?: Database["public"]["Enums"]["temperament"] | null
          track_inventory?: boolean | null
          updated_at?: string
          visible?: boolean
          warranty_info?: string | null
          water_params?: Json | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories_new"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_can_grant_subscriptions: boolean | null
          admin_subscription_override: boolean | null
          avatar_url: string | null
          email: string | null
          enable_maintenance_notifications: boolean
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          admin_can_grant_subscriptions?: boolean | null
          admin_subscription_override?: boolean | null
          avatar_url?: string | null
          email?: string | null
          enable_maintenance_notifications?: boolean
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_can_grant_subscriptions?: boolean | null
          admin_subscription_override?: boolean | null
          avatar_url?: string | null
          email?: string | null
          enable_maintenance_notifications?: boolean
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shopping_cart: {
        Row: {
          added_at: string | null
          id: string
          product_id: string | null
          quantity: number
          updated_at: string | null
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          updated_at?: string | null
          user_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_cart_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      slideshow_images: {
        Row: {
          alt_text: string | null
          context: string
          created_at: string
          display_order: number
          id: string
          image_url: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          context?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          context?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      slideshow_settings: {
        Row: {
          autoplay_delay: number
          created_at: string
          id: number
          updated_at: string
        }
        Insert: {
          autoplay_delay?: number
          created_at?: string
          id?: number
          updated_at?: string
        }
        Update: {
          autoplay_delay?: number
          created_at?: string
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      social_media_links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          platform: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      species: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      strains: {
        Row: {
          description: string | null
          id: string
          name: string
          species_id: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          species_id?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          species_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strains_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "species"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
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
      user_preferences: {
        Row: {
          created_at: string
          id: string
          units_volume: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          units_volume?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          units_volume?: string
          updated_at?: string
          user_id?: string
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
      wizard_guide_areas: {
        Row: {
          area_key: string
          area_name: string
          created_at: string
          description: string | null
          id: string
        }
        Insert: {
          area_key: string
          area_name: string
          created_at?: string
          description?: string | null
          id?: string
        }
        Update: {
          area_key?: string
          area_name?: string
          created_at?: string
          description?: string | null
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_aquarium_invitation: {
        Args: { _invitation_token: string }
        Returns: Json
      }
      admin_role_exists: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_aquarium_permission: {
        Args: {
          _aquarium_id: string
          _permission_level: Database["public"]["Enums"]["permission_level"]
        }
        Returns: boolean
      }
      format_amazon_affiliate_url: {
        Args: { input_url: string; affiliate_tag?: string }
        Returns: string
      }
      generate_maintenance_from_template: {
        Args: {
          p_equipment_id: string
          p_template_id: string
          p_user_id: string
          p_aquarium_id: string
        }
        Returns: string
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_category_hierarchy: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          slug: string
          description: string
          parent_id: string
          level: number
          path: string[]
        }[]
      }
      get_effective_price: {
        Args: { product_row: Database["public"]["Tables"]["products"]["Row"] }
        Returns: number
      }
      get_pending_maintenance_notifications: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_admin_granted_subscription: {
        Args: { _user_id: string }
        Returns: boolean
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
      log_admin_action: {
        Args: {
          _action_type: string
          _target_type: string
          _target_id?: string
          _old_values?: Json
          _new_values?: Json
          _metadata?: Json
        }
        Returns: undefined
      }
      setup_default_maintenance_schedule: {
        Args: { p_user_id: string; p_aquarium_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      difficulty_level: "beginner" | "intermediate" | "expert"
      permission_level: "viewer" | "editor"
      size_class: "nano" | "small" | "medium" | "large" | "giant"
      tank_type:
        | "freshwater_community"
        | "african_cichlid"
        | "planted_low_tech"
        | "planted_high_tech"
        | "brackish"
        | "freshwater_nano"
        | "saltwater_fo"
        | "fowlr"
        | "reef_soft_coral"
        | "reef_lps"
        | "reef_sps"
        | "reef_mixed"
      temperament: "peaceful" | "semi_aggressive" | "aggressive"
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
      app_role: ["admin", "user"],
      difficulty_level: ["beginner", "intermediate", "expert"],
      permission_level: ["viewer", "editor"],
      size_class: ["nano", "small", "medium", "large", "giant"],
      tank_type: [
        "freshwater_community",
        "african_cichlid",
        "planted_low_tech",
        "planted_high_tech",
        "brackish",
        "freshwater_nano",
        "saltwater_fo",
        "fowlr",
        "reef_soft_coral",
        "reef_lps",
        "reef_sps",
        "reef_mixed",
      ],
      temperament: ["peaceful", "semi_aggressive", "aggressive"],
    },
  },
} as const
