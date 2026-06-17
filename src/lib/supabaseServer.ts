import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { IncomingMessage, ServerResponse } from 'http';
import { requireSupabasePublicConfig } from './supabaseConfig';

type RequestWithCookies = IncomingMessage & {
  cookies?: Partial<Record<string, string>>;
};

type CookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
  secure?: boolean;
};

const parseCookieHeader = (header?: string): Record<string, string> => {
  if (!header) return {};

  return header.split(';').reduce<Record<string, string>>((cookies, part) => {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (!rawName) return cookies;

    const value = rawValue.join('=');
    try {
      cookies[rawName] = decodeURIComponent(value);
    } catch {
      cookies[rawName] = value;
    }
    return cookies;
  }, {});
};

const getRequestCookies = (request: RequestWithCookies): Record<string, string> => {
  const parsed = parseCookieHeader(request.headers.cookie);
  for (const [name, value] of Object.entries(request.cookies ?? {})) {
    if (value !== undefined) parsed[name] = value;
  }
  return parsed;
};

const serializeCookie = (name: string, value: string, options: CookieOptions = {}): string => {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) {
    const sameSite = options.sameSite === true ? 'Strict' : options.sameSite;
    parts.push(`SameSite=${String(sameSite).charAt(0).toUpperCase()}${String(sameSite).slice(1)}`);
  }
  return parts.join('; ');
};

const appendSetCookie = (response: ServerResponse, cookiesToSet: string[]) => {
  const existing = response.getHeader('Set-Cookie');
  const existingCookies = Array.isArray(existing)
    ? existing.map(String)
    : existing
      ? [String(existing)]
      : [];

  response.setHeader('Set-Cookie', [...existingCookies, ...cookiesToSet]);
};

export const createSupabaseServerClient = (
  request: RequestWithCookies,
  response: ServerResponse
): SupabaseClient => {
  const { url, anonKey } = requireSupabasePublicConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return Object.entries(getRequestCookies(request)).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        appendSetCookie(
          response,
          cookiesToSet.map(({ name, value, options }) => serializeCookie(name, value, options))
        );
      },
    },
  });
};
