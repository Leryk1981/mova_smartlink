/**
 * Smartlink Worker - Main entry point
 * 
 * Routes:
 * - GET /s/:linkId - Public smartlink redirect
 * - GET /api/smartlinks/:linkId - Get smartlink config
 * - PUT /api/smartlinks/:linkId - Update smartlink config
 * - DELETE /api/smartlinks/:linkId - Delete smartlink config
 */

import type { Env } from './types.js';
import { Router } from './router.js';
import { handlePublicRedirect } from './handlers/public.js';
import { 
  handleGetSmartlink, 
  handlePutSmartlink, 
  handleDeleteSmartlink 
} from './handlers/admin.js';
import { errorResponse, corsResponse } from './utils/response.js';

// Create router
const router = new Router();

// Public route: smartlink redirect
router.get('/s/:linkId', async (request, params) => {
  const env = (request as any).__env as Env;
  return handlePublicRedirect(request, params.linkId, env);
});

// Admin routes: CRUD for smartlink configurations
router.get('/api/smartlinks/:linkId', async (request, params) => {
  const env = (request as any).__env as Env;
  return handleGetSmartlink(params.linkId, env);
});

router.put('/api/smartlinks/:linkId', async (request, params) => {
  const env = (request as any).__env as Env;
  return handlePutSmartlink(request, params.linkId, env);
});

router.delete('/api/smartlinks/:linkId', async (request, params) => {
  const env = (request as any).__env as Env;
  return handleDeleteSmartlink(params.linkId, env);
});

/**
 * Main Worker fetch handler
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse();
    }
    
    // Attach env to request for handlers (simple workaround)
    (request as any).__env = env;
    
    try {
      // Try to match route
      const match = router.match(request);
      
      if (match) {
        return await match.handler(request, match.params);
      }
      
      // No route matched
      return errorResponse('Not found', 404);
      
    } catch (error) {
      console.error('Unhandled error:', error);
      return errorResponse('Internal server error', 500);
    }
  },
};

