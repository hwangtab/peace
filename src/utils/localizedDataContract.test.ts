import { buildLocalizedDataCandidateKeys, mergeItemsByKey } from './localizedDataContract';

describe('localized data contract', () => {
  it('uses default Korean data as the single source for ko', () => {
    expect(buildLocalizedDataCandidateKeys('ko')).toEqual([null]);
  });

  it('resolves non-Korean data through locale, English, then default data', () => {
    expect(buildLocalizedDataCandidateKeys('es')).toEqual(['es', 'en', null]);
  });

  it('does not duplicate default data when English is the requested locale', () => {
    expect(buildLocalizedDataCandidateKeys('en')).toEqual(['en', null]);
  });

  it('keeps earlier localized items when merging by id', () => {
    const merged = mergeItemsByKey(
      [
        [{ id: 1, title: 'English title' }],
        [
          { id: 1, title: 'Korean title' },
          { id: 2, title: 'Korean only' },
        ],
      ],
      'id'
    );

    expect(merged).toEqual([
      { id: 1, title: 'English title' },
      { id: 2, title: 'Korean only' },
    ]);
  });
});
