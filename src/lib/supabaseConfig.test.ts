import { getSupabasePublicConfig } from './supabaseConfig';

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.NEXT_PUBLIC_REQUIRE_SUPABASE;
  delete process.env.VERCEL_ENV;
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

test('getSupabasePublicConfig allows missing config outside required production mode', () => {
  expect(getSupabasePublicConfig()).toBeNull();
});

test('getSupabasePublicConfig fails when Vercel production is missing CMS config', () => {
  process.env.VERCEL_ENV = 'production';

  expect(() => getSupabasePublicConfig()).toThrow('Supabase public configuration is missing');
});

test('getSupabasePublicConfig can be required explicitly outside Vercel production', () => {
  process.env.NEXT_PUBLIC_REQUIRE_SUPABASE = 'true';

  expect(() => getSupabasePublicConfig()).toThrow('Supabase public configuration is missing');
});
