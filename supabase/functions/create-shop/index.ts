import { Hono } from 'https://deno.land/x/hono@v4.4.7/mod.ts';
import { cors } from 'https://deno.land/x/hono@v4.4.7/middleware.ts';
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

const BodySchema = z.object({
  name: z.string().min(2),
  userId: z.string().uuid(),
});

const app = new Hono();
app.use('*', cors());

app.post('/', async (c) => {
  const parsed = BodySchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  const { name, userId } = parsed.data;

  const { data, error } = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/shops`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: Deno.env.get('SUPABASE_ANON_KEY')!,
      Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ name, owner_id: userId }),
  }).then((r) => r.json());

  if ((error as any)?.message) return c.json(error, 400);

  await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/shop_members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: Deno.env.get('SUPABASE_ANON_KEY')!,
      Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
    },
    body: JSON.stringify({ shop_id: data[0].id, user_id: userId, role: 'owner' }),
  });

  return c.json(data[0]);
});

Deno.serve(app.fetch);
