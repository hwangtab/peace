import React, { useState } from 'react';
import classNames from 'classnames';
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
  type RatingQuestion,
  type SurveyConsents,
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
  q: RatingQuestion;
  value: number | null;
  onChange: (v: number) => void;
}> = ({ q, value, onChange }) => (
  <fieldset className="border-0 p-0 m-0">
    <legend className="block font-medium text-deep-ocean mb-3">{q.label}</legend>
    <div className="flex items-center gap-2 sm:gap-3" role="radiogroup" aria-label={q.label}>
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
    {(q.minLabel || q.maxLabel) && (
      <div className="mt-2 flex max-w-[19rem] justify-between text-xs text-coastal-gray sm:max-w-[20.5rem]">
        <span>{q.minLabel}</span>
        <span>{q.maxLabel}</span>
      </div>
    )}
  </fieldset>
);

const TextField: React.FC<{
  q: TextQuestion;
  value: string;
  onChange: (v: string) => void;
}> = ({ q, value, onChange }) => (
  <div>
    <label htmlFor={q.key} className="mb-2 block font-medium text-deep-ocean">
      {q.label}
    </label>
    <textarea
      id={q.key}
      value={value}
      rows={q.rows ?? 3}
      maxLength={q.maxLength}
      placeholder={q.placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={classNames(inputClass, 'resize-y')}
    />
    <div className="mt-1 text-right text-xs text-coastal-gray">
      {value.length}/{q.maxLength}
    </div>
  </div>
);

const CampSurvey2026Page: React.FC = () => {
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
      setErrorMsg('이름(또는 팀명)을 입력해 주세요.');
      return;
    }
    if (!privacyConsent) {
      setErrorMsg('개인정보 수집·이용에 동의해 주셔야 제출할 수 있습니다.');
      return;
    }
    if (!supabase) {
      setStatus('error');
      setErrorMsg('설문 서버 설정이 누락되었습니다. 운영진에게 알려 주세요.');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    const { error } = await supabase.from('camp_survey_responses').insert({
      ...buildSurveyInsertPayload({
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
      }),
    });

    if (error) {
      setStatus('error');
      setErrorMsg('제출 중 문제가 발생했어요. 잠시 후 다시 시도하거나 운영진에게 알려 주세요.');
      return;
    }

    setStatus('success');
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (status === 'success') {
    return (
      <PageLayout noIndex title="고맙습니다 — 함께 돌아보는 강정" background="ocean-sand">
        <Section>
          <Container size="content">
            <div className="py-16 text-center">
              <div className="mb-6 text-5xl">🌊</div>
              <h1 className="mb-4 font-display text-3xl font-bold text-deep-ocean">고맙습니다!</h1>
              <p className="mx-auto mb-8 max-w-md leading-relaxed text-coastal-gray">
                소중한 회고가 잘 전달되었습니다. 여러분이 들려준 이야기로 제4회 캠프를 더 단단하게
                준비하겠습니다. 노래하자, 춤추자, 전쟁을 끝내자.
              </p>
              <Button to="/camps/2026" variant="primary">
                캠프 페이지로 돌아가기
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
      title="함께 돌아보는 강정 — 제3회 강정 피스앤뮤직캠프"
      description="제3회 강정 피스앤뮤직캠프에 함께한 모든 분의 회고를 듣습니다."
      background="ocean-sand"
      disableTopPadding
    >
      <PageHero
        title="함께 돌아보는 강정"
        subtitle="제3회 강정 피스앤뮤직캠프, 사흘의 기억을 들려주세요"
        backgroundImage={HERO_IMAGE}
      />
      <Section background="white" paddingTop="loose" paddingBottom="loose">
        <Container size="content">
          <p className="mb-10 leading-relaxed text-coastal-gray">
            강정에서 사흘을 함께한 여러분께. 무대 위에서, 객석에서, 마켓 부스에서, 그리고 보이지
            않는 곳에서 이 캠프를 함께 만들어주셔서 고맙습니다. 더 단단한 4회차를 준비하기 위해 짧은
            회고를 부탁드립니다. 약 8분이면 충분하고, 솔직한 의견일수록 큰 힘이 됩니다. 응답은
            운영진만 확인하며, 후기·사진 공개는 맨 아래에서 따로 동의받습니다.
          </p>

          <form onSubmit={handleSubmit} className="space-y-12" noValidate>
            {/* 기본 정보 */}
            <section>
              <h2 className="mb-5 font-display text-2xl font-bold text-deep-ocean">기본 정보</h2>
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="respondent_name"
                    className="mb-2 block font-medium text-deep-ocean"
                  >
                    활동명(팀명) 또는 본명 <span className="text-sunset-coral">*</span>
                  </label>
                  <input
                    id="respondent_name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                    className={inputClass}
                    placeholder="예) 강정바람밴드 / 홍길동"
                  />
                </div>
                <fieldset className="border-0 p-0 m-0">
                  <legend className="mb-2 block font-medium text-deep-ocean">
                    어떤 자격으로 함께하셨나요? (중복 선택 가능)
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
                          {r.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
                <div>
                  <span className="mb-1 block font-medium text-deep-ocean">
                    다음에도 연락드릴 채널 (선택)
                  </span>
                  <p className="mb-3 text-sm text-coastal-gray">
                    편한 채널 하나만 적어주셔도 됩니다.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      maxLength={200}
                      className={inputClass}
                      placeholder="인스타그램 @아이디"
                      aria-label="인스타그램 아이디"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={200}
                      className={inputClass}
                      placeholder="이메일"
                      aria-label="이메일"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={50}
                      className={inputClass}
                      placeholder="전화번호"
                      aria-label="전화번호"
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

            {/* 설문 섹션 */}
            {SURVEY_SECTIONS.map((section) => (
              <section key={section.id}>
                <h2 className="mb-2 font-display text-2xl font-bold text-deep-ocean">
                  {section.title}
                </h2>
                {section.description && (
                  <p className="mb-5 text-sm text-coastal-gray">{section.description}</p>
                )}
                <div className="space-y-7">
                  {section.ratings.map((q) => (
                    <RatingField
                      key={q.key}
                      q={q}
                      value={ratings[q.key] ?? null}
                      onChange={(v) => setRating(q.key, v)}
                    />
                  ))}
                  {section.texts.map((q) => (
                    <TextField
                      key={q.key}
                      q={q}
                      value={texts[q.key] ?? ''}
                      onChange={(v) => setText(q.key, v)}
                    />
                  ))}
                </div>
              </section>
            ))}

            {/* 후기/사진 활용 동의 */}
            <section>
              <h2 className="mb-5 font-display text-2xl font-bold text-deep-ocean">
                후기·사진 활용 동의 (선택)
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
                    <span className="text-deep-ocean">{c.label}</span>
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
                  <strong className="text-sunset-coral">(필수)</strong> 이름과 연락처 등 입력한
                  개인정보를 설문 분석과 다음 회차 안내 목적으로 수집·이용하는 데 동의합니다. 응답은
                  운영진만 열람하며, 목적을 다한 뒤 파기합니다.
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
              {status === 'submitting' ? '제출 중…' : '설문 제출하기'}
            </Button>
          </form>
        </Container>
      </Section>
    </PageLayout>
  );
};

export default CampSurvey2026Page;
