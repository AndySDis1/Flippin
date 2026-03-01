'use server';

import { z } from 'zod';
import { createServerSupabaseClient } from './supabase-server';

const PayloadSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  images: z.array(z.string().url()).max(10).optional(),
  shopId: z.string().uuid(),
});

export async function generateListing(payload: z.infer<typeof PayloadSchema>) {
  const parsed = PayloadSchema.parse(payload);
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.functions.invoke('ai-generate-listing', {
    body: parsed,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
