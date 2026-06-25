import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminApi } from '@/lib/adminAuth';
import { createSupabaseServiceClient } from '@/lib/supabaseService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const session = await requireAdminApi(req, res);
  if (!session) return;

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from('admin_members')
    .update({ notifications_seen_at: new Date().toISOString() })
    .eq('id', session.member.id);

  if (error) {
    console.error('[notifications/seen] update failed:', error.message);
    return res.status(500).json({ error: 'update_failed' });
  }

  return res.status(200).json({ ok: true });
}
