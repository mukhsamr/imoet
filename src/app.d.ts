import type { D1Database } from '@cloudflare/workers-types';

declare global {
  namespace App {
    interface Platform {
      env: {
        OPENROUTER_API_KEY: string;
        OPENROUTER_MODEL: string;
        DB: D1Database;
      };
      context: {
        waitUntil(promise: Promise<any>): void;
      };
      caches: CacheStorage & { default: Cache };
    }
  }
}

export { };
