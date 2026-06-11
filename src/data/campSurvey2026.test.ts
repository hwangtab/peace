import {
  ALL_RATING_KEYS,
  ALL_TEXT_KEYS,
  CONSENT_OPTIONS,
  buildInitialSurveyRatings,
  buildInitialSurveyTexts,
  buildSurveyInsertPayload,
} from './campSurvey2026';

describe('campSurvey2026 payload mapping', () => {
  test('initial form state follows every declared survey column key', () => {
    expect(Object.keys(buildInitialSurveyRatings()).sort()).toEqual([...ALL_RATING_KEYS].sort());
    expect(Object.values(buildInitialSurveyRatings())).toEqual(ALL_RATING_KEYS.map(() => null));

    expect(Object.keys(buildInitialSurveyTexts()).sort()).toEqual([...ALL_TEXT_KEYS].sort());
    expect(Object.values(buildInitialSurveyTexts())).toEqual(ALL_TEXT_KEYS.map(() => ''));
  });

  test('insert payload includes only declared dynamic keys and normalized metadata', () => {
    const ratings = {
      ...buildInitialSurveyRatings(),
      overall_rating: 5,
      recommend_rating: 9,
      unknown_rating: 3,
    };
    const texts = {
      ...buildInitialSurveyTexts(),
      best_moment: '  바닷바람과 무대  ',
      improvement: '   ',
      unknown_text: '저장되면 안 됨',
    };
    const consents = Object.fromEntries(CONSENT_OPTIONS.map(({ key }) => [key, false])) as Record<
      (typeof CONSENT_OPTIONS)[number]['key'],
      boolean
    >;

    const payload = buildSurveyInsertPayload({
      respondentName: '  테스트 팀  ',
      contactInstagram: '  @peace  ',
      contactEmail: '  ',
      contactPhone: '  010-0000-0000  ',
      privacyConsent: true,
      roles: ['musician', 'staff'],
      ratings,
      texts,
      consents: { ...consents, consent_quote_anon: true },
      userAgent: 'vitest',
    });

    expect(payload).toMatchObject({
      camp_edition: 3,
      respondent_name: '테스트 팀',
      contact_instagram: '@peace',
      contact_email: null,
      contact_phone: '010-0000-0000',
      consent_privacy: true,
      respondent_roles: ['musician', 'staff'],
      overall_rating: 5,
      recommend_rating: null,
      best_moment: '바닷바람과 무대',
      improvement: null,
      consent_quote_named: false,
      consent_quote_anon: true,
      consent_photo: false,
      locale: 'ko',
      user_agent: 'vitest',
    });
    expect(payload).not.toHaveProperty('unknown_rating');
    expect(payload).not.toHaveProperty('unknown_text');
  });

  test('text payload is clamped to each question max length', () => {
    const payload = buildSurveyInsertPayload({
      respondentName: '테스트',
      contactInstagram: '',
      contactEmail: '',
      contactPhone: '',
      privacyConsent: true,
      roles: [],
      ratings: buildInitialSurveyRatings(),
      texts: {
        ...buildInitialSurveyTexts(),
        one_line_intro: '가'.repeat(500),
      },
      consents: Object.fromEntries(CONSENT_OPTIONS.map(({ key }) => [key, false])) as Record<
        (typeof CONSENT_OPTIONS)[number]['key'],
        boolean
      >,
      userAgent: null,
    });

    expect(String(payload.one_line_intro)).toHaveLength(300);
  });
});
