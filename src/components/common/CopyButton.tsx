import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

interface CopyButtonProps {
  /** 클립보드에 복사할 텍스트 */
  text: string;
  /** 기본 버튼 라벨 (예: "복사하기") */
  label: string;
  /** 복사 직후 잠시 노출되는 라벨 (예: "복사됨!") */
  copiedLabel: string;
  className?: string;
}

/**
 * CopyButton — 텍스트를 클립보드에 복사하고 "복사됨!" 피드백을 잠시 보여준다.
 *
 * navigator.clipboard 를 우선 사용하고, 사용할 수 없는 환경에서는
 * 임시 textarea + execCommand('copy') 로 폴백한다.
 */
const CopyButton: React.FC<CopyButtonProps> = ({ text, label, copiedLabel, className }) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('clipboard API unavailable');
      }
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* 복사 실패 시 조용히 무시 — 사용자가 직접 선택해 복사할 수 있다 */
      }
      document.body.removeChild(ta);
    }

    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean focus-visible:ring-offset-2',
        copied ? 'bg-seafoam text-deep-ocean' : 'bg-jeju-ocean text-white hover:bg-deep-ocean',
        className,
      )}
    >
      <span aria-hidden="true">
        {copied ? (
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10.5l4 4 8-9" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="7" y="7" width="9" height="11" rx="2" />
            <path d="M13 4H6a2 2 0 0 0-2 2v8" />
          </svg>
        )}
      </span>
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
};

export default CopyButton;
