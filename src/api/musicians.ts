import { Musician } from '../types/musician';

/**
 * Fetches musicians data from JSON file.
 * This approach reduces the main bundle size by loading data on-demand.
 */
export const getMusicians = async (): Promise<Musician[]> => {
    try {
        const response = await fetch('/data/musicians.json');
        if (!response.ok) {
            console.warn(`Failed to fetch musicians.json: ${response.status}`);
            return [];
        }

        const text = await response.text();
        try {
            return JSON.parse(text) as Musician[];
        } catch (parseError) {
            console.error('JSON parse error for musicians:', parseError);
            return [];
        }
    } catch (fetchError) {
        console.error('Fetch error for musicians:', fetchError);
        return [];
    }
};
