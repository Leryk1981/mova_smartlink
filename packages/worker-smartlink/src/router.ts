/**
 * Simple URL router for Worker
 */

export interface Route {
  pattern: RegExp;
  handler: (request: Request, params: Record<string, string>) => Promise<Response> | Response;
}

export interface RouteMatch {
  handler: Route['handler'];
  params: Record<string, string>;
}

/**
 * Simple router that matches URL patterns
 */
export class Router {
  private routes: Map<string, Route[]> = new Map();
  
  /**
   * Add a route for a specific HTTP method
   */
  add(method: string, pattern: string, handler: Route['handler']): void {
    const regex = this.patternToRegex(pattern);
    
    if (!this.routes.has(method)) {
      this.routes.set(method, []);
    }
    
    this.routes.get(method)!.push({ pattern: regex, handler });
  }
  
  /**
   * Add GET route
   */
  get(pattern: string, handler: Route['handler']): void {
    this.add('GET', pattern, handler);
  }
  
  /**
   * Add PUT route
   */
  put(pattern: string, handler: Route['handler']): void {
    this.add('PUT', pattern, handler);
  }
  
  /**
   * Add DELETE route
   */
  delete(pattern: string, handler: Route['handler']): void {
    this.add('DELETE', pattern, handler);
  }
  
  /**
   * Match request to a route
   */
  match(request: Request): RouteMatch | null {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;
    
    const routes = this.routes.get(method);
    if (!routes) return null;
    
    for (const route of routes) {
      const match = path.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        
        // Extract named groups as params
        if (match.groups) {
          Object.assign(params, match.groups);
        }
        
        return {
          handler: route.handler,
          params,
        };
      }
    }
    
    return null;
  }
  
  /**
   * Convert route pattern to regex
   * Example: "/s/:linkId" -> /^\/s\/(?<linkId>[^\/]+)$/
   */
  private patternToRegex(pattern: string): RegExp {
    const regexPattern = pattern
      .replace(/:[a-zA-Z_][a-zA-Z0-9_]*/g, (match) => {
        const paramName = match.slice(1);
        return `(?<${paramName}>[^/]+)`;
      })
      .replace(/\//g, '\\/');
    
    return new RegExp(`^${regexPattern}$`);
  }
}

