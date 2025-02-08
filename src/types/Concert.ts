export interface Concert {
  id: string;
  title: string;
  date: string;
  venue: string;
  description: string;
  coverImage: string;
  setList?: string[];
  performers?: string[];
  images?: string[];
}
