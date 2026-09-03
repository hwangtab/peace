import React, { useCallback, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { DarkButton, DarkCard, DarkSection, Reveal, SectionHeading } from './DarkUI';
import { FormAlert, TextField } from './FormFields';
import { formatPhone, isValidPhone } from './constants';

type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

interface LookupResult {
  status: ReservationStatus;
  quantity: number;
  createdAt: string;
}

const STATUS_STYLE: Record<ReservationStatus, string> = {
  pending: 'border-[#F5F1EA]/25 text-[#F5F1EA]',
  confirmed: 'border-[#007A3D] text-[#7FD8A6]',
  cancelled: 'border-[#CE1126]/60 text-[#F19aa4]',
};

/** 이름 + 연락처로 자기 예매 상태를 조회한다. */
const ReservationLookup: React.FC = () => {
  const { t, i18n } = useTranslation('concert_ksfp_2026');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (loading) return;

      const nErr = name.trim() ? undefined : t('form.error_name');
      const pErr = isValidPhone(phone) ? undefined : t('form.error_phone');
      setNameError(nErr);
      setPhoneError(pErr);
      setFormError(null);
      setResult(null);
      if (nErr || pErr) return;

      setLoading(true);
      try {
        const res = await fetch('/api/solidarity/reservations/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), phone }),
        });

        if (res.ok) {
          setResult((await res.json()) as LookupResult);
          return;
        }
        if (res.status === 404) {
          setFormError(t('lookup.error_not_found'));
          return;
        }
        if (res.status === 429) {
          setFormError(t('lookup.error_rate_limit'));
          return;
        }
        setFormError(t('lookup.error_generic'));
      } catch {
        setFormError(t('lookup.error_generic'));
      } finally {
        setLoading(false);
      }
    },
    [loading, name, phone, t]
  );

  const formatCreatedAt = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    try {
      return new Intl.DateTimeFormat(i18n.language || 'ko', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
    } catch {
      return d.toISOString();
    }
  };

  return (
    <DarkSection id="lookup" width="prose-center" ariaLabelledby="ksfp-lookup-heading">
      <SectionHeading
        id="ksfp-lookup-heading"
        eyebrow={t('lookup.eyebrow')}
        heading={t('lookup.heading')}
        subheading={t('lookup.subheading')}
        align="center"
      />

      <Reveal>
        <DarkCard>
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <TextField
              id="ksfp-lookup-name"
              label={t('form.name_label')}
              value={name}
              onChange={setName}
              placeholder={t('form.name_placeholder')}
              autoComplete="name"
              maxLength={40}
              error={nameError}
              disabled={loading}
            />
            <TextField
              id="ksfp-lookup-phone"
              label={t('form.phone_label')}
              value={phone}
              onChange={(v) => setPhone(formatPhone(v))}
              placeholder={t('form.phone_placeholder')}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={13}
              error={phoneError}
              disabled={loading}
            />

            {formError && <FormAlert>{formError}</FormAlert>}

            <DarkButton type="submit" fullWidth variant="outline" disabled={loading}>
              {loading ? t('lookup.submitting') : t('lookup.submit')}
            </DarkButton>
          </form>

          {result && (
            <div
              aria-live="polite"
              className={`mt-6 rounded-lg border bg-[#0f0f0f] p-5 ${STATUS_STYLE[result.status]}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9C958B]">
                {t('lookup.status_label')}
              </p>
              <p className="mt-2 font-serif text-2xl md:text-3xl">
                {t(`lookup.status_${result.status}`)}
              </p>
              <p className="mt-2 text-sm text-[#D7D1C7]">
                {t(`lookup.status_${result.status}_desc`)}
              </p>
              <dl className="mt-5 grid gap-3 text-sm text-[#D7D1C7] sm:grid-cols-2">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-[#9C958B]">
                    {t('lookup.quantity_label')}
                  </dt>
                  <dd className="mt-1">{result.quantity}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.2em] text-[#9C958B]">
                    {t('lookup.created_label')}
                  </dt>
                  <dd className="mt-1">{formatCreatedAt(result.createdAt)}</dd>
                </div>
              </dl>
            </div>
          )}
        </DarkCard>
      </Reveal>
    </DarkSection>
  );
};

export default ReservationLookup;
