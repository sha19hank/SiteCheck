-- ─────────────────────────────────────────────────────────────────────────────
-- SiteCheck — initial schema
-- Run in Supabase SQL editor or via migration tool
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── user_profiles ────────────────────────────────────────────────────────────
create table if not exists user_profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text not null,
  plan             text not null default 'free'
                     check (plan in ('free', 'report_unlock', 'pro')),
  audits_this_month integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table user_profiles enable row level security;

create policy "Users can view own profile"
  on user_profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on user_profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── audits ──────────────────────────────────────────────────────────────────
create table if not exists audits (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references user_profiles(id) on delete set null,
  url             text not null,
  domain          text not null,
  share_token     text not null unique,
  is_public       boolean not null default true,

  -- Scores stored flat for easy querying
  score_overall   integer not null,
  score_performance integer not null,
  score_trust     integer not null,
  score_clarity   integer not null,
  score_conversion integer not null,

  -- Full JSON payloads
  scores          jsonb not null,
  scraped_data    jsonb not null,
  pagespeed_data  jsonb not null,
  ai_report       jsonb not null,

  -- Access control
  is_paid         boolean not null default false,
  payment_id      uuid,

  created_at      timestamptz not null default now()
);

-- Indexes
create index audits_user_id_idx on audits(user_id);
create index audits_share_token_idx on audits(share_token);
create index audits_domain_created_idx on audits(domain, created_at desc);
create index audits_created_at_idx on audits(created_at desc);

alter table audits enable row level security;

-- Anyone can read public audits (for share links)
create policy "Public audits are readable by all"
  on audits for select using (is_public = true);

-- Users can read own audits
create policy "Users can read own audits"
  on audits for select using (auth.uid() = user_id);

-- Service role inserts (via API routes)
create policy "Service role can insert"
  on audits for insert with check (true);

create policy "Service role can update"
  on audits for update using (true);

-- ─── payments ─────────────────────────────────────────────────────────────────
create table if not exists payments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references user_profiles(id) on delete set null,
  audit_id        uuid references audits(id) on delete set null,
  provider        text not null default 'razorpay',
  provider_id     text not null,
  plan            text not null check (plan in ('free', 'report_unlock', 'pro')),
  amount_paise    integer not null,
  status          text not null default 'pending'
                    check (status in ('pending', 'paid', 'failed')),
  created_at      timestamptz not null default now()
);

alter table payments enable row level security;

create policy "Users can view own payments"
  on payments for select using (auth.uid() = user_id);

create policy "Service role can manage payments"
  on payments for all using (true);

-- ─── email_leads ─────────────────────────────────────────────────────────────
-- Captures emails from free report gate for drip campaigns
create table if not exists email_leads (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  audit_id    uuid references audits(id) on delete set null,
  source      text default 'free_report_gate',
  created_at  timestamptz not null default now()
);

alter table email_leads enable row level security;

create policy "Service role can manage leads"
  on email_leads for all using (true);

-- ─── Helper view: recent public audits (for social proof) ─────────────────────
create or replace view recent_audits as
  select
    share_token,
    domain,
    score_overall,
    score_trust,
    score_conversion,
    created_at
  from audits
  where is_public = true
    and is_paid = true
  order by created_at desc
  limit 100;

-- ─── Add screenshot_data column (run if adding to existing database) ───────────
-- alter table audits add column if not exists screenshot_data jsonb;
