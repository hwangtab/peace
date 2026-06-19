import Head from 'next/head';
import type { ReactNode } from 'react';

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
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
        <h1 className="mb-6 font-display text-3xl font-bold text-deep-ocean">{title}</h1>
        <div className="rounded border border-deep-ocean/10 bg-white p-6 shadow-sm">{children}</div>
        {footer && <div className="mt-4 text-center text-sm text-coastal-gray">{footer}</div>}
      </div>
    </>
  );
}
