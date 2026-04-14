import React from 'react';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import Button from '@/components/common/Button';

import { useTranslation } from 'next-i18next';
// ...

const NotFoundPage = () => {
    const { t } = useTranslation();

    const suggestedLinks = [
        { label: t('nav.gallery'), href: '/gallery' },
        { label: t('nav.camp_2026'), href: '/camps/2026' },
        { label: t('nav.album'), href: '/album/about' },
        { label: t('nav.press'), href: '/press' },
    ];

    return (
        <PageLayout title={t('notFound.title')} description={t('notFound.desc')} noIndex>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h1 className="text-6xl font-serif text-jeju-ocean mb-6">404</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('notFound.title')}</h2>
                <p className="text-gray-600 mb-8 max-w-md break-words">
                    {t('notFound.message')}
                </p>
                <Button to="/" variant="primary">{t('notFound.homeButton')}</Button>
                <nav aria-label="Suggested pages" className="mt-10">
                    <ul className="flex flex-wrap justify-center gap-3">
                        {suggestedLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="px-4 py-2 rounded-full border border-coastal-gray/30 text-sm text-coastal-gray hover:text-jeju-ocean hover:border-jeju-ocean transition-colors"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </PageLayout>
    );
};

export default NotFoundPage;
