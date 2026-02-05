import { fetchLocalizedData } from './client';
import { VideoItem } from '../types/video';

/**
 * Fetches video data from JSON file.
 * This approach reduces the main bundle size by loading data on-demand.
 */
export const getVideos = (language?: string) =>
  fetchLocalizedData<VideoItem>('/data/videos.json', language);
