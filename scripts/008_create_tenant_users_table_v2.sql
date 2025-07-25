-- 008_create_tenant_users_table_v2.sql
-- Creates tenant_users if it doesn't yet exist and turns OFF RLS
-- Run:  supabase db push  (or psql -f …)

create table if not exists public.tenant_users (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  username        text not null,
  email           text not null,
  password_hash   text not null,
  is_admin        boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Helpful indexes
create index if not exists tenant_users_tenant_id_idx on public.tenant_users(tenant_id);
create unique index if not exists tenant_users_tenant_email_uq on public.tenant_users(tenant_id, email);

-- Disable RLS so the service-role key (used server-side) may insert
alter table public.tenant_users disable row level security;
