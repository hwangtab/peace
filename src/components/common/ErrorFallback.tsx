import React from 'react';
import { useTranslation } from 'next-i18next';
import { FallbackProps } from 'react-error-boundary';
import Button from './Button';
import Section from '../layout/Section';

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
    const { t } = useTranslation();
    const isDev = process.env.NODE_ENV !== 'production';

    // Log the raw error to the console so it's still discoverable in production,
    // but never surface internal messages to end users (can leak paths/tokens).
    React.useEffect(() => {
        // eslint-disable-next-line no-console
        console.error('[ErrorBoundary]', error);
    }, [error]);

    return (
        <Section background="light-beige" className="min-h-screen flex items-center justify-center">
            <div className="text-center max-w-lg mx-auto px-4">
                <h1 className="typo-h2 !text-jeju-ocean mb-4">
                    {t('common.error_title')}
                </h1>
                <p className="typo-body text-coastal-gray mb-8 whitespace-pre-line break-words">
                    {t('common.error_message')}
                </p>

                {isDev && (
                    <div className="bg-white p-6 rounded-lg shadow-sm mb-8 text-left overflow-auto max-h-48 border border-gray-100">
                        <p className="font-mono text-xs text-red-500 break-words">
                            {error.message}
                        </p>
                    </div>
                )}

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
