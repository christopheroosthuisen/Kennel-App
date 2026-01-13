
import { IncomingMessage, ServerResponse } from 'http';
import { HttpError, NotFoundError, BadRequestError } from './errors';
import { sendError } from './http';
import { UserAccount } from '../../shared/domain';

export type ExtendedRequest = IncomingMessage & { user?: UserAccount };

export type Handler = (req: ExtendedRequest, res: ServerResponse, params: Record<string, string>) => Promise<void>;

interface Route {
  method: HttpMethod;
  pathRegex: RegExp;
  paramNames: string[];
  handler: Handler;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export class Router {
  private routes: Route[] = [];

  add(method: HttpMethod, path: string, handler: Handler) {
    // Convert path /api/users/:id to regex
    const paramNames: string[] = [];
    const regexPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
      paramNames.push(key);
      return '([^/]+)';
    });
    
    this.routes.push({
      method,
      pathRegex: new RegExp(`^${regexPath}$`),
      paramNames,
      handler
    });
  }

  async handle(req: IncomingMessage, res: ServerResponse) {
    try {
      const { method, url } = req;
      if (!url || !method) throw new BadRequestError();

      // Strip query string for matching
      const [pathname, _] = url.split('?');

      for (const route of this.routes) {
        if (route.method === method) {
          const match = pathname.match(route.pathRegex);
          if (match) {
            const params: Record<string, string> = {};
            route.paramNames.forEach((name, i) => {
              params[name] = match[i + 1];
            });
            await route.handler(req as ExtendedRequest, res, params);
            return;
          }
        }
      }

      throw new NotFoundError(`No route found for ${method} ${pathname}`);
    } catch (err) {
      sendError(res, err);
    }
  }
}
