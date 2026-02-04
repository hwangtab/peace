import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/common/Button';

import { useTranslation } from 'react-i18next';
// ...

const NotFoundPage = () => {
    const { t } = useTranslation();

    return (
        <PageLayout title={t('notFound.title')} description={t('notFound.desc')}>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h1 className="text-6xl font-serif text-jeju-ocean mb-6">404</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('notFound.title')}</h2>
                <p className="text-gray-600 mb-8 max-w-md">
                    {t('notFound.message')}
                </p>
                <Link to="/">
                    <Button variant="primary">{t('notFound.homeButton')}</Button>
                </Link>
            </div>
        </PageLayout>
    );
};

export default NotFoundPage;
