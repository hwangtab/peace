import React from 'react';
import { FallbackProps } from 'react-error-boundary';
import Button from './Button';
import Section from '../layout/Section';

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
    return (
        <Section background="light-beige" className="min-h-screen flex items-center justify-center">
            <div className="text-center max-w-lg mx-auto px-4">
                <h2 className="font-display text-2xl md:text-3xl text-jeju-ocean mb-4">
                    앗, 잠시 문제가 발생했어요.
                </h2>
                <p className="font-serif text-coastal-gray mb-8">
                    죄송합니다. 예상치 못한 오류가 발생하여 페이지를 표시할 수 없습니다.<br />
                    잠시 후 다시 시도해 주세요.
                </p>

                <div className="bg-white p-6 rounded-lg shadow-sm mb-8 text-left overflow-auto max-h-48 border border-gray-100">
                    <p className="font-mono text-xs text-red-500 break-words">
                        {error.message}
                    </p>
                </div>

                <div className="flex justify-center space-x-4">
                    <Button onClick={resetErrorBoundary} variant="primary">
                        다시 시도하기
                    </Button>
                    <Button onClick={() => window.location.href = '/'} variant="outline">
                        홈으로 이동
                    </Button>
                </div>
            </div>
        </Section>
    );
};

export default ErrorFallback;
