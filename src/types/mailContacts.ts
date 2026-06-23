export type MailGroupType = 'musician' | 'planning' | 'sponsor';

export interface MailContact {
  id: string;
  name: string;
  email: string;
  group_type: MailGroupType;
  cohorts: string[];
  note: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
