/**
 * Turso Database Client
 * Connects to Turso libSQL database using Drizzle ORM
 */

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Create libSQL client for Turso
const client = createClient({
  url: import.meta.env.VITE_TURSO_URL || '',
  authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN || '',
});

// Create Drizzle ORM instance with schema
export const db = drizzle(client, { schema });

// Export schema for use in queries
export { schema };

/**
 * Check if Turso is configured
 */
export function isTursoConfigured(): boolean {
  return !!(
    import.meta.env.VITE_TURSO_URL &&
    import.meta.env.VITE_TURSO_AUTH_TOKEN
  );
}
