'use client';

import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

let client = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export function createBrowserSupabaseClient() {
  return client;
}
