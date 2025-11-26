/**
 * Utilities for normalizing HTTP request context into SmartlinkContext
 */

import type { SmartlinkContext } from '@mova/core-smartlink';

/**
 * Parse Accept-Language header and return primary language code
 * Example: "en-US,en;q=0.9,de;q=0.8" -> "en"
 */
export function parseLanguage(acceptLanguage: string | null): string | undefined {
  if (!acceptLanguage) return undefined;
  
  // Parse first language from Accept-Language header
  const match = acceptLanguage.match(/^([a-z]{2})/i);
  return match ? match[1].toLowerCase() : undefined;
}

/**
 * Parse User-Agent header to determine device type
 * Simple heuristic: mobile, tablet, or desktop
 */
export function parseDevice(userAgent: string | null): string | undefined {
  if (!userAgent) return 'desktop';
  
  const ua = userAgent.toLowerCase();
  
  // Check for mobile indicators
  if (
    ua.includes('mobile') ||
    ua.includes('android') ||
    ua.includes('iphone') ||
    ua.includes('ipod')
  ) {
    return 'mobile';
  }
  
  // Check for tablet
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  
  return 'desktop';
}

/**
 * Extract UTM parameters from URL search params
 */
export function parseUTM(searchParams: URLSearchParams): Record<string, string> {
  const utm: Record<string, string> = {};
  
  const utmParams = ['source', 'medium', 'campaign', 'term', 'content'];
  
  for (const param of utmParams) {
    const value = searchParams.get(`utm_${param}`);
    if (value) {
      utm[param] = value;
    }
  }
  
  return utm;
}

/**
 * Normalize HTTP request into SmartlinkContext
 */
export function normalizeContext(request: Request): SmartlinkContext {
  const url = new URL(request.url);
  const headers = request.headers;
  
  const cfCountry = (request as any).cf?.country as string | undefined;
  
  const context: SmartlinkContext = {
    country: cfCountry || undefined,
    lang: parseLanguage(headers.get('accept-language')),
    device: parseDevice(headers.get('user-agent')),
    utm: parseUTM(url.searchParams),
  };
  
  // Remove empty utm object if no UTM params
  if (context.utm && Object.keys(context.utm).length === 0) {
    delete context.utm;
  }
  
  return context;
}

