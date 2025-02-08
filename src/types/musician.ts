export interface Musician {
  id: number;
  name: string;
  shortDescription: string;
  description: string;
  genre: string[];
  trackTitle: string;
  imageUrl: string;
  instagramUrls: string[];
}

export type Musicians = Musician[];
