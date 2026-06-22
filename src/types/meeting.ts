export type MeetingStatus = 'scheduled' | 'completed';
export type AgendaStatus = 'proposed' | 'discussed' | 'resolved';

export interface Meeting {
  id: string;
  title: string;
  meeting_date: string | null;
  meeting_time: string;
  location: string;
  status: MeetingStatus;
  minutes_md: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingAgenda {
  id: string;
  meeting_id: string;
  title: string;
  content: string;
  sort_order: number;
  status: AgendaStatus;
  created_at: string;
  updated_at: string;
}

export interface MeetingAttendee {
  id: string;
  meeting_id: string;
  name: string;
  note: string;
  sort_order: number;
  created_at: string;
}

export interface MeetingAttachment {
  id: string;
  meeting_id: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string;
  created_at: string;
}
