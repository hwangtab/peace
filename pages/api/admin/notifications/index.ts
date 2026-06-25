import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminRole } from '@/lib/adminAuth';
import { createSupabaseServiceClient } from '@/lib/supabaseService';
import {
  buildNotificationFeed,
  type RawComment,
  type RawInquiry,
  type RawPost,
  type RawSignup,
} from '@/lib/adminNotifications';

const PER_SOURCE = 15;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // 알림 피드는 인바운드 문의 발신자 이메일·가입자 정보 등 민감 데이터를 service role로
  // 모아 보여주므로 editor 이상으로 제한한다(viewer 노출 차단).
  const session = await requireAdminRole(req, res, 'editor');
  if (!session) return;

  res.setHeader('Cache-Control', 'no-store');

  const supabase = createSupabaseServiceClient();
  const seenAt = session.member.notifications_seen_at ?? null;

  const [inquiriesRes, postsRes, commentsRes, signupsRes] = await Promise.all([
    supabase
      .from('mailbox_messages')
      .select('id,subject,from_name,from_email,created_at')
      .eq('direction', 'inbound')
      .order('created_at', { ascending: false })
      .limit(PER_SOURCE),
    supabase
      .from('posts')
      .select('id,title,created_at,profiles!posts_author_id_fkey(nickname)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(PER_SOURCE),
    supabase
      .from('post_comments')
      .select('id,body,created_at,posts(title)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(PER_SOURCE),
    supabase
      .from('profiles')
      .select('id,nickname,created_at')
      .order('created_at', { ascending: false })
      .limit(PER_SOURCE),
  ]);

  // 한 소스가 실패해도 나머지는 보여준다.
  for (const [name, r] of Object.entries({
    inquiries: inquiriesRes,
    posts: postsRes,
    comments: commentsRes,
    signups: signupsRes,
  })) {
    if (r.error) console.error(`[notifications] ${name} query failed:`, r.error.message);
  }

  const feed = buildNotificationFeed(
    {
      inquiries: (inquiriesRes.data as RawInquiry[] | null) ?? [],
      posts: (postsRes.data as RawPost[] | null) ?? [],
      comments: (commentsRes.data as RawComment[] | null) ?? [],
      signups: (signupsRes.data as RawSignup[] | null) ?? [],
    },
    seenAt
  );

  return res.status(200).json(feed);
}
