import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // SQL migrations are the source of truth — Drizzle is used for typed access only.
  // Do not run drizzle-kit push or generate unless intentional.
  verbose: true,
  strict: true,
});
