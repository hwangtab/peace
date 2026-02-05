import React from 'react';
import { useTranslation } from 'next-i18next';
import { FallbackProps } from 'react-error-boundary';
import Button from './Button';
import Section from '../layout/Section';

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
    const { t } = useTranslation();
    return (
        <Section background="light-beige" className="min-h-screen flex items-center justify-center">
            <div className="text-center max-w-lg mx-auto px-4">
                <h2 className="font-display text-2xl md:text-3xl text-jeju-ocean mb-4">
                    {t('common.error_title')}
                </h2>
                <p className="font-serif text-coastal-gray mb-8 whitespace-pre-line">
                    {t('common.error_message')}
                </p>

                <div className="bg-white p-6 rounded-lg shadow-sm mb-8 text-left overflow-auto max-h-48 border border-gray-100">
                    <p className="font-mono text-xs text-red-500 break-words">
                        {error.message}
                    </p>
                </div>

                <div className="flex justify-center space-x-4">
                    <Button onClick={resetErrorBoundary} variant="primary">
                        {t('common.retry')}
                    </Button>
                    <Button onClick={() => window.location.href = '/'} variant="outline">
                        {t('common.go_home')}
                    </Button>
                </div>
            </div>
        </Section>
    );
};

export default ErrorFallback;
