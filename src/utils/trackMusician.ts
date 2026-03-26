import { Musician } from '@/types/musician';
import { Track } from '@/types/track';

const normalizeKey = (value: string): string => value.trim().toLocaleLowerCase();

const setUniqueStringMatch = <T>(map: Map<string, T | null>, key: string, value: T): void => {
  const existing = map.get(key);

  if (existing === undefined) {
    map.set(key, value);
    return;
  }

  map.set(key, null);
};

const getUniqueStringMatch = <T>(map: Map<string, T | null>, key: string): T | undefined => {
  const value = map.get(key);
  return value === null ? undefined : value;
};

const setUniqueNumericMatch = <T>(map: Map<number, T | null>, key: number, value: T): void => {
  const existing = map.get(key);

  if (existing === undefined) {
    map.set(key, value);
    return;
  }

  map.set(key, null);
};

const getUniqueNumericMatch = <T>(map: Map<number, T | null>, key: number): T | undefined => {
  const value = map.get(key);
  return value === null ? undefined : value;
};

export interface TrackMusicianRelation {
  musicianByTrackId: Map<number, Musician>;
  trackByMusicianId: Map<number, Track>;
}

export const buildTrackMusicianRelation = (
  tracks: Track[],
  musicians: Musician[]
): TrackMusicianRelation => {
  const musicianById = new Map<number, Musician>();
  const musicianByTrackId = new Map<number, Musician | null>();
  const musicianByTrackTitle = new Map<string, Musician | null>();
  const musicianByName = new Map<string, Musician | null>();

  for (const musician of musicians) {
    musicianById.set(musician.id, musician);

    if (typeof musician.trackId === 'number') {
      setUniqueNumericMatch(musicianByTrackId, musician.trackId, musician);
    }

    if (musician.trackTitle) {
      setUniqueStringMatch(musicianByTrackTitle, normalizeKey(musician.trackTitle), musician);
    }

    setUniqueStringMatch(musicianByName, normalizeKey(musician.name), musician);
  }

  const relationByTrackId = new Map<number, Musician>();
  const trackByMusicianId = new Map<number, Track>();

  for (const track of tracks) {
    const relation =
      (typeof track.musicianId === 'number' ? musicianById.get(track.musicianId) : undefined) ??
      getUniqueNumericMatch(musicianByTrackId, track.id) ??
      getUniqueStringMatch(musicianByName, normalizeKey(track.artist)) ??
      getUniqueStringMatch(musicianByTrackTitle, normalizeKey(track.title));

    if (!relation) {
      continue;
    }

    relationByTrackId.set(track.id, relation);

    if (!trackByMusicianId.has(relation.id)) {
      trackByMusicianId.set(relation.id, track);
    }
  }

  return {
    musicianByTrackId: relationByTrackId,
    trackByMusicianId,
  };
};
