import React, { ReactNode } from 'react';
import classNames from 'classnames';
import { m as motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';

/**
 * Keep Singing for Palestine 페이지 전용 다크 UI 조각들.
 *
 * 사이트 공통 팔레트(제주 바다색)는 이 페이지의 검정 배경에서 대비가 나오지 않아
 * 공용 Button/Section 대신 페이지 로컬 스타일을 쓴다. 다른 페이지에서 재사용하지 않는다.
 */

/** 섹션 등장 애니메이션 래퍼 — 전 섹션이 같은 리듬을 갖도록 한 군데로 모은다. */
export const Reveal: React.FC<{
  children: ReactNode;
  className?: string;
  delayIndex?: number;
}> = ({ children, className, delayIndex = 0 }) => {
  const { viewport, itemTransition, reduce } = useScrollReveal();
  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={itemTransition(delayIndex)}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * 섹션 껍데기 — 세로 리듬과 최대폭을 통일한다.
 *
 * 본문 폭을 좁히는 `prose`/`prose-center` 는 안쪽 블록을 max-w-3xl 로 줄이고 **가운데
 * 정렬**한다 — 왼쪽에 붙이면 오른쪽 여백만 200px 남아 좌우가 기울어 보인다. 둘의 차이는
 * 블록 위치가 아니라 안쪽 텍스트 정렬(`prose-center` 는 제목·본문도 가운데)뿐이다.
 */
export const DarkSection: React.FC<{
  id?: string;
  children: ReactNode;
  className?: string;
  width?: 'prose' | 'prose-center' | 'content' | 'wide';
  ariaLabelledby?: string;
}> = ({ id, children, className, width = 'content', ariaLabelledby }) => {
  const narrow = width === 'prose' || width === 'prose-center';
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledby}
      className={classNames('relative py-16 md:py-24', className)}
    >
      <div
        className={classNames('mx-auto w-full px-5 sm:px-6 lg:px-8', {
          'max-w-5xl': width !== 'wide',
          'max-w-6xl': width === 'wide',
        })}
      >
        {narrow ? <div className="mx-auto max-w-3xl">{children}</div> : children}
      </div>
    </section>
  );
};

/*
 * 빨강 두 톤: 면·테두리·그라디언트에는 국기 빨강 #CE1126 을 그대로 쓰고,
 * eyebrow 같은 작은 글자에는 #E2566B 를 쓴다 — 원색은 #0a0a0a 위에서 대비가
 * 3:1 아래로 떨어져 작은 글자가 읽히지 않는다.
 */

/** 국기 4색 그라디언트 얇은 선 — 섹션 구분·이미지 테두리에 쓴다. */
export const FlagRule: React.FC<{ className?: string }> = ({ className }) => (
  <div
    aria-hidden="true"
    className={classNames('h-px w-full', className)}
    style={{
      background:
        'linear-gradient(90deg, rgba(206,17,38,0) 0%, #CE1126 22%, #F5F1EA 50%, #007A3D 78%, rgba(0,122,61,0) 100%)',
      opacity: 0.55,
    }}
  />
);

/** 섹션 머리말(eyebrow + heading). */
export const SectionHeading: React.FC<{
  eyebrow?: string;
  heading: string;
  subheading?: string;
  id?: string;
  align?: 'start' | 'center';
}> = ({ eyebrow, heading, subheading, id, align = 'start' }) => (
  <Reveal className={classNames('mb-10 md:mb-14', align === 'center' && 'text-center')}>
    {eyebrow && (
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#E2566B]">
        {eyebrow}
      </p>
    )}
    <h2
      id={id}
      className="font-serif text-3xl leading-tight text-[#F5F1EA] md:text-4xl [text-wrap:balance]"
    >
      {heading}
    </h2>
    {subheading && (
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#9C958B] md:text-base">
        {subheading}
      </p>
    )}
  </Reveal>
);

type DarkButtonProps = {
  children: ReactNode;
  variant?: 'solid' | 'outline' | 'quiet';
  size?: 'sm' | 'md';
  className?: string;
  fullWidth?: boolean;
};

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] focus-visible:ring-[#F5F1EA] disabled:cursor-not-allowed disabled:opacity-50';

const buttonVariants = {
  solid: 'bg-[#F5F1EA] text-[#0a0a0a] hover:bg-white',
  outline:
    'border border-[#F5F1EA]/35 text-[#F5F1EA] hover:border-[#F5F1EA]/70 hover:bg-[#F5F1EA]/10',
  quiet: 'border border-[#007A3D]/60 text-[#F5F1EA] hover:bg-[#007A3D]/20',
} as const;

const buttonSizes = { sm: 'px-5 py-2 text-sm', md: 'px-7 py-3 text-base' } as const;

function darkButtonClass({
  variant = 'solid',
  size = 'md',
  fullWidth,
  className,
}: Omit<DarkButtonProps, 'children'>) {
  return classNames(
    buttonBase,
    buttonVariants[variant],
    buttonSizes[size],
    fullWidth && 'w-full',
    className
  );
}

/** 앵커/외부 링크용 다크 버튼. */
export const DarkLinkButton: React.FC<DarkButtonProps & { href: string; external?: boolean }> = ({
  children,
  href,
  external,
  ...rest
}) => (
  <a
    href={href}
    className={darkButtonClass(rest)}
    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
  >
    {children}
  </a>
);

/** 폼 제출용 다크 버튼. */
export const DarkButton: React.FC<
  DarkButtonProps & {
    type?: 'button' | 'submit';
    onClick?: () => void;
    disabled?: boolean;
    ariaLabel?: string;
  }
> = ({ children, type = 'button', onClick, disabled, ariaLabel, ...rest }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className={darkButtonClass(rest)}
  >
    {children}
  </button>
);

/** 어두운 배경 위 카드. */
export const DarkCard: React.FC<{ children: ReactNode; className?: string; id?: string }> = ({
  children,
  className,
  id,
}) => (
  <div
    id={id}
    className={classNames(
      'rounded-2xl border border-[#F5F1EA]/12 bg-[#141414] p-6 md:p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]',
      className
    )}
  >
    {children}
  </div>
);
