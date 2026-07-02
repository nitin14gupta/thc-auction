-- Run these in the Supabase SQL editor.
-- Requires pgcrypto for gen_random_uuid() (enabled by default on Supabase).

create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null unique,
    password_hash text not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_users_email on public.users (email);

-- One row per issued refresh token (hashed, never store raw tokens).
-- Enables rotation + revocation ("logout everywhere", detect token reuse).
create table if not exists public.refresh_tokens (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users (id) on delete cascade,
    token_hash text not null unique,
    expires_at timestamptz not null,
    revoked boolean not null default false,
    created_at timestamptz not null default now()
);

create index if not exists idx_refresh_tokens_user_id on public.refresh_tokens (user_id);
create index if not exists idx_refresh_tokens_token_hash on public.refresh_tokens (token_hash);

-- Forgot-password one-time codes. OTP is hashed at rest; short expiry.
create table if not exists public.password_reset_otps (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.users (id) on delete cascade,
    otp_hash text not null,
    expires_at timestamptz not null,
    used boolean not null default false,
    attempts int not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists idx_password_reset_otps_user_id on public.password_reset_otps (user_id);
