import { Hono } from 'https://deno.land/x/hono@v4.4.7/mod.ts';
import { cors } from 'https://deno.land/x/hono@v4.4.7/middleware.ts';
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

const BodySchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  images: z.array(z.string().url()).max(10).optional(),
  shopId: z.string().uuid(),
});

const app = new Hono();
app.use('*', cors());

app.post('/', async (c) => {
  const parsed = BodySchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  const { title, description, images, shopId } = parsed.data;

  const system = 'You are a veteran marketplace listing generator. Respond with JSON: {title, description, tags, price, category}';
  const user = `Title: ${title}\nDescription: ${description ?? ''}\nImages:${images?.join(',') ?? ''}`;

  const ai = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('OPENAI_KEY')}`,
    },
    body: JSON.stringify({
      model: Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
    }),
  }).then((res) => res.json());

  await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/ai_requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: Deno.env.get('SUPABASE_ANON_KEY')!,
      Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      shop_id: shopId,
      request: { title, description, images },
      response: ai,
    }),
  });

  return c.json(ai);
});

Deno.serve(app.fetch);
