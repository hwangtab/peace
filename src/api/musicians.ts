import { fetchLocalData } from './client';
import { Musician } from '../types/musician';

/**
 * Fetches musicians data from JSON file.
 * This approach reduces the main bundle size by loading data on-demand.
 */
export const getMusicians = () => fetchLocalData<Musician>('/data/musicians.json');
