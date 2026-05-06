import React from 'react';

// react-icons (fa/hi/io5) 의 barrel import 가 _app 번들에 ~22KiB 를 끌어와서 첫 페인트
// JS 페이로드를 키웠다 (node_modules/react-icons/{fa,io5}/index.mjs 가 sideEffects:false 임에도
// 4800줄 단일 파일이라 webpack tree-shake 가 부분적으로만 동작). 사용 중인 9개 아이콘을
// inline SVG 컴포넌트로 옮겨 패키지 의존성 자체를 제거하기 위한 파일.
//
// SVG path 는 react-icons 원본(MIT 라이선스, https://github.com/react-icons/react-icons)에서
// 그대로 가져왔다. heroicons v1 (Hi prefix) / ionicons (Io prefix) 셋의 path 데이터.

type IconProps = Omit<React.SVGProps<SVGSVGElement>, 'children'> & { className?: string };

interface HiInternalProps extends IconProps {
  paths: readonly string[];
}

const Hi: React.FC<HiInternalProps> = ({ className = 'w-6 h-6', paths, ...rest }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    aria-hidden="true"
    {...rest}
  >
    {paths.map((path, i) => (
      <path key={i} strokeLinecap="round" strokeLinejoin="round" d={path} />
    ))}
  </svg>
);

export const HiOutlineMenu: React.FC<IconProps> = (p) => <Hi {...p} paths={['M4 6h16M4 12h16M4 18h16']} />;
export const HiOutlineX: React.FC<IconProps> = (p) => <Hi {...p} paths={['M6 18L18 6M6 6l12 12']} />;
export const HiOutlineMail: React.FC<IconProps> = (p) => (
  <Hi {...p} paths={['M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z']} />
);
export const HiOutlineCalendar: React.FC<IconProps> = (p) => (
  <Hi {...p} paths={['M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z']} />
);
export const HiOutlineLocationMarker: React.FC<IconProps> = (p) => (
  <Hi
    {...p}
    paths={[
      'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
      'M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    ]}
  />
);
export const HiOutlineUserGroup: React.FC<IconProps> = (p) => (
  <Hi
    {...p}
    paths={['M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z']}
  />
);

export const IoChevronDown: React.FC<IconProps> = ({ className = 'w-6 h-6', ...rest }) => (
  <svg className={className} viewBox="0 0 512 512" aria-hidden="true" {...rest}>
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={48}
      d="m112 184 144 144 144-144"
    />
  </svg>
);
