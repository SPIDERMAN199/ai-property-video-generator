export interface ImageItem {
  id: string;
  project_id: string;
  filename: string;
  original_name: string;
  file_path: string;
  url: string;
  sort_order: number;
  width: number;
  height: number;
  created_at: string;
}

export interface ScriptData {
  id: string;
  project_id: string;
  opening_headline: string;
  property_intro: string;
  feature_captions: string[];
  closing_cta: string;
  narration_script: string;
  provider_used: string;
  created_at: string;
}

export interface StoryboardScene {
  id?: string;
  scene_number: number;
  image_id: string;
  image_url?: string;
  duration: number;
  caption: string;
  badge: string;
  transition: string;
  narration_text?: string;
}

export interface RenderJob {
  id: string;
  project_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  aspect_ratio: '9:16' | '16:9' | '1:1';
  resolution: '720p' | '1080p';
  duration_preset: '20s' | '30s' | '40s';
  template: 'luxury' | 'minimal' | 'showcase';
  include_music: boolean;
  music_volume: number;
  include_narration: boolean;
  output_video_path?: string;
  output_video_url?: string;
  file_size_bytes?: number;
  actual_duration?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  price: number;
  price_formatted: string;
  property_type: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  area_unit?: string;
  key_features: string[];
  description?: string;
  agent_name?: string;
  agent_phone?: string;
  website_url?: string;
  cta_text: string;
  status: 'draft' | 'script_ready' | 'storyboard_ready' | 'rendered';
  created_at: string;
  updated_at: string;
  images: ImageItem[];
  script?: ScriptData | null;
  storyboard: StoryboardScene[];
  latest_render?: RenderJob | null;
}

export interface DashboardStats {
  total_projects: number;
  completed_videos: number;
  videos_this_week: number;
  total_storage_mb: number;
  ffmpeg_available: boolean;
}
