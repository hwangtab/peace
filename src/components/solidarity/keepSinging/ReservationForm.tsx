import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import CopyButton from '@/components/common/CopyButton';
import { DarkButton, DarkCard, DarkSection, FlagRule, Reveal, SectionHeading } from './DarkUI';
import { CheckboxField, FormAlert, TextField } from './FormFields';
import {
  ACCOUNT_TEXT,
  MAX_QUANTITY,
  MIN_QUANTITY,
  TICKET_PRICE,
  formatAmount,
  formatPhone,
  isValidPhone,
} from './constants';

interface SuccessState {
  quantity: number;
  amount: number;
}

interface FieldErrors {
  name?: string;
  phone?: string;
  deposit?: string;
  privacy?: string;
}

/**
 * 예매 신청 폼.
 *
 * 제출은 POST /api/solidarity/reservations 하나뿐이고, 성공하면 폼 자리를 성공 카드로
 * 교체한다. 409(중복)는 폼을 유지한 채 예매 확인 앵커로 안내한다.
 */
const ReservationForm: React.FC = () => {
  const { t, i18n } = useTranslation('concert_ksfp_2026');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(MIN_QUANTITY);
  const [depositAgreed, setDepositAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<React.ReactNode>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  const locale = i18n.language || 'ko';
  const total = useMemo(() => quantity * TICKET_PRICE, [quantity]);

  const handlePhoneChange = useCallback((value: string) => {
    setPhone(formatPhone(value));
  }, []);

  const reset = useCallback(() => {
    setSuccess(null);
    setName('');
    setPhone('');
    setQuantity(MIN_QUANTITY);
    setDepositAgreed(false);
    setPrivacyAgreed(false);
    setErrors({});
    setFormError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (submitting) return;

      const nextErrors: FieldErrors = {};
      if (!name.trim()) nextErrors.name = t('form.error_name');
      if (!isValidPhone(phone)) nextErrors.phone = t('form.error_phone');
      if (!depositAgreed) nextErrors.deposit = t('form.error_deposit');
      if (!privacyAgreed) nextErrors.privacy = t('form.error_privacy');
      setErrors(nextErrors);
      setFormError(null);
      if (Object.keys(nextErrors).length > 0) return;

      setSubmitting(true);
      try {
        const res = await fetch('/api/solidarity/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            phone,
            quantity,
            privacyAgreed: true,
            depositAgreed: true,
          }),
        });

        if (res.status === 201) {
          const data = (await res.json()) as { quantity?: number; amount?: number };
          setSuccess({
            quantity: data.quantity ?? quantity,
            amount: data.amount ?? quantity * TICKET_PRICE,
          });
          return;
        }

        if (res.status === 409) {
          setFormError(
            <>
              {t('form.error_duplicate')}{' '}
              <a href="#lookup" className="font-semibold underline underline-offset-4">
                {t('form.goto_lookup')}
              </a>
            </>
          );
          return;
        }

        if (res.status === 429) {
          setFormError(t('form.error_rate_limit'));
          return;
        }

        setFormError(t('form.error_generic'));
      } catch {
        setFormError(t('form.error_generic'));
      } finally {
        // 실패 경로에서도 반드시 풀어 준다 — 버튼이 영구 비활성으로 굳는 것을 막는다.
        setSubmitting(false);
      }
    },
    [submitting, name, phone, quantity, depositAgreed, privacyAgreed, t]
  );

  return (
    <DarkSection id="reservation" width="prose" ariaLabelledby="ksfp-form-heading">
      <SectionHeading
        id="ksfp-form-heading"
        eyebrow={t('form.eyebrow')}
        heading={t('form.heading')}
        subheading={success ? undefined : t('form.subheading')}
      />

      <Reveal>
        {success ? (
          <DarkCard className="border-[#007A3D]/50">
            <p className="font-serif text-2xl text-[#F5F1EA] md:text-3xl">
              {t('form.success_title')}
            </p>
            <FlagRule className="my-6" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9C958B]">
              {t('form.success_amount_label')}
            </p>
            <p className="mt-2 font-serif text-4xl text-[#F5F1EA] md:text-5xl">
              {formatAmount(success.amount, locale)}
            </p>
            <p className="mt-1 text-sm text-[#9C958B]">
              {t('form.success_quantity', { count: success.quantity })}
            </p>

            <div className="mt-7 rounded-lg border border-[#F5F1EA]/15 bg-[#0f0f0f] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9C958B]">
                {t('form.account_label')}
              </p>
              <p className="mt-2 break-words font-medium text-[#F5F1EA]">{ACCOUNT_TEXT}</p>
              <CopyButton
                text={ACCOUNT_TEXT}
                label={t('support.copy')}
                copiedLabel={t('support.copied')}
                className="mt-4 !bg-[#F5F1EA] !text-[#0a0a0a] hover:!bg-white"
              />
            </div>

            <p className="mt-6 text-sm leading-relaxed text-[#D7D1C7]">{t('form.success_guide')}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <DarkButton variant="outline" size="sm" onClick={reset}>
                {t('form.success_reset')}
              </DarkButton>
            </div>
          </DarkCard>
        ) : (
          <DarkCard>
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <TextField
                id="ksfp-name"
                label={t('form.name_label')}
                value={name}
                onChange={setName}
                placeholder={t('form.name_placeholder')}
                autoComplete="name"
                maxLength={40}
                error={errors.name}
                disabled={submitting}
              />

              <TextField
                id="ksfp-phone"
                label={t('form.phone_label')}
                value={phone}
                onChange={handlePhoneChange}
                placeholder={t('form.phone_placeholder')}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={13}
                error={errors.phone}
                disabled={submitting}
              />

              {/* 매수 스텝퍼 + 총액 */}
              <div>
                <span className="mb-2 block text-sm font-medium text-[#D7D1C7]">
                  {t('form.quantity_label')}
                </span>
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#F5F1EA]/18 bg-[#0f0f0f] px-4 py-3">
                  <div className="flex items-center gap-4">
                    <DarkButton
                      variant="outline"
                      size="sm"
                      className="!h-9 !w-9 !px-0 text-lg"
                      ariaLabel={t('form.quantity_decrease')}
                      disabled={submitting || quantity <= MIN_QUANTITY}
                      onClick={() => setQuantity((q) => Math.max(MIN_QUANTITY, q - 1))}
                    >
                      <span aria-hidden="true">−</span>
                    </DarkButton>
                    <output
                      aria-live="polite"
                      className="min-w-[2ch] text-center font-serif text-2xl text-[#F5F1EA]"
                    >
                      {quantity}
                    </output>
                    <DarkButton
                      variant="outline"
                      size="sm"
                      className="!h-9 !w-9 !px-0 text-lg"
                      ariaLabel={t('form.quantity_increase')}
                      disabled={submitting || quantity >= MAX_QUANTITY}
                      onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
                    >
                      <span aria-hidden="true">+</span>
                    </DarkButton>
                  </div>
                  <div className="text-right">
                    <span className="block text-[11px] uppercase tracking-[0.2em] text-[#9C958B]">
                      {t('form.total_label')}
                    </span>
                    <span className="font-serif text-2xl text-[#F5F1EA]">
                      {formatAmount(total, locale)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-[#F5F1EA]/12 pt-6">
                <CheckboxField
                  id="ksfp-deposit"
                  checked={depositAgreed}
                  onChange={setDepositAgreed}
                  label={t('form.deposit_agree')}
                  error={errors.deposit}
                  disabled={submitting}
                />

                <CheckboxField
                  id="ksfp-privacy"
                  checked={privacyAgreed}
                  onChange={setPrivacyAgreed}
                  label={t('form.privacy_agree')}
                  error={errors.privacy}
                  disabled={submitting}
                >
                  <button
                    type="button"
                    onClick={() => setPrivacyOpen((v) => !v)}
                    aria-expanded={privacyOpen}
                    aria-controls="ksfp-privacy-detail"
                    className="ms-7 mt-2 text-xs text-[#9C958B] underline underline-offset-4 hover:text-[#F5F1EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F1EA]/60"
                  >
                    {t('form.privacy_toggle')}
                  </button>
                  <ul
                    id="ksfp-privacy-detail"
                    hidden={!privacyOpen}
                    className="ms-7 mt-3 space-y-1.5 rounded-lg border border-[#F5F1EA]/12 bg-[#0f0f0f] p-4 text-xs leading-relaxed text-[#9C958B]"
                  >
                    {(
                      [
                        'form.privacy_detail_1',
                        'form.privacy_detail_2',
                        'form.privacy_detail_3',
                        'form.privacy_detail_4',
                      ] as const
                    ).map((key) => (
                      <li key={key}>{t(key)}</li>
                    ))}
                  </ul>
                </CheckboxField>
              </div>

              {formError && <FormAlert>{formError}</FormAlert>}

              <DarkButton type="submit" fullWidth disabled={submitting}>
                {submitting ? t('form.submitting') : t('form.submit')}
              </DarkButton>
            </form>
          </DarkCard>
        )}
      </Reveal>
    </DarkSection>
  );
};

export default ReservationForm;
