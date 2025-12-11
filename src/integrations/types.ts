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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      hoteis: {
        Row: {
          categoria: number | null
          comodidades: string[] | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nome: string
          praia_id: string | null
          telefone: string | null
          website: string | null
        }
        Insert: {
          categoria?: number | null
          comodidades?: string[] | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome: string
          praia_id?: string | null
          telefone?: string | null
          website?: string | null
        }
        Update: {
          categoria?: number | null
          comodidades?: string[] | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string
          praia_id?: string | null
          telefone?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hoteis_praia_id_fkey"
            columns: ["praia_id"]
            isOneToOne: false
            referencedRelation: "praias"
            referencedColumns: ["id"]
          },
        ]
      }
      praias: {
        Row: {
          caracteristicas: string[] | null
          created_at: string
          descricao: string | null
          id: string
          ideal_para: string[] | null
          imagem_url: string | null
          infraestrutura: string[] | null
          latitude: number | null
          longitude: number | null
          municipio: string
          nivel_agitacao: string | null
          nome: string
          updated_at: string
        }
        Insert: {
          caracteristicas?: string[] | null
          created_at?: string
          descricao?: string | null
          id?: string
          ideal_para?: string[] | null
          imagem_url?: string | null
          infraestrutura?: string[] | null
          latitude?: number | null
          longitude?: number | null
          municipio: string
          nivel_agitacao?: string | null
          nome: string
          updated_at?: string
        }
        Update: {
          caracteristicas?: string[] | null
          created_at?: string
          descricao?: string | null
          id?: string
          ideal_para?: string[] | null
          imagem_url?: string | null
          infraestrutura?: string[] | null
          latitude?: number | null
          longitude?: number | null
          municipio?: string
          nivel_agitacao?: string | null
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      restaurantes: {
        Row: {
          created_at: string
          endereco: string | null
          especialidades: string[] | null
          faixa_preco: string | null
          horario_funcionamento: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nome: string
          praia_id: string | null
          telefone: string | null
          tipo: string
        }
        Insert: {
          created_at?: string
          endereco?: string | null
          especialidades?: string[] | null
          faixa_preco?: string | null
          horario_funcionamento?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome: string
          praia_id?: string | null
          telefone?: string | null
          tipo: string
        }
        Update: {
          created_at?: string
          endereco?: string | null
          especialidades?: string[] | null
          faixa_preco?: string | null
          horario_funcionamento?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string
          praia_id?: string | null
          telefone?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurantes_praia_id_fkey"
            columns: ["praia_id"]
            isOneToOne: false
            referencedRelation: "praias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
