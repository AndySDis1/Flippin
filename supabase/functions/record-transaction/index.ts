import { Hono } from 'https://deno.land/x/hono@v4.4.7/mod.ts';
import { cors } from 'https://deno.land/x/hono@v4.4.7/middleware.ts';
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

const BodySchema = z.object({
  itemId: z.string().uuid(),
  shopId: z.string().uuid(),
  salePrice: z.number().min(0),
  fees: z.number().min(0).optional().default(0),
  tax: z.number().min(0).optional().default(0),
});

const app = new Hono();
app.use('*', cors());

app.post('/', async (c) => {
  const parsed = BodySchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  const { itemId, shopId, salePrice, fees, tax } = parsed.data;

  const tx = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: Deno.env.get('SUPABASE_ANON_KEY')!,
      Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ item_id: itemId, shop_id: shopId, sale_price: salePrice, fees, tax }),
  }).then((r) => r.json());

  await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/items?id=eq.${itemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: Deno.env.get('SUPABASE_ANON_KEY')!,
      Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
    },
    body: JSON.stringify({ status: 'sold' }),
  });

  return c.json(tx);
});

Deno.serve(app.fetch);
