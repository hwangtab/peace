import { NextPageContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface ErrorProps {
  statusCode?: number;
}

const messages: Record<string, { error500: string; errorDefault: string; home: string }> = {
  ko: {
    error500: '예상치 못한 오류가 발생했습니다.',
    errorDefault: '서버에서 오류가 발생했습니다.',
    home: '홈으로',
  },
  ja: {
    error500: '予期しないエラーが発生しました。',
    errorDefault: 'サーバーでエラーが発生しました。',
    home: 'ホームへ',
  },
  'zh-Hans': { error500: '发生了意外错误。', errorDefault: '服务器发生错误。', home: '返回首页' },
  'zh-Hant': { error500: '發生了意外錯誤。', errorDefault: '伺服器發生錯誤。', home: '返回首頁' },
  en: {
    error500: 'An unexpected error occurred.',
    errorDefault: 'An error occurred on server.',
    home: 'Go Home',
  },
  es: {
    error500: 'Se produjo un error inesperado.',
    errorDefault: 'Error en el servidor.',
    home: 'Inicio',
  },
  fr: {
    error500: 'Une erreur inattendue est survenue.',
    errorDefault: 'Erreur serveur.',
    home: 'Accueil',
  },
  de: {
    error500: 'Ein unerwarteter Fehler ist aufgetreten.',
    errorDefault: 'Serverfehler.',
    home: 'Startseite',
  },
  pt: {
    error500: 'Ocorreu um erro inesperado.',
    errorDefault: 'Erro no servidor.',
    home: 'Início',
  },
  ru: {
    error500: 'Произошла непредвиденная ошибка.',
    errorDefault: 'Ошибка сервера.',
    home: 'Главная',
  },
  ar: { error500: 'حدث خطأ غير متوقع.', errorDefault: 'حدث خطأ في الخادم.', home: 'الرئيسية' },
  hi: { error500: 'एक अप्रत्याशित त्रुटि हुई।', errorDefault: 'सर्वर पर त्रुटि हुई।', home: 'होम' },
  id: {
    error500: 'Terjadi kesalahan tak terduga.',
    errorDefault: 'Terjadi kesalahan server.',
    home: 'Beranda',
  },
};
const defaultMsg = messages.en as NonNullable<(typeof messages)[string]>;

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
        <h1 className="text-6xl font-bold text-jeju-ocean mb-4">{statusCode || 'Error'}</h1>
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

ErrorPage.getInitialProps = (ctx: NextPageContext) => {
  const { res, err } = ctx;
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  // D1 — SSR/렌더 중 발생한 에러를 서버 로그(Vercel 함수 로그)에 남긴다.
  // 기존엔 statusCode 만 뽑고 err 를 버려 프로덕션에서 원인 추적이 불가능했다.
  // 서버 사이드에서만 로깅(클라이언트 런타임 에러는 _app 의 전역 핸들러가 수집).
  if (err && typeof window === 'undefined') {
    console.error(
      '[_error]',
      JSON.stringify({
        statusCode,
        message: err.message,
        stack: err.stack,
        url: ctx.asPath,
        at: new Date().toISOString(),
      })
    );
  }
  return { statusCode };
};

export default ErrorPage;
