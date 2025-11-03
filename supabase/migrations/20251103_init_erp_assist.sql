-- ERP Assist initial schema for Supabase (PostgreSQL)
-- Safe to run multiple times where IF NOT EXISTS is used.

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  business_number text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table public.organizations enable row level security;
do $$ begin
  create policy org_select_own on public.organizations
    for select to authenticated
    using (id = (select org_id from public.profiles where id = auth.uid()));
exception when others then null; end $$;

-- profiles (shadow of auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  phone text,
  org_id uuid references public.organizations(id) on delete set null,
  role text,
  terms_agreed_at timestamp with time zone,
  marketing_opt_in boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
alter table public.profiles enable row level security;
do $$ begin
  create policy profiles_self_select on public.profiles
    for select to authenticated
    using (id = auth.uid());
exception when others then null; end $$;
do $$ begin
  create policy profiles_self_update on public.profiles
    for update to authenticated
    using (id = auth.uid()) with check (id = auth.uid());
exception when others then null; end $$;
do $$ begin
  create policy profiles_insert_service on public.profiles
    for insert to service_role using (true) with check (true);
exception when others then null; end $$;

-- leads (public demo form)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company text,
  name text,
  phone text,
  email text,
  note text,
  created_at timestamp with time zone default now()
);
alter table public.leads enable row level security;
do $$ begin
  create policy leads_insert_any on public.leads for insert to anon, authenticated using (true) with check (true);
exception when others then null; end $$;
do $$ begin
  create policy leads_select_service on public.leads for select to service_role using (true);
exception when others then null; end $$;

-- order_logs (dashboard KPIs)
create type if not exists public.order_status as enum ('pending','success','failed');
create table if not exists public.order_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  status public.order_status not null default 'pending',
  meta jsonb,
  created_at timestamp with time zone default now()
);
create index if not exists idx_order_logs_org_created on public.order_logs (organization_id, created_at);
create index if not exists idx_order_logs_status on public.order_logs (status);
alter table public.order_logs enable row level security;
do $$ begin
  create policy order_logs_org_select on public.order_logs for select to authenticated
    using (organization_id = (select org_id from public.profiles where id = auth.uid()));
exception when others then null; end $$;
do $$ begin
  create policy order_logs_org_insert_service on public.order_logs for insert to service_role using (true) with check (true);
exception when others then null; end $$;

-- api_logs (Edge Functions telemetry)
create table if not exists public.api_logs (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  fn text,
  function_name text,
  status int,
  status_code int,
  response_time_ms int,
  duration_ms int,
  error_message text,
  payload jsonb,
  payload_hash text,
  trace_id text,
  request_id text,
  created_at timestamp with time zone default now()
);
create index if not exists idx_api_logs_user_created on public.api_logs (user_id, created_at desc);
alter table public.api_logs enable row level security;
do $$ begin
  create policy api_logs_self_select on public.api_logs for select to authenticated using (user_id = auth.uid());
exception when others then null; end $$;
do $$ begin
  create policy api_logs_insert_service on public.api_logs for insert to service_role using (true) with check (true);
exception when others then null; end $$;

-- ecount_connections
create table if not exists public.ecount_connections (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  connection_name text default 'primary',
  status text default 'inactive',
  company_code text,
  ecount_user_id text,
  masked_api_key_suffix text,
  last_session_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (org_id, connection_name)
);
alter table public.ecount_connections enable row level security;
do $$ begin
  create policy ecount_conn_select_org on public.ecount_connections for select to authenticated
    using (
      (org_id is not null and org_id = (select org_id from public.profiles where id = auth.uid()))
      or (user_id is not null and user_id = auth.uid())
    );
exception when others then null; end $$;
do $$ begin
  create policy ecount_conn_upsert_service on public.ecount_connections for insert to service_role using (true) with check (true);
exception when others then null; end $$;
do $$ begin
  create policy ecount_conn_update_service on public.ecount_connections for update to service_role using (true) with check (true);
exception when others then null; end $$;

-- ecount_logs (raw logs per call)
create table if not exists public.ecount_logs (
  id bigserial primary key,
  trace_id text,
  endpoint text,
  payload jsonb,
  result jsonb,
  raw_response text,
  created_at timestamp with time zone default now()
);
create index if not exists idx_ecount_logs_trace on public.ecount_logs (trace_id);
alter table public.ecount_logs enable row level security;
do $$ begin
  create policy ecount_logs_service_rw on public.ecount_logs for all to service_role using (true) with check (true);
exception when others then null; end $$;

-- ecount_sessions (cached session id)
create table if not exists public.ecount_sessions (
  company_code text not null,
  user_id text not null,
  session_id text not null,
  expires_at timestamp with time zone not null,
  updated_at timestamp with time zone default now(),
  primary key (company_code, user_id)
);
alter table public.ecount_sessions enable row level security;
do $$ begin
  create policy ecount_sessions_service_rw on public.ecount_sessions for all to service_role using (true) with check (true);
exception when others then null; end $$;

-- master data used by suggest-items and samples
create table if not exists public.customer_master (
  customer_code text primary key,
  customer_name text not null,
  channel text,
  email text,
  phone text,
  default_price_tier text,
  created_at timestamp with time zone default now()
);
alter table public.customer_master enable row level security;
do $$ begin
  create policy customer_master_ro_auth on public.customer_master for select to authenticated using (true);
exception when others then null; end $$;
do $$ begin
  create policy customer_master_service_rw on public.customer_master for all to service_role using (true) with check (true);
exception when others then null; end $$;

create table if not exists public.item_master (
  sku_code text primary key,
  sku_name text not null,
  uom text default 'EA',
  category text,
  erp_item_code text,
  active boolean default true,
  unit_price numeric(18,2) default 0,
  synonyms text[],
  created_at timestamp with time zone default now()
);
alter table public.item_master enable row level security;
do $$ begin
  create policy item_master_ro_auth on public.item_master for select to authenticated using (true);
exception when others then null; end $$;
do $$ begin
  create policy item_master_service_rw on public.item_master for all to service_role using (true) with check (true);
exception when others then null; end $$;

create table if not exists public.synonym_dict (
  id bigserial primary key,
  term text not null,
  sku_code text not null references public.item_master(sku_code) on delete cascade,
  confidence numeric(4,3) default 0.8,
  created_at timestamp with time zone default now()
);
create index if not exists idx_synonym_term on public.synonym_dict using gin (term gin_trgm_ops);
alter table public.synonym_dict enable row level security;
do $$ begin
  create policy synonym_ro_auth on public.synonym_dict for select to authenticated using (true);
exception when others then null; end $$;
do $$ begin
  create policy synonym_service_rw on public.synonym_dict for all to service_role using (true) with check (true);
exception when others then null; end $$;

-- helpers
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

do $$ begin
  create trigger organizations_set_updated
    before update on public.organizations
    for each row execute function public.set_updated_at();
exception when others then null; end $$;

do $$ begin
  create trigger profiles_set_updated
    before update on public.profiles
    for each row execute function public.set_updated_at();
exception when others then null; end $$;

do $$ begin
  create trigger ecount_connections_set_updated
    before update on public.ecount_connections
    for each row execute function public.set_updated_at();
exception when others then null; end $$;
