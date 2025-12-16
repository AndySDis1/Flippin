import { Hono } from 'https://deno.land/x/hono@v4.4.7/mod.ts';
import { cors } from 'https://deno.land/x/hono@v4.4.7/middleware.ts';
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

const BodySchema = z.object({
  bucket: z.string().min(1),
  fileName: z.string().min(1),
  contentType: z.string().optional().default('image/jpeg'),
});

const app = new Hono();
app.use('*', cors());

app.post('/', async (c) => {
  const parsed = BodySchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  const { bucket, fileName, contentType } = parsed.data;

  const expiresIn = 60 * 5;
  const signed = await fetch(`${Deno.env.get('SUPABASE_URL')}/storage/v1/object/sign/${bucket}/${fileName}`, {
    method: 'POST',
    headers: {
      apikey: Deno.env.get('SUPABASE_ANON_KEY')!,
      Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresIn }),
  }).then((r) => r.json());

  const publicUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/${bucket}/${fileName}`;

  return c.json({
    signedUrl: `${Deno.env.get('SUPABASE_URL')}/storage/v1/${signed.signedURL}`,
    publicUrl,
    headers: { 'Content-Type': contentType },
  });
});

Deno.serve(app.fetch);
