import { registerRoutes } from './routes.js';

export const name = 'dsh-skills';
export const inject = ['connection', 'tools'];

export function apply(ctx) {
  registerRoutes(ctx);
}


