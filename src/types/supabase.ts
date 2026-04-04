export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      // Backend assumption:
      // - Table names follow this structure.
      // - Replace with generated types once production schema is fixed.
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          sort_order: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          sort_order?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          sort_order?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: Relationship[];
      };
      sources: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          website_url: string | null;
          logo_url: string | null;
          category_id: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          website_url?: string | null;
          logo_url?: string | null;
          category_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          website_url?: string | null;
          logo_url?: string | null;
          category_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: Relationship[];
      };
      articles: {
        Row: {
          id: string;
          title: string;
          summary: string | null;
          content: string | null;
          image_url: string | null;
          link: string;
          published_at: string;
          source_id: string;
          category_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          summary?: string | null;
          content?: string | null;
          image_url?: string | null;
          link: string;
          published_at: string;
          source_id: string;
          category_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          summary?: string | null;
          content?: string | null;
          image_url?: string | null;
          link?: string;
          published_at?: string;
          source_id?: string;
          category_id?: string | null;
          created_at?: string;
        };
        Relationships: Relationship[];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          article_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          article_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          article_id?: string;
          created_at?: string;
        };
        Relationships: Relationship[];
      };
      user_preferences: {
        Row: {
          user_id: string;
          category_ids: string[];
          source_ids: string[];
          updated_at: string;
        };
        Insert: {
          user_id: string;
          category_ids?: string[];
          source_ids?: string[];
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          category_ids?: string[];
          source_ids?: string[];
          updated_at?: string;
        };
        Relationships: Relationship[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
