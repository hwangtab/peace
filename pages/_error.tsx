import { NextPageContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface ErrorProps {
  statusCode?: number;
}

const messages: Record<string, { error500: string; errorDefault: string; home: string }> = {
  ko: { error500: '예상치 못한 오류가 발생했습니다.', errorDefault: '서버에서 오류가 발생했습니다.', home: '홈으로' },
  ja: { error500: '予期しないエラーが発生しました。', errorDefault: 'サーバーでエラーが発生しました。', home: 'ホームへ' },
  zh: { error500: '发生了意外错误。', errorDefault: '服务器发生错误。', home: '返回首页' },
};
const defaultMsg = { error500: 'An unexpected error occurred.', errorDefault: 'An error occurred on server.', home: 'Go Home' };

function ErrorPage({ statusCode }: ErrorProps) {
  const router = useRouter();
  const locale = router.locale || 'en';
  const msg = messages[locale] ?? defaultMsg;

  return (
    <>
      <Head>
        <title>{statusCode || 'Error'} | Peace and Music</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-cloud-white">
        <h1 className="text-6xl font-bold text-jeju-ocean mb-4">
          {statusCode || 'Error'}
        </h1>
        <p className="text-xl text-coastal-gray mb-8">
          {statusCode === 500 ? msg.error500 : msg.errorDefault}
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-jeju-ocean text-white rounded-lg hover:bg-ocean-mist transition-colors"
        >
          {msg.home}
        </Link>
      </div>
    </>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
