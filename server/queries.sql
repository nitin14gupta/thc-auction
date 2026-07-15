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

alter table public.users add column if not exists avatar_url text;
alter table public.users add column if not exists is_admin boolean not null default false;

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

-- ============================================================
-- Product catalog (bulk-imported from hypefly_db_ready.json via
-- server/scripts/import_products.py)
-- ============================================================

create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    source_id bigint not null unique,
    name text not null,
    slug text,
    url text,
    brand text,
    product_type text,
    product_category text,
    gender text,
    sku text,
    gtin text,
    price numeric(12,2),
    compare_at_price numeric(12,2),
    currency text not null default 'INR',
    in_stock boolean not null default true,
    only_few_left boolean not null default false,
    express_delivery boolean not null default false,
    ships_in_18_to_20_days boolean not null default false,
    shipping_text text,
    sold_by text,
    rating numeric(3,2),
    review_count integer,
    product_fit text,
    product_fit_description text,
    images jsonb not null default '[]'::jsonb,
    seo jsonb,
    description text,
    source text,
    scraped_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_products_name on public.products (name);
create index if not exists idx_products_brand on public.products (brand);
create index if not exists idx_products_sku on public.products (sku);
create index if not exists idx_products_product_type on public.products (product_type);

create extension if not exists pg_trgm;
create index if not exists idx_products_name_trgm on public.products using gin (name gin_trgm_ops);
create index if not exists idx_products_brand_trgm on public.products using gin (brand gin_trgm_ops);

create table if not exists public.product_variants (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.products (id) on delete cascade,
    size text,
    shipping_mode text,
    sale_price numeric(12,2),
    compare_at_price numeric(12,2),
    created_at timestamptz not null default now()
);

create index if not exists idx_product_variants_product_id on public.product_variants (product_id);

-- ============================================================
-- Seller listings (the create-listing wizard reads/writes this)
-- ============================================================

create table if not exists public.listings (
    id uuid primary key default gen_random_uuid(),
    seller_id uuid not null references public.users (id) on delete cascade,
    product_id uuid references public.products (id) on delete set null,

    -- Step 2: Details
    variant_size text,
    colorway text,
    year_of_release text,
    style_sku text,

    -- Step 3: Condition
    condition_grade text check (condition_grade in ('DS', 'VNDS', 'USED', 'BEAT')),
    condition_notes text check (char_length(condition_notes) <= 500),

    -- Step 5: Pricing
    base_price numeric(12,2),
    bid_price numeric(12,2),

    -- Lifecycle
    status text not null default 'draft' check (status in ('draft', 'pending_review')),
    current_step smallint not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    submitted_at timestamptz
);

create index if not exists idx_listings_seller_id on public.listings (seller_id);
create index if not exists idx_listings_status on public.listings (status);
create index if not exists idx_listings_product_id on public.listings (product_id);

-- Auction scheduling (seller picks a local start time in Step 5, always stored
-- in UTC) + admin accept/reject review.
alter table public.listings add column if not exists auction_start_at timestamptz;
alter table public.listings add column if not exists reviewed_at timestamptz;

alter table public.listings drop constraint if exists listings_status_check;
alter table public.listings add constraint listings_status_check
    check (status in ('draft', 'pending_review', 'accepted', 'rejected'));

create table if not exists public.listing_photos (
    id uuid primary key default gen_random_uuid(),
    listing_id uuid not null references public.listings (id) on delete cascade,
    url text not null,
    r2_path text not null,
    sort_order smallint not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists idx_listing_photos_listing_id on public.listing_photos (listing_id);

-- ============================================================
-- Bidding / auction lifecycle
-- ============================================================

alter table public.listings add column if not exists auction_status text
    check (auction_status in ('scheduled', 'live', 'sold', 'unsold'));
alter table public.listings add column if not exists winner_id uuid references public.users (id) on delete set null;
alter table public.listings add column if not exists final_price numeric(12,2);
alter table public.listings add column if not exists sold_at timestamptz;

create table if not exists public.bids (
    id uuid primary key default gen_random_uuid(),
    listing_id uuid not null references public.listings (id) on delete cascade,
    bidder_id uuid not null references public.users (id) on delete cascade,
    amount numeric(12,2) not null,
    created_at timestamptz not null default now()
);

create index if not exists idx_bids_listing_id on public.bids (listing_id);
create index if not exists idx_bids_bidder_id on public.bids (bidder_id);

-- ============================================================
-- Newsletter signups (public, no auth required)
-- ============================================================

create table if not exists public.newsletter_subscribers (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    created_at timestamptz not null default now()
);
