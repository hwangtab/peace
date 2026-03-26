import { Musician } from '@/types/musician';
import { Track } from '@/types/track';
import { buildTrackMusicianRelation } from './trackMusician';

const createTrack = (overrides: Partial<Track>): Track => ({
  id: 0,
  title: '',
  artist: '',
  duration: '0:00',
  description: '',
  audioUrl: '',
  credits: {
    personnel: [],
  },
  ...overrides,
});

const createMusician = (overrides: Partial<Musician>): Musician => ({
  id: 0,
  name: '',
  shortDescription: '',
  description: '',
  genre: [],
  trackTitle: '',
  imageUrl: '',
  instagramUrls: [],
  ...overrides,
});

describe('buildTrackMusicianRelation', () => {
  test('prefers unique artist-name relation when track title is duplicated', () => {
    const tracks: Track[] = [
      createTrack({ id: 8, title: 'Heart in Front of My Eyes', artist: 'Leaves' }),
    ];

    const musicians: Musician[] = [
      createMusician({ id: 8, name: 'Leaves', trackTitle: 'Heart in Front of My Eyes' }),
      createMusician({ id: 38, name: 'Yeoul', trackTitle: 'Heart in Front of My Eyes' }),
    ];

    const relation = buildTrackMusicianRelation(tracks, musicians);

    expect(relation.musicianByTrackId.get(8)?.id).toBe(8);
  });

  test('supports matching by artist name when trackTitle does not match', () => {
    const tracks: Track[] = [createTrack({ id: 13, title: 'Unknown', artist: 'MoredoSaturday' })];

    const musicians: Musician[] = [
      createMusician({
        id: 7,
        name: 'MoredoSaturday',
        trackTitle: 'We will sail for your freedom',
      }),
    ];

    const relation = buildTrackMusicianRelation(tracks, musicians);

    expect(relation.musicianByTrackId.get(13)?.id).toBe(7);
    expect(relation.trackByMusicianId.get(7)?.id).toBe(13);
  });
});
