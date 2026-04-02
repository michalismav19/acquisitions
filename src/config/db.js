import 'dotenv/config';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// When NEON_LOCAL_ENDPOINT is set, route HTTP queries to Neon Local proxy
// instead of the Neon cloud API. Required for local Docker development.
if (process.env.NEON_LOCAL_ENDPOINT) {
  neonConfig.fetchEndpoint = process.env.NEON_LOCAL_ENDPOINT;
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(process.env.DATABASE_URL);

const db = drizzle(sql);

export { sql, db };
