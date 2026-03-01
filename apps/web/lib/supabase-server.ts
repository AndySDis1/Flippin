import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  const headersList = headers();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
    headers: new Map(headersList.entries()),
  });
}
