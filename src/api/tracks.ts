import { fetchLocalizedData } from './client';
import { Track } from '../types/track';

/**
 * Fetches track data from JSON file.
 * This approach reduces the main bundle size by loading tracks data on-demand.
 */
export const getTracks = (language?: string) =>
  fetchLocalizedData<Track>('/data/tracks.json', language);
