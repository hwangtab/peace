import React from 'react';
import classNames from 'classnames';

/**
 * 예매 폼과 예매 확인 폼이 공유하는 다크 입력 필드.
 * 두 폼이 같은 시각 언어를 갖도록 한 곳에 모았다.
 */

const inputClass =
  'w-full rounded-lg border bg-[#0f0f0f] px-4 py-3 text-[#F5F1EA] placeholder:text-[#6d675f] focus:outline-none focus:ring-2 focus:ring-[#F5F1EA]/60 transition-colors';

export const TextField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  type?: 'text' | 'tel';
  autoComplete?: string;
  inputMode?: 'text' | 'tel';
  disabled?: boolean;
  maxLength?: number;
}> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  type = 'text',
  autoComplete,
  inputMode,
  disabled,
  maxLength,
}) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-sm font-medium text-[#D7D1C7]">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      inputMode={inputMode}
      disabled={disabled}
      maxLength={maxLength}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={classNames(
        inputClass,
        error ? 'border-[#CE1126]' : 'border-[#F5F1EA]/18 hover:border-[#F5F1EA]/35',
        disabled && 'opacity-60'
      )}
    />
    {error && (
      <p id={`${id}-error`} className="mt-2 text-sm text-[#F19aa4]">
        {error}
      </p>
    )}
  </div>
);

export const CheckboxField: React.FC<{
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  error?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}> = ({ id, checked, onChange, label, error, disabled, children }) => (
  <div>
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[#007A3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F1EA]/60"
      />
      <label htmlFor={id} className="cursor-pointer text-sm leading-relaxed text-[#D7D1C7]">
        {label}
      </label>
    </div>
    {children}
    {error && (
      <p id={`${id}-error`} className="mt-2 text-sm text-[#F19aa4]">
        {error}
      </p>
    )}
  </div>
);

/** 폼 전체에 걸린 오류(서버 응답 등)를 보여주는 배너. */
export const FormAlert: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    role="alert"
    className="rounded-lg border border-[#CE1126]/60 bg-[#CE1126]/10 px-4 py-3 text-sm leading-relaxed text-[#F5DADE]"
  >
    {children}
  </div>
);
