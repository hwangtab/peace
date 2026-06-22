import Head from 'next/head';
import type { ReactNode } from 'react';
import PageHero from '@/components/common/PageHero';

const AUTH_HERO_IMAGE = '/images-webp/camps/2023/DSC00437.webp';

export default function AuthFormShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <>
      <Head>
        <title>{title} | PEACE</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <PageHero compact title={title} backgroundImage={AUTH_HERO_IMAGE} />
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded border border-deep-ocean/10 bg-white p-6 shadow-sm">{children}</div>
        {footer && <div className="mt-4 text-center text-sm text-coastal-gray">{footer}</div>}
      </div>
    </>
  );
}
