
export interface TimelineEntry {
  id: string;
  aquarium_id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export interface TimelineFormData {
  title: string;
  description?: string;
  entry_date: Date;
  image_url?: string;
}
