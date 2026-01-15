import { Track } from '../types/track';

/**
 * Fetches track data from JSON file.
 * This approach reduces the main bundle size by loading tracks data on-demand.
 */
export const getTracks = async (): Promise<Track[]> => {
    try {
        const response = await fetch('/data/tracks.json');
        if (!response.ok) {
            console.warn(`Failed to fetch tracks.json: ${response.status}`);
            return [];
        }

        const text = await response.text();
        try {
            return JSON.parse(text) as Track[];
        } catch (parseError) {
            console.error('JSON parse error for tracks:', parseError);
            return [];
        }
    } catch (fetchError) {
        console.error('Fetch error for tracks:', fetchError);
        return [];
    }
};
