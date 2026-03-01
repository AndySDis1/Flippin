'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createBrowserSupabaseClient } from '../../lib/supabase-browser';

export default function LoginPage() {
  const supabase = createBrowserSupabaseClient();

  return (
    <div className="mx-auto max-w-md card p-6">
      <h1 className="mb-3 text-2xl font-semibold text-white">Sign in to Flippin'</h1>
      <Auth
        supabaseClient={supabase}
        providers={['google', 'apple']}
        appearance={{
          theme: ThemeSupa,
          variables: { default: { colors: { brand: '#22c55e', brandAccent: '#16a34a' } } },
        }}
      />
    </div>
  );
}
