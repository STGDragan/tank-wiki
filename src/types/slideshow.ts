
export interface SlideshowImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  context: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SlideshowSettings {
  id: number;
  autoplay_delay: number;
  created_at: string;
  updated_at: string;
}

export interface SlideshowSectionProps {
  context: string;
  autoplayDelay?: number;
}
