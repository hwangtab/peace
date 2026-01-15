import { EventType } from '../types/event';

export interface VideoItem {
  id: number;
  title: string;
  description: string;
  youtubeUrl: string;
  date: string;
  location: string;
  eventType?: EventType;
  eventYear?: number;
  thumbnailUrl?: string;
}

/**
 * Fetches video data from JSON file.
 * This approach reduces the main bundle size by loading data on-demand.
 */
export const getVideos = async (): Promise<VideoItem[]> => {
  try {
    const response = await fetch('/data/videos.json');
    if (!response.ok) {
      console.warn(`Failed to fetch videos.json: ${response.status}`);
      return [];
    }

    const text = await response.text();
    try {
      return JSON.parse(text) as VideoItem[];
    } catch (parseError) {
      console.error('JSON parse error for videos:', parseError);
      return [];
    }
  } catch (fetchError) {
    console.error('Fetch error for videos:', fetchError);
    return [];
  }
};
