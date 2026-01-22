import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/common/Button';

const NotFoundPage = () => {
    return (
        <PageLayout title="페이지를 찾을 수 없습니다" description="요청하신 페이지가 존재하지 않습니다.">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h1 className="text-6xl font-serif text-jeju-ocean mb-6">404</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">페이지를 찾을 수 없습니다</h2>
                <p className="text-gray-600 mb-8 max-w-md">
                    죄송합니다. 요청하신 페이지가 삭제되었거나 이름이 변경되었거나 일시적으로 사용할 수 없습니다.
                </p>
                <Link to="/">
                    <Button variant="primary">홈으로 돌아가기</Button>
                </Link>
            </div>
        </PageLayout>
    );
};

export default NotFoundPage;
