# Flippin' — AI-Powered Reselling & Inventory Hub

## 1. Executive Summary
Flippin' delivers ultra-fast inventory intake, AI listing generation, multi-marketplace distribution, lifecycle tracking, and analytics for resellers. The solution uses a Supabase-first backend (Postgres + storage + auth + edge functions), a Next.js web dashboard on Vercel, and an Expo React Native mobile app. AI flows run through OpenAI via Supabase Edge Functions with GPU-friendly fallbacks. The system favors serverless for low idle cost and auto-scale, with optional containers for heavy workers.

## 2. Final Architecture Diagram
```
                               +-------------------------+
                               |        Clients         |
        Photos/Forms           |  - Next.js (web)       |
      +------------------------+  - Expo RN (mobile)    |
      |                        +-----------+------------+
      |                                    |
      v                                    v
+-------------+  HTTPS (Auth, RLS)  +---------------+   Edge invocations   +----------------------+
|  Vercel     |-------------------->| Supabase API |<-------------------->| Supabase Edge Funcs  |
|  Next.js    |                    | (PostgREST)  |   (Hono on Deno)     | - AI listing gen      |
|  Web        |<-------------------+               +--------------------->| - Webhooks (orders)   |
+------+------+   Realtime/WS       | - Auth        |   Storage signed URL| - Cron (analytics)    |
       ^           +--------------->| - RLS         |                     +----------+-----------+
       |           |                | - Realtime    |                                |
       |           |                +---------------+                                |
       |           |                        |                                         |
       |           |                        v                                         v
       |    +------+-----+      Supabase Storage (images)                  Background Workers (Fly.io/GCP Cloud Run)
       |    | CDN (Vercel|        - Image optimization                     - Marketplace sync
       |    |  Edge)     |        - Signed uploads                         - Notification fan-out
       |    +------+-----+                                                 - ETL to ClickHouse (optional)
       |           |                                                               
       |           v                                                               
       |    Client-side image uploads via signed URLs                             
       |                                                                           
       |                                    +-------------------+
       |                                    | Analytics Layer  |
       +------------------------------------+  (Postgres views |
                                            |   + materialized |
                                            |   supabase-pgmq) |
                                            +-------------------+
```

## 3. Chosen Tech Stack (with reasoning)
- **Hosting**: Vercel for web (best DX, edge network) + Supabase for backend (managed Postgres, Auth, Storage, Realtime, Edge Functions) + Fly.io/Cloud Run for optional long-running workers.
- **Database**: Supabase Postgres with RLS for multitenancy isolation; materialized views for analytics; `pgmq` for lightweight queues; ClickHouse optional for heavy analytics later.
- **Backend**: Supabase Edge Functions (Deno + Hono) for API orchestration, Marketplace webhooks, AI calls. Minimal latency, zero cold-start billing. Background workers containerized when needed.
- **Frontend Web**: Next.js 15 (App Router, React Server Components) + Tailwind + TanStack Query; optimized for SSR + edge caching.
- **Mobile**: Expo React Native (EAS build), leveraging universal components and Supabase client.
- **Auth**: Supabase Auth (email/password, magic links, OAuth); RLS enforced per shop/workspace; service-role keys only in server contexts.
- **Storage**: Supabase Storage buckets with signed upload URLs; Vercel Image Optimization + AVIF/WebP delivery through CDN.
- **AI**: OpenAI GPT-4o mini/omni via Edge Functions; vision-enabled prompts using uploaded images; optional local model via OpenAI Compatible endpoint.
- **CI/CD**: GitHub Actions with Turbo cache; preview deployments on Vercel; Supabase CLI migrations; semantic release optional.
- **Infra as Code**: Supabase config + SQL migrations; `vercel.json` for web routing; optional Terraform for Fly/Cloud Run workers.

## 4. Monorepo Structure
```
/ (pnpm + Turbo)
├─ apps/
│  ├─ web/            # Next.js app router web dashboard
│  └─ mobile/         # Expo React Native
├─ packages/
│  ├─ ui/             # Shared design system components
│  ├─ api-client/     # Typed SDK (ts-rest/openapi)
│  └─ config/         # tsconfig/eslint/prettier shared
├─ supabase/          # SQL, migrations, policies, functions
│  ├─ migrations/
│  ├─ functions/      # Edge functions (Hono)
│  └─ seeds/
├─ workers/           # Long-running jobs (marketplace sync)
└─ tools/             # CI scripts, codegen
```

## 5. Backend Code (Supabase Edge Functions)
Key patterns (Hono + Zod validation + service-role isolation).

Example: `supabase/functions/ai-generate-listing/index.ts` (refined)
```ts
import { Hono } from "https://deno.land/x/hono@v4.4.7/mod.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { cors } from "https://deno.land/x/hono@v4.4.7/middleware.ts";

const app = new Hono();
app.use("*", cors());

const BodySchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  images: z.array(z.string().url()).max(10).optional(),
  shopId: z.string().uuid(),
});

app.post("/", async (c) => {
  const parsed = BodySchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: parsed.error.format() }, 400);

  const { title, description, images, shopId } = parsed.data;
  const system = `You are an expert marketplace listing assistant for a reseller hub. Return JSON with title, description, tags, price_suggestion, category.`;
  const user = `Title: ${title}\nDescription: ${description ?? ""}\nImages: ${images?.length ?? 0}`;

  const aiResp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("OPENAI_KEY")}`,
    },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  }).then((r) => r.json());

  // Persist draft listing metadata
  await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/ai_listings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({ shop_id: shopId, request: { title, description, images }, response: aiResp }),
  });

  return c.json(aiResp);
});

