import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GRACE_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours
const BATCH_SIZE = 100;

Deno.serve(async (_req: Request): Promise<Response> => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Step 1: List all objects in board-images bucket.
    // Objects live under per-user folders: <uid>/<file>
    // First list top-level "folders" (prefixes), then list files inside each.
    const allObjects: { path: string; created_at: string }[] = [];

    // List top-level entries (user folders appear as items with name ending in '/')
    // Supabase storage list without prefix returns root-level items.
    const { data: rootItems, error: rootErr } = await supabase.storage
      .from('board-images')
      .list('', { limit: 1000 });

    if (rootErr) throw new Error(`List root failed: ${rootErr.message}`);

    for (const item of rootItems ?? []) {
      if (!item.id) {
        // This is a folder prefix — list its contents
        const { data: folderItems, error: folderErr } = await supabase.storage
          .from('board-images')
          .list(item.name, { limit: 1000 });

        if (folderErr) {
          console.error(`List folder ${item.name} failed: ${folderErr.message}`);
          continue;
        }

        for (const file of folderItems ?? []) {
          if (file.id) {
            // Actual file
            allObjects.push({
              path: `${item.name}/${file.name}`,
              created_at: file.created_at ?? '',
            });
          }
        }
      } else {
        // Root-level file (uncommon but handle it)
        allObjects.push({
          path: item.name,
          created_at: item.created_at ?? '',
        });
      }
    }

    // Step 2: Fetch all referenced image_url values from post_images
    const { data: rows, error: dbErr } = await supabase
      .from('post_images')
      .select('image_url');

    if (dbErr) throw new Error(`DB query failed: ${dbErr.message}`);

    // Convert image_url to storage path: everything after '/board-images/'
    const referencedPaths = new Set<string>();
    for (const row of rows ?? []) {
      const url: string = row.image_url ?? '';
      const marker = '/board-images/';
      const idx = url.indexOf(marker);
      if (idx !== -1) {
        referencedPaths.add(url.slice(idx + marker.length));
      }
    }

    // Step 3: Identify orphans (not referenced AND older than 24h)
    const now = Date.now();
    const orphanPaths: string[] = [];

    for (const obj of allObjects) {
      if (referencedPaths.has(obj.path)) continue;

      const age = obj.created_at ? now - new Date(obj.created_at).getTime() : Infinity;
      if (age >= GRACE_PERIOD_MS) {
        orphanPaths.push(obj.path);
      }
    }

    // Step 4: Delete orphans in batches of BATCH_SIZE
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

    const summary = {
      scanned: allObjects.length,
      orphans: orphanPaths.length,
      deleted,
    };

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
