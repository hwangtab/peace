export interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  description: string;
  lyrics?: string;
  audioUrl: string;
  credits: {
    composer?: string[];
    lyricist?: string[];
    arranger?: string[];
    personnel: {
      role: string;
      name: string[];
    }[];
  };
  imageUrl?: string;
}

export type Tracks = Track[];
