import { fetchLocalData } from './client';
import { VideoItem } from '../types/video';

/**
 * Fetches video data from JSON file.
 * This approach reduces the main bundle size by loading data on-demand.
 */
export const getVideos = () => fetchLocalData<VideoItem>('/data/videos.json');
