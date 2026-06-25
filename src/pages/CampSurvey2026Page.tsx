import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'next-i18next';
import PageLayout from '@/components/layout/PageLayout';
import PageHero from '@/components/common/PageHero';
import Section from '@/components/layout/Section';
import Container from '@/components/layout/Container';
import Button from '@/components/common/Button';
import { supabase } from '@/lib/supabase';
import {
  SURVEY_SECTIONS,
  CONSENT_OPTIONS,
  ROLE_OPTIONS,
  RATING_VALUES,
  buildInitialSurveyRatings,
  buildInitialSurveyTexts,
  buildSurveyInsertPayload,
  isQuestionVisible,
  type RatingQuestion,
  type SurveyConsents,
  type SurveyInsertPayload,
  type TextQuestion,
} from '@/data/campSurvey2026';

const HERO_IMAGE = '/images-webp/camps/2023/DSC00437.webp';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

const inputClass =
  'w-full rounded-lg border border-seafoam bg-white px-4 py-3 text-deep-ocean placeholder:text-coastal-gray/60 focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/30';

/* ------------------------------------------------------------------ *
 * 척도(1~5) 입력 위젯 — 한 번 더 누르면 선택 해제(미응답 허용).
 * ------------------------------------------------------------------ */
const RatingField: React.FC<{
  q: RatingQuestion & { i18nLabel?: string; i18nMinLabel?: string; i18nMaxLabel?: string };
  value: number | null;
  onChange: (v: number) => void;
}> = ({ q, value, onChange }) => {
  const label = q.i18nLabel ?? q.label;
  const minLabel = q.i18nMinLabel ?? q.minLabel;
  const maxLabel = q.i18nMaxLabel ?? q.maxLabel;
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="block font-medium text-deep-ocean mb-3">{label}</legend>
      <div className="flex items-center gap-2 sm:gap-3" role="radiogroup" aria-label={label}>
        {RATING_VALUES.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            onClick={() => onChange(v)}
            className={classNames(
              'flex h-11 w-11 items-center justify-center rounded-full border-2 font-semibold transition sm:h-12 sm:w-12',
              value === v
                ? 'border-jeju-ocean bg-jeju-ocean text-white shadow-md'
                : 'border-seafoam bg-white text-coastal-gray hover:border-ocean-mist'
            )}
          >
            {v}
          </button>
        ))}
      </div>
      {(minLabel || maxLabel) && (
        <div className="mt-2 flex max-w-[19rem] justify-between text-xs text-coastal-gray sm:max-w-[20.5rem]">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </fieldset>
  );
};

