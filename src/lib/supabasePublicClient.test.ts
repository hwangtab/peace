describe('getSupabasePublicClient', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns null when public Supabase config is missing', async () => {
    jest.doMock('./supabaseConfig', () => ({
      getSupabasePublicConfig: () => null,
    }));

    const { getSupabasePublicClient } = await import('./supabasePublicClient');

    expect(getSupabasePublicClient()).toBeNull();
  });

  it('creates one cached public client with session persistence disabled', async () => {
    const createClient = jest.fn(() => ({ from: jest.fn() }));
    jest.doMock('@supabase/supabase-js', () => ({ createClient }));
    jest.doMock('./supabaseConfig', () => ({
      getSupabasePublicConfig: () => ({
        url: 'https://example.supabase.co',
        anonKey: 'anon-key',
      }),
    }));

    const { getSupabasePublicClient } = await import('./supabasePublicClient');
    const first = getSupabasePublicClient();
    const second = getSupabasePublicClient();

    expect(first).toBe(second);
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith('https://example.supabase.co', 'anon-key', {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  });
});
