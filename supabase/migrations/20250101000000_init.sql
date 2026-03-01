create extension if not exists "uuid-ossp";

create table public.shops (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid not null,
  created_at timestamptz not null default now()
);

create table public.shop_members (
  shop_id uuid references public.shops(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (shop_id, user_id)
);

create table public.items (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references public.shops(id) on delete cascade,
  title text not null,
  description text,
  cost numeric,
  price numeric,
  status text default 'draft',
  category text,
  tags text[],
  primary_photo_url text,
  created_at timestamptz not null default now()
);

create table public.item_photos (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references public.items(id) on delete cascade,
  url text not null,
  position int default 0,
  created_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references public.items(id) on delete cascade,
  marketplace text not null,
  marketplace_listing_id text,
  price numeric,
  status text default 'draft',
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid references public.items(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete cascade,
  sale_price numeric not null,
  fees numeric default 0,
  tax numeric default 0,
  created_at timestamptz not null default now()
);

create table public.ai_requests (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null,
  request jsonb not null,
  response jsonb,
  created_at timestamptz default now()
);

create view public.items_view as
select i.*, coalesce(p.url, i.primary_photo_url) as primary_photo_url
from public.items i
left join lateral (
  select url from public.item_photos p where p.item_id = i.id order by position asc limit 1
) p on true;

create view public.analytics_summary_view as
select
  count(*) filter (where true) as total_items,
  count(*) filter (where status = 'listed') as listed_items,
  count(*) filter (where status = 'sold') as sold_items,
  coalesce(sum(t.sale_price),0) as gross_revenue,
  coalesce(sum(i.cost),0) as total_cost,
  coalesce(sum(t.sale_price - coalesce(i.cost,0) - coalesce(t.fees,0) - coalesce(t.tax,0)),0) as net_profit
from public.items i
left join public.transactions t on t.item_id = i.id;

-- RLS
alter table public.shops enable row level security;
alter table public.shop_members enable row level security;
alter table public.items enable row level security;
alter table public.item_photos enable row level security;
alter table public.listings enable row level security;
alter table public.transactions enable row level security;
alter table public.ai_requests enable row level security;

create policy "members can read shops" on public.shops for select using (auth.uid() = owner_id or exists (
  select 1 from public.shop_members sm where sm.shop_id = shops.id and sm.user_id = auth.uid()
));
create policy "owners can update shops" on public.shops for update using (auth.uid() = owner_id);
create policy "owners can insert shops" on public.shops for insert with check (auth.uid() = owner_id);

create policy "members read memberships" on public.shop_members for select using (
  exists (select 1 from public.shop_members sm where sm.shop_id = shop_members.shop_id and sm.user_id = auth.uid())
);

create policy "members manage items" on public.items for all using (
  exists (select 1 from public.shop_members sm where sm.shop_id = items.shop_id and sm.user_id = auth.uid())
);
create policy "members manage item photos" on public.item_photos for all using (
  exists (select 1 from public.items i where i.id = item_photos.item_id and exists (
    select 1 from public.shop_members sm where sm.shop_id = i.shop_id and sm.user_id = auth.uid()
  ))
);
create policy "members manage listings" on public.listings for all using (
  exists (select 1 from public.items i where i.id = listings.item_id and exists (
    select 1 from public.shop_members sm where sm.shop_id = i.shop_id and sm.user_id = auth.uid()
  ))
);
create policy "members manage transactions" on public.transactions for all using (
  exists (select 1 from public.shop_members sm where sm.shop_id = transactions.shop_id and sm.user_id = auth.uid())
);
create policy "members manage ai logs" on public.ai_requests for all using (
  exists (select 1 from public.shop_members sm where sm.shop_id = ai_requests.shop_id and sm.user_id = auth.uid())
);
