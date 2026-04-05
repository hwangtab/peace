import { NextPageContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';

interface ErrorProps {
  statusCode?: number;
}

function ErrorPage({ statusCode }: ErrorProps) {
  return (
    <>
      <Head>
        <title>{statusCode || 'Error'} | Peace and Music</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-cloud-white">
        <h1 className="text-6xl font-bold text-jeju-ocean mb-4">
          {statusCode || 'Error'}
        </h1>
        <p className="text-xl text-coastal-gray mb-8">
          {statusCode === 500
            ? 'An unexpected error occurred.'
            : `An error ${statusCode} occurred on server.`}
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-jeju-ocean text-white rounded-lg hover:bg-ocean-mist transition-colors"
        >
          Go Home
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
