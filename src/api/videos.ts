import { fetchLocalizedData } from './client';
import { fetchArchiveItems } from './archive';
import { VideoItem } from '../types/video';

/**
 * Fetches video data from JSON file.
 * This approach reduces the main bundle size by loading data on-demand.
 */
export const getVideos = async (language?: string) => {
  const cmsItems = await fetchArchiveItems<VideoItem>('videos', language);
  return (
    cmsItems ?? fetchLocalizedData<VideoItem>('/data/videos.json', language, { mergeByIdKey: 'id' })
  );
};