const TextField: React.FC<{
  q: TextQuestion & { i18nLabel?: string; i18nPlaceholder?: string };
  value: string;
  onChange: (v: string) => void;
}> = ({ q, value, onChange }) => {
  const label = q.i18nLabel ?? q.label;
  const placeholder = q.i18nPlaceholder ?? q.placeholder;
  return (
    <div>
      <label htmlFor={q.key} className="mb-2 block font-medium text-deep-ocean">
        {label}
      </label>
      <textarea
        id={q.key}
        value={value}
        rows={q.rows ?? 3}
        maxLength={q.maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={classNames(inputClass, 'resize-y')}
      />
      <div className="mt-1 text-right text-xs text-coastal-gray">
        {value.length}/{q.maxLength}
      </div>
    </div>
  );
};

const CampSurvey2026Page: React.FC = () => {
  const { t } = useTranslation(['camp_survey_2026', 'translation']);

  const s = useCallback((key: string) => t(`camp_survey_2026.${key}`) as string, [t]);

  const [name, setName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [ratings, setRatings] = useState(buildInitialSurveyRatings);
  const [texts, setTexts] = useState(buildInitialSurveyTexts);
  const [consents, setConsents] = useState<SurveyConsents>({
    consent_quote_named: false,
    consent_quote_anon: false,
    consent_photo: false,
  });
  const [website, setWebsite] = useState(''); // honeypot — 사람에겐 숨겨진 필드
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const toggleRole = (key: string) =>
    setRoles((prev) => (prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]));

  const setRating = (key: string, v: number) =>
    setRatings((prev) => ({ ...prev, [key]: prev[key] === v ? null : v }));
  const setText = (key: string, v: string) => setTexts((prev) => ({ ...prev, [key]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    // 봇이 honeypot 을 채우면 조용히 성공 처리(저장하지 않음).
    if (website.trim()) {
      setStatus('success');
      return;
    }
    if (!name.trim()) {
      setErrorMsg(s('error_name_required'));
      return;
    }
    if (!privacyConsent) {
      setErrorMsg(s('error_privacy_required'));
      return;
    }
    if (!supabase) {
      setStatus('error');
      setErrorMsg(s('error_server_missing'));
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const payload = buildSurveyInsertPayload({
        respondentName: name,
        contactInstagram: instagram,
        contactEmail: email,
        contactPhone: phone,
        privacyConsent,
        roles,
        ratings,
        texts,
        consents,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      });
      const surveyTable = supabase.from('camp_survey_responses') as unknown as {
        insert: (values: SurveyInsertPayload) => Promise<{ error: { message: string } | null }>;
      };
      const { error } = await surveyTable.insert(payload);

      if (!error) {
        setStatus('success');
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    } catch {
      setStatus('error');
      setErrorMsg(s('error_submit_failed'));
      return;
    }

    setStatus('error');
    setErrorMsg(s('error_submit_failed'));
  };

  // 척도 라벨 번역 맵 (저장 값인 key는 건드리지 않음; 표시 라벨만 치환)
  const ratingLabelMap: Record<string, string> = {
    overall_rating: s('q_overall_rating'),
    recommend_rating: s('q_recommend_rating'),
    stage_sound_rating: s('q_stage_sound_rating'),
    timetable_rating: s('q_timetable_rating'),
    lodging_rating: s('q_lodging_rating'),
    meals_rating: s('q_meals_rating'),
    transport_rating: s('q_transport_rating'),
    staff_comm_rating: s('q_staff_comm_rating'),
    pre_comm_rating: s('q_pre_comm_rating'),
    genderneutral_restroom_rating: s('q_genderneutral_restroom_rating'),
    open_access_rating: s('q_open_access_rating'),
    peace_comfort_rating: s('q_peace_comfort_rating'),
    peace_attitude_rating: s('q_peace_attitude_rating'),
    peace_empathy_rating: s('q_peace_empathy_rating'),
    rejoin_rating: s('q_rejoin_rating'),
  };

  // 텍스트 질문 번역 맵
  const textLabelMap: Record<string, { label: string; placeholder?: string }> = {
    best_moment: { label: s('q_best_moment'), placeholder: s('placeholder_best_moment') },
    improvement: { label: s('q_improvement'), placeholder: s('placeholder_improvement') },
    suggestion: { label: s('q_suggestion') },
    genderneutral_restroom_comment: { label: s('q_genderneutral_restroom_comment') },
    open_access_comment: { label: s('q_open_access_comment') },
    peace_reflection: { label: s('q_peace_reflection') },
    recommend_musicians: {
      label: s('q_recommend_musicians'),
      placeholder: s('placeholder_recommend_musicians'),
    },
    one_line_intro: {
      label: s('q_one_line_intro'),
      placeholder: s('placeholder_one_line_intro'),
    },
    last_words: { label: s('q_last_words') },
  };

  // 섹션 번역 맵
  const sectionLabelMap: Record<string, { title: string; description?: string }> = {
    overall: { title: s('section_overall') },
    operation: { title: s('section_operation'), description: s('section_operation_desc') },
    open: { title: s('section_open'), description: s('section_open_desc') },
    peace: { title: s('section_peace'), description: s('section_peace_desc') },
    next: { title: s('section_next') },
  };

  // 척도 min/max 번역
  const satisfactionScale = {
    minLabel: s('scale_min_satisfaction'),
    maxLabel: s('scale_max_satisfaction'),
  };
  const agreementScale = {
    minLabel: s('scale_min_agreement'),
    maxLabel: s('scale_max_agreement'),
  };
  const scaleByKey: Record<string, { minLabel: string; maxLabel: string }> = {
    overall_rating: satisfactionScale,
    stage_sound_rating: satisfactionScale,
    timetable_rating: satisfactionScale,
    lodging_rating: satisfactionScale,
    meals_rating: satisfactionScale,
    transport_rating: satisfactionScale,
    staff_comm_rating: satisfactionScale,
    pre_comm_rating: satisfactionScale,
    genderneutral_restroom_rating: satisfactionScale,
    open_access_rating: satisfactionScale,
    recommend_rating: agreementScale,
    peace_comfort_rating: agreementScale,
    peace_attitude_rating: agreementScale,
    peace_empathy_rating: agreementScale,
    rejoin_rating: agreementScale,
  };

  // 역할 라벨 번역 맵 (key는 저장 값이므로 그대로 유지)
  const roleLabelMap: Record<string, string> = {
    musician: s('role_musician'),
    staff: s('role_staff'),
    audience: s('role_audience'),
    seller: s('role_seller'),
  };

  // 동의 라벨 번역 맵 (key는 DB 컬럼명 — 저장 값이므로 그대로 유지)
  const consentLabelMap: Record<string, string> = {
    consent_quote_named: s('consent_quote_named_label'),
    consent_quote_anon: s('consent_quote_anon_label'),
    consent_photo: s('consent_photo_label'),
  };

  if (status === 'success') {
    return (
      <PageLayout noIndex title={s('success_page_title')} background="ocean-sand">
        <Section>
          <Container size="content">
            <div className="py-16 text-center">
              <div className="mb-6 text-5xl">🌊</div>
              <h1 className="mb-4 font-display text-3xl font-bold text-deep-ocean">
                {s('success_heading')}
              </h1>
              <p className="mx-auto mb-8 max-w-md leading-relaxed text-balance text-coastal-gray">
                {s('success_body')}
              </p>
              <Button to="/camps/2026" variant="primary">
                {s('success_btn_back')}
              </Button>
            </div>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      noIndex
      title={s('page_title')}
      description={s('seo_description')}
      background="ocean-sand"
      disableTopPadding
    >
      <PageHero
        title={s('page_hero_title')}
        subtitle={s('page_hero_subtitle')}
        backgroundImage={HERO_IMAGE}
      />
      <Section background="white" paddingTop="loose" paddingBottom="loose">
        <Container size="content">
          <p className="mb-10 leading-relaxed text-coastal-gray">{s('intro')}</p>

          <form onSubmit={handleSubmit} className="space-y-12" noValidate>
            {/* 기본 정보 */}
            <section>
              <h2 className="mb-5 font-display text-2xl font-bold text-deep-ocean">
                {s('section_basic_info')}
              </h2>
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="respondent_name"
                    className="mb-2 block font-medium text-deep-ocean"
                  >
                    {s('label_name')}{' '}
                    <span className="text-sunset-coral">{s('label_name_required')}</span>
                  </label>
                  <input
                    id="respondent_name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                    className={inputClass}
                    placeholder={s('placeholder_name')}
                  />
                </div>
                <fieldset className="border-0 p-0 m-0">
                  <legend className="mb-2 block font-medium text-deep-ocean">
                    {s('label_role')}
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {ROLE_OPTIONS.map((r) => {
                      const active = roles.includes(r.key);
                      return (
                        <button
                          key={r.key}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggleRole(r.key)}
                          className={classNames(
                            'rounded-full border-2 px-5 py-2 text-sm font-medium transition',
                            active
                              ? 'border-jeju-ocean bg-jeju-ocean text-white shadow-md'
                              : 'border-seafoam bg-white text-coastal-gray hover:border-ocean-mist'
                          )}
                        >
                          {roleLabelMap[r.key] ?? r.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <div>
                  <span className="mb-1 block font-medium text-deep-ocean">
                    {s('label_contact')}
                  </span>
                  <p className="mb-3 text-sm text-coastal-gray">{s('contact_hint')}</p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      maxLength={200}
                      className={inputClass}
                      placeholder={s('placeholder_instagram')}
                      aria-label={s('aria_instagram')}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={200}
                      className={inputClass}
                      placeholder={s('placeholder_email')}
                      aria-label={s('aria_email')}
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={50}
                      className={inputClass}
                      placeholder={s('placeholder_phone')}
                      aria-label={s('aria_phone')}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* honeypot — 화면에 보이지 않음. 봇 차단용. */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">홈페이지 (입력하지 마세요)</label>
              <input
                id="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {/* 설문 섹션 — 응답자 유형(roles)에 맞는 문항만 노출. 빈 섹션은 숨김. */}
            {SURVEY_SECTIONS.map((section) => {
              const visibleRatings = section.ratings.filter((q) => isQuestionVisible(q, roles));
              const visibleTexts = section.texts.filter((q) => isQuestionVisible(q, roles));
              if (visibleRatings.length === 0 && visibleTexts.length === 0) return null;
              const sectionI18n = sectionLabelMap[section.id];
              return (
                <section key={section.id}>
                  <h2 className="mb-2 font-display text-2xl font-bold text-deep-ocean">
                    {sectionI18n?.title ?? section.title}
                  </h2>
                  {(sectionI18n?.description ?? section.description) && (
                    <p className="mb-5 text-sm text-coastal-gray">
                      {sectionI18n?.description ?? section.description}
                    </p>
                  )}
                  <div className="space-y-7">
                    {visibleRatings.map((q) => (
                      <RatingField
                        key={q.key}
                        q={{
                          ...q,
                          i18nLabel: ratingLabelMap[q.key],
                          ...(scaleByKey[q.key] ?? {}),
                        }}
                        value={ratings[q.key] ?? null}
                        onChange={(v) => setRating(q.key, v)}
                      />
                    ))}
                    {visibleTexts.map((q) => (
                      <TextField
                        key={q.key}
                        q={{
                          ...q,
                          i18nLabel: textLabelMap[q.key]?.label,
                          i18nPlaceholder: textLabelMap[q.key]?.placeholder,
                        }}
                        value={texts[q.key] ?? ''}
                        onChange={(v) => setText(q.key, v)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {/* 후기/사진 활용 동의 */}
            <section>
              <h2 className="mb-5 font-display text-2xl font-bold text-deep-ocean">
                {s('section_consent_optional')}
              </h2>
              <div className="space-y-3">
                {CONSENT_OPTIONS.map((c) => (
                  <label key={c.key} className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={consents[c.key]}
                      onChange={(e) =>
                        setConsents((prev) => ({ ...prev, [c.key]: e.target.checked }))
                      }
                      className="mt-1 h-5 w-5 flex-shrink-0 rounded border-seafoam text-jeju-ocean focus:ring-jeju-ocean/30"
                    />
                    <span className="text-deep-ocean">{consentLabelMap[c.key] ?? c.label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* 개인정보 수집·이용 동의 (필수) */}
            <section>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-seafoam bg-white p-4">
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  className="mt-1 h-5 w-5 flex-shrink-0 rounded border-seafoam text-jeju-ocean focus:ring-jeju-ocean/30"
                />
                <span className="text-sm leading-relaxed text-deep-ocean">
                  <strong className="text-sunset-coral">
                    {s('privacy_consent_required_mark')}
                  </strong>{' '}
                  {s('privacy_consent_text')}{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-medium text-jeju-ocean underline"
                  >
                    {s('privacy_policy_link')}
                  </a>
                </span>
              </label>
            </section>

            {errorMsg && (
              <p className="rounded-lg bg-sunset-coral/10 px-4 py-3 text-sunset-coral">
                {errorMsg}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? s('btn_submitting') : s('btn_submit')}
            </Button>
          </form>
        </Container>
      </Section>
    </PageLayout>
  );
};

export default CampSurvey2026Page;
