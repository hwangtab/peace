import type {
  AdminMember,
  ArchiveGalleryImageRow,
  ArchivePressItemRow,
  ArchiveVideoRow,
  CmsContentBlock,
} from './cms';
import type { SurveyInsertPayload } from '@/data/campSurvey2026';

type SurveyRow = SurveyInsertPayload & {
  id?: string;
  created_at?: string;
};

type TableDef<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      admin_members: TableDef<
        AdminMember,
        Partial<Omit<AdminMember, 'id' | 'created_at' | 'updated_at'>>,
        Partial<Omit<AdminMember, 'id' | 'created_at' | 'updated_at'>>
      >;
      cms_content_blocks: TableDef<
        CmsContentBlock,
        Partial<Omit<CmsContentBlock, 'id' | 'created_at' | 'updated_at'>>,
        Partial<Omit<CmsContentBlock, 'id' | 'created_at' | 'updated_at'>>
      >;
      archive_videos: TableDef<
        ArchiveVideoRow,
        Partial<Omit<ArchiveVideoRow, 'id' | 'created_at' | 'updated_at'>>,
        Partial<Omit<ArchiveVideoRow, 'id' | 'created_at' | 'updated_at'>>
      >;
      archive_gallery_images: TableDef<
        ArchiveGalleryImageRow,
        Partial<Omit<ArchiveGalleryImageRow, 'id' | 'created_at' | 'updated_at'>>,
        Partial<Omit<ArchiveGalleryImageRow, 'id' | 'created_at' | 'updated_at'>>
      >;
      archive_press_items: TableDef<
        ArchivePressItemRow,
        Partial<Omit<ArchivePressItemRow, 'id' | 'created_at' | 'updated_at'>>,
        Partial<Omit<ArchivePressItemRow, 'id' | 'created_at' | 'updated_at'>>
      >;
      camp_survey_responses: TableDef<SurveyRow, SurveyInsertPayload, Partial<SurveyInsertPayload>>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
