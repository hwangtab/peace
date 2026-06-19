import type { GetServerSideProps } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { safeRedirectPath } from '@/lib/memberAuth';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const code = typeof context.query.code === 'string' ? context.query.code : null;
  const next = safeRedirectPath(context.query.next);

  if (!code) {
    return { redirect: { destination: '/login?error=confirm_failed', permanent: false } };
  }

  try {
    const supabase = createSupabaseServerClient(context.req, context.res);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return { redirect: { destination: next, permanent: false } };
    }
  } catch {
    // fall through to error redirect
  }

  return { redirect: { destination: '/login?error=confirm_failed', permanent: false } };
};

export default function AuthConfirmPage() {
  return null;
}
