import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';

let cached: SupabaseClient | null = null;

export function useSupabase() {
  return useMemo(() => {
    if (cached) return cached;
    cached = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storage: {
            async getItem(key) {
              return SecureStore.getItemAsync(key);
            },
            async setItem(key, value) {
              await SecureStore.setItemAsync(key, value);
            },
            async removeItem(key) {
              await SecureStore.deleteItemAsync(key);
            },
          },
        },
      },
    );
    return cached;
  }, []);
}