Deno.serve(app.fetch);
```

Other functions:
- `create-shop`: create workspace with owner mapping; enforces auth and RLS context.
- `record-transaction`: writes sales, updates item status, emits notification to queue.
- `marketplace-webhooks`: receives webhooks from eBay/Etsy/Poshmark, normalizes payloads.
- `analytics-refresh`: cron to refresh materialized views.

## 6. Frontend Web Code (Next.js app router)
Features: SSR dashboard, realtime updates via Supabase channels, signed uploads, AI listing composer.

Key screens/components (examples):
```tsx
// apps/web/app/(dashboard)/items/page.tsx
import { createClient } from "@supabase/supabase-js";
import ItemGrid from "@flippin/ui/ItemGrid";

export default async function ItemsPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await supabase.from("items_view").select("*").order("created_at", { ascending: false });
  return <ItemGrid items={data ?? []} />;
}
```
```tsx
// apps/web/app/(dashboard)/intake/new/page.tsx
// Uploads directly to Supabase Storage via signed URL, then calls AI function
```

UI toolkit: Tailwind + HeadlessUI; data fetching via React Server Components + TanStack Query for client mutations. Image uploads use `createUploadSignedUrl` RPC to keep keys server-side.

## 7. Mobile App Code (Expo)
- Stack: Expo + React Navigation + Reanimated; Supabase JS client; camera via `expo-camera`; background upload via `expo-file-system` + signed URLs.
- Example screen: quick intake (photo > AI listing > draft save) calling same Edge Functions.

## 8. AI Workflow Code
- Prompting via structured JSON output; models configurable via `OPENAI_MODEL` env.
- Vision: upload photo, get signed URL, send to OpenAI image input.
- Safety: rate limits per user via RLS + `pgmq` tokens; audit logging to `ai_logs` table.

## 9. Auth System Code
- Supabase Auth with email/OAuth providers (Apple, Google). Magic links for mobile.
- RLS policies per table (simplified example):
```sql
-- Each row scoped by shop_id and membership
create policy "Shop members can read items" on public.items
for select using (
  exists (
    select 1 from public.shop_members sm
    where sm.shop_id = items.shop_id and sm.user_id = auth.uid()
  )
);
```
- Service role only used in Edge Functions; never exposed to clients.

## 10. Storage Logic Code
- Bucket `item-photos` with `private` ACL.
- RPC `create_signed_upload_url(bucket, path)` returns signed URL + headers.
- Images optimized via Vercel Image loader using storage public transform endpoint.

## 11. Security Model
- Multitenancy via `shop_id` scoping everywhere.
- RLS on all tables; default deny.
- Edge Functions validate JWT from Supabase; re-check membership.
- Secrets stored in Vercel/Supabase environment; no client exposure beyond anon key.
- Input validation via Zod; output encoding; OWASP headers via Vercel middleware (CSP, HSTS, CSRF on mutations via SameSite cookies).
- Audit tables for AI usage, admin events, and webhook deliveries.

## 12. DevOps / Deployment Steps
1. **Local dev**: `pnpm install`; `supabase start`; `pnpm dev` (Turbo runs web + mobile + functions emulator).
2. **DB migrations**: `supabase db push` for schema; commit SQL under `supabase/migrations`.
3. **Deploy backend**: `supabase functions deploy ai-generate-listing create-shop record-transaction --project-ref <ref>`.
4. **Deploy web**: `vercel --prod` (uses `apps/web`); env vars from Supabase project.
5. **Mobile**: `eas build -p ios/android` with env via `app.config.ts`.
6. **Workers**: deploy `workers/marketplace-sync` to Fly.io/Cloud Run with secret-mounted service role key.
7. **CI**: GitHub Actions running lint/test, supabase lint, then Vercel deploy + Supabase functions deploy on main.

## 13. Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server/edge only)
- `SUPABASE_JWT_SECRET`
- `OPENAI_KEY`
- `OPENAI_MODEL` (default `gpt-4o-mini`)
- `STORAGE_BUCKET` (default `item-photos`)
- `MARKETPLACE_WEBHOOK_SECRET_*` per provider
- `POSTHOG_KEY` (analytics), `SENTRY_DSN` (error capture)

## 14. Testing Strategy
- Unit: Zod schemas, utility functions (pricing calculator, profit math).
- Integration: Edge Function handlers via Deno test runner + Supabase test client.
- E2E Web: Playwright against local supabase + mock storage.
- Mobile: Detox for flows (intake, AI draft save).
- Security: `supabase db lint`, dependency scanning, snapshot RLS tests.

## 15. Performance Optimizations
- Use Postgres generated columns + partial indexes for common queries (status, shop_id, listed_at).
- Materialized views for analytics; refresh via cron; cached via edge.
- Signed URL uploads avoid server hop; images processed async with webhooks.
- CDN caching of GET endpoints via Vercel + stale-while-revalidate.
- Queue heavy AI or marketplace sync to workers; limit concurrency per user.

## 16. Maintenance & Scaling Strategy
- **Data**: Partition `items` by shop or month if >10M rows; archive old transactions.
- **Functions**: Split AI, webhook, analytics responsibilities; add circuit breakers + retries.
- **Observability**: Supabase logs + OpenTelemetry (OTLP) exported to Grafana/Tempo; Sentry for web/mobile.
- **Cost**: Serverless-first; move to dedicated Postgres only when connection count/storage grows; batch analytics jobs.
- **Extensibility**: API-first design via `packages/api-client` with OpenAPI contract; feature flags via Supabase `config` table.
