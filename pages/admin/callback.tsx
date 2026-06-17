import type { GetServerSideProps } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const getAdminNextPath = (value: string | string[] | undefined) => {
  const next = typeof value === 'string' ? value : '/admin';
  return next.startsWith('/admin') ? next : '/admin';
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const code = typeof context.query.code === 'string' ? context.query.code : null;
  const next = getAdminNextPath(context.query.next);

  if (!code) {
    return {
      redirect: {
        destination: '/admin/login?error=missing_code',
        permanent: false,
      },
    };
  }

  try {
    const supabase = createSupabaseServerClient(context.req, context.res);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return {
        redirect: {
          destination: next,
          permanent: false,
        },
      };
    }
  } catch {
    // Admin routes intentionally fail closed when Supabase is not configured.
  }

  return {
    redirect: {
      destination: '/admin/login?error=auth_callback_failed',
      permanent: false,
    },
  };
};

export default function AdminCallbackPage() {
  return null;
}
