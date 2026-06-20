import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BATCH_SIZE = 100;

/**
 * Constant-time string comparison via SHA-256 hex digest.
 * Prevents timing-oracle attacks on the shared secret.
 */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [da, db] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  const ha = Array.from(new Uint8Array(da)).map(x => x.toString(16).padStart(2, '0')).join('');
  const hb = Array.from(new Uint8Array(db)).map(x => x.toString(16).padStart(2, '0')).join('');
  // hex strings are equal length — character-by-character OR to prevent short-circuit
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha.charCodeAt(i) ^ hb.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Fix 2: require POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Fix 2: shared-secret gate
  const secret = Deno.env.get('CLEANUP_CRON_SECRET');
  if (!secret) {
    console.error('cleanup-board-images: CLEANUP_CRON_SECRET env not set');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const incoming = req.headers.get('x-cleanup-secret') ?? '';
  const valid = await timingSafeEqual(incoming, secret);
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Fix 1+3: orphan detection entirely in Postgres via antijoin RPC —
    // no JS-side pagination, no consistency window, grace handled server-side.
    const { data: paths, error: rpcErr } = await supabase
      .rpc('orphan_board_image_paths', { grace_hours: 24 });

    if (rpcErr) {
      console.error('cleanup-board-images rpc error:', rpcErr.message);
      return new Response(JSON.stringify({ error: rpcErr.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const orphanPaths: string[] = (paths ?? []).map((r: { path: string }) => r.path);

    // Delete in batches of BATCH_SIZE
    let deleted = 0;
    for (let i = 0; i < orphanPaths.length; i += BATCH_SIZE) {
      const batch = orphanPaths.slice(i, i + BATCH_SIZE);
      const { error: delErr } = await supabase.storage
        .from('board-images')
        .remove(batch);

      if (delErr) {
        console.error(`Delete batch failed: ${delErr.message}`);
      } else {
        deleted += batch.length;
      }
    }

    const summary = { orphans: orphanPaths.length, deleted };
    console.log('cleanup-board-images:', JSON.stringify(summary));

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('cleanup-board-images error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
