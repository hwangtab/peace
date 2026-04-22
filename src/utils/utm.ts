/**
 * UTM URL builder.
 *
 * All CTAs that link to external funding / ticketing pages share the same
 * UTM source/medium/campaign. Historically each caller was assembling the
 * query string by hand — easy to drift (typos, missing params, encoding).
 * Use `buildUtmUrl` from Button / Footer / page-level CTAs instead.
 */

const UTM_SOURCE = 'website';
const UTM_MEDIUM = 'cta';
const DEFAULT_CAMPAIGN = 'gpmc3';

export interface UtmOptions {
  /** Overrides `DEFAULT_CAMPAIGN` when a page wants its own campaign id. */
  campaign?: string;
}

/**
 * Append the standard UTM parameters to a URL, preserving any query string
 * already present on `url`. `content` is URL-encoded via URLSearchParams.
 */
export function buildUtmUrl(url: string, content: string, options: UtmOptions = {}): string {
  const params = new URLSearchParams({
    utm_source: UTM_SOURCE,
    utm_medium: UTM_MEDIUM,
    utm_campaign: options.campaign ?? DEFAULT_CAMPAIGN,
    utm_content: content,
  });
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
}
