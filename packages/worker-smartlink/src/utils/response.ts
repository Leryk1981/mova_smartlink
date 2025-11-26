/**
 * HTTP response helpers
 */

import type { ErrorResponse } from '../types.js';

/**
 * Create JSON response
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'access-control-allow-origin': '*', // For SPA development
    },
  });
}

/**
 * Create error response
 */
export function errorResponse(message: string, status = 500): Response {
  const error: ErrorResponse = {
    error: getErrorName(status),
    message,
    status,
  };
  
  return jsonResponse(error, status);
}

/**
 * Create redirect response
 */
export function redirectResponse(url: string, status = 302): Response {
  const location = sanitizeHeaderValue(url);

  if (!location) {
    return errorResponse('Invalid redirect URL', 400);
  }

  return new Response(null, {
    status,
    headers: {
      'location': location,
    },
  });
}

/**
 * Create CORS preflight response
 */
export function corsResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, PUT, OPTIONS',
      'access-control-allow-headers': 'content-type',
      'access-control-max-age': '86400',
    },
  });
}

/**
 * Get error name from status code
 */
function getErrorName(status: number): string {
  switch (status) {
    case 400: return 'Bad Request';
    case 404: return 'Not Found';
    case 500: return 'Internal Server Error';
    default: return 'Error';
  }
}

/**
 * Sanitize header values to prevent invalid characters
 */
function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, '').trim();
}

