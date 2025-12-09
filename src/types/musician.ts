export interface Musician {
  id: number;
  name: string;
  shortDescription: string;
  description: string;
  genre: string[];
  trackTitle: string;
  imageUrl: string;
  instagramUrls: string[];
  events?: string[]; // Array of event IDs (e.g., 'camp-2023', 'camp-2025', 'album-2024')
}

export type Musicians = Musician[];
