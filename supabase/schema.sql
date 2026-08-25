-- =====================================================================
-- SwiftShip Logistics — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type user_role as enum ('customer', 'driver', 'admin');
create type driver_status as enum ('active', 'inactive', 'suspended');
create type shipment_status as enum (
  'pending', 'approved', 'picked_up', 'in_transit',
  'arrived_at_warehouse', 'out_for_delivery', 'delivered', 'cancelled'
);
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type payment_method as enum ('card', 'bank_transfer', 'wallet', 'cash_on_delivery');
create type package_type as enum ('document', 'parcel', 'fragile', 'electronics', 'food', 'other');

-- ---------------------------------------------------------------------
-- users — one row per auth.users entry (customers, drivers, admins alike)
-- ---------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone_number text,
  role user_role not null default 'customer',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index users_role_idx on public.users (role);

-- ---------------------------------------------------------------------
-- drivers — extends a users row where role = 'driver'
-- ---------------------------------------------------------------------
create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  vehicle_type text not null,
  vehicle_plate text,
  license_number text not null,
  status driver_status not null default 'active',
  current_lat double precision,
  current_lng double precision,
  last_location_update timestamptz,
  created_by uuid references public.users (id), -- the admin who created this account
  created_at timestamptz not null default now()
);

create index drivers_status_idx on public.drivers (status);

-- ---------------------------------------------------------------------
-- shipments
-- ---------------------------------------------------------------------
create sequence if not exists tracking_number_seq;

create or replace function generate_tracking_number()
returns text
language plpgsql
as $$
declare
  next_val bigint;
begin
  next_val := nextval('tracking_number_seq');
  return 'SS-' || to_char(now(), 'YYYY') || '-' || lpad(next_val::text, 6, '0');
end;
$$;

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  tracking_number text not null unique default generate_tracking_number(),
  customer_id uuid not null references public.users (id) on delete cascade,
  driver_id uuid references public.drivers (id) on delete set null,

  sender_name text not null,
  sender_phone text not null,
  receiver_name text not null,
  receiver_phone text not null,

  pickup_address text not null,
  delivery_address text not null,

  package_type package_type not null default 'parcel',
  weight_kg numeric(8, 2) not null check (weight_kg > 0),
  price numeric(10, 2) not null check (price >= 0),

  status shipment_status not null default 'pending',
  estimated_delivery timestamptz,
  proof_of_delivery_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shipments_customer_idx on public.shipments (customer_id);
create index shipments_driver_idx on public.shipments (driver_id);
create index shipments_status_idx on public.shipments (status);
create index shipments_tracking_idx on public.shipments (tracking_number);

-- ---------------------------------------------------------------------
-- shipment_events — append-only tracking history / audit trail
-- ---------------------------------------------------------------------
create table public.shipment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  status shipment_status not null,
  note text,
  lat double precision,
  lng double precision,
  created_by uuid references public.users (id),
  created_at timestamptz not null default now()
);

create index shipment_events_shipment_idx on public.shipment_events (shipment_id, created_at);

-- ---------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments (id) on delete cascade,
  customer_id uuid not null references public.users (id) on delete cascade,
  amount numeric(10, 2) not null check (amount >= 0),
  payment_status payment_status not null default 'pending',
  payment_method payment_method not null,
  reference text,
  created_at timestamptz not null default now()
);

create index payments_customer_idx on public.payments (customer_id);
create index payments_shipment_idx on public.payments (shipment_id);

-- ---------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at before update on public.users
  for each row execute function set_updated_at();

create trigger shipments_set_updated_at before update on public.shipments
  for each row execute function set_updated_at();

-- Auto-log a shipment_events row whenever a shipment's status changes.
create or replace function log_shipment_status_change()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') or (old.status is distinct from new.status) then
    insert into public.shipment_events (shipment_id, status, created_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger shipments_log_status
  after insert or update of status on public.shipments
  for each row execute function log_shipment_status_change();

-- ---------------------------------------------------------------------
-- New auth.users -> public.users bridge
-- Customers self-signup through Supabase Auth; this trigger creates
-- their profile row automatically. Driver profiles are inserted
-- explicitly by the admin action instead (see app/(dashboard)/admin
-- driver creation), which sets role='driver' directly.
-- ---------------------------------------------------------------------
create or replace function handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, first_name, last_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'customer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

-- ---------------------------------------------------------------------
-- Helper: current caller's role, used throughout RLS policies
-- ---------------------------------------------------------------------
create or replace function auth_role()
returns user_role
language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function auth_driver_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.drivers where user_id = auth.uid();
$$;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.users enable row level security;
alter table public.drivers enable row level security;
alter table public.shipments enable row level security;
alter table public.shipment_events enable row level security;
alter table public.payments enable row level security;

-- ---------------------------- users ----------------------------------
create policy "Users can view their own profile"
  on public.users for select
  using (id = auth.uid());

create policy "Admins can view all users"
  on public.users for select
  using (auth_role() = 'admin');

create policy "Users can update their own profile"
  on public.users for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.users where id = auth.uid()));
  -- ^ users can edit their own name/phone/avatar, but cannot change their own role.

create policy "Admins can update any user"
  on public.users for update
  using (auth_role() = 'admin');

create policy "Admins can insert users"
  on public.users for insert
  with check (auth_role() = 'admin');

create policy "Admins can delete users"
  on public.users for delete
  using (auth_role() = 'admin');

-- --------------------------- drivers -----------------------------------
create policy "Drivers can view their own driver record"
  on public.drivers for select
  using (user_id = auth.uid());

create policy "Admins can view all drivers"
  on public.drivers for select
  using (auth_role() = 'admin');

create policy "Drivers can update their own location/status"
  on public.drivers for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Only admins can create driver records"
  on public.drivers for insert
  with check (auth_role() = 'admin');

create policy "Only admins can delete driver records"
  on public.drivers for delete
  using (auth_role() = 'admin');

create policy "Only admins can fully update driver records"
  on public.drivers for update
  using (auth_role() = 'admin');

-- -------------------------- shipments ------------------------------
create policy "Customers can view their own shipments"
  on public.shipments for select
  using (customer_id = auth.uid());

create policy "Drivers can view shipments assigned to them"
  on public.shipments for select
  using (driver_id = auth_driver_id());

create policy "Admins can view all shipments"
  on public.shipments for select
  using (auth_role() = 'admin');

create policy "Customers can create their own shipments"
  on public.shipments for insert
  with check (customer_id = auth.uid() and auth_role() = 'customer');

create policy "Customers can cancel their own pending shipments"
  on public.shipments for update
  using (customer_id = auth.uid() and status in ('pending', 'approved'))
  with check (customer_id = auth.uid());

create policy "Drivers can update status on their assigned shipments"
  on public.shipments for update
  using (driver_id = auth_driver_id())
  with check (driver_id = auth_driver_id());

create policy "Admins can manage all shipments"
  on public.shipments for all
  using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

-- ---------------------- shipment_events ------------------------------
create policy "View events for shipments you can see"
  on public.shipment_events for select
  using (
    exists (
      select 1 from public.shipments s
      where s.id = shipment_id
        and (
          s.customer_id = auth.uid()
          or s.driver_id = auth_driver_id()
          or auth_role() = 'admin'
        )
    )
  );

create policy "Drivers and admins can add events to reachable shipments"
  on public.shipment_events for insert
  with check (
    exists (
      select 1 from public.shipments s
      where s.id = shipment_id
        and (s.driver_id = auth_driver_id() or auth_role() = 'admin')
    )
  );

-- --------------------------- payments --------------------------------
create policy "Customers can view their own payments"
  on public.payments for select
  using (customer_id = auth.uid());

create policy "Admins can view all payments"
  on public.payments for select
  using (auth_role() = 'admin');

create policy "Customers can create payments for their own shipments"
  on public.payments for insert
  with check (
    customer_id = auth.uid()
    and exists (select 1 from public.shipments s where s.id = shipment_id and s.customer_id = auth.uid())
  );

create policy "Admins can manage all payments"
  on public.payments for all
  using (auth_role() = 'admin')
  with check (auth_role() = 'admin');

-- =====================================================================
-- Public tracking lookup
--
-- The landing page and /track/[trackingNumber] let ANYONE look up a
-- shipment by tracking number without logging in. RLS is row-level only —
-- it can't hide individual columns like sender/receiver phone numbers or
-- price from an anonymous caller who's allowed to see the row at all.
-- So instead of granting anon a SELECT policy on public.shipments
-- directly, we expose a SECURITY DEFINER function that returns only the
-- safe subset of columns. The app's public tracking page calls this
-- function (via an RPC call) rather than querying the table.
-- =====================================================================
create or replace function get_public_tracking(p_tracking_number text)
returns table (
  tracking_number text,
  status shipment_status,
  pickup_city text,
  delivery_city text,
  estimated_delivery timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    s.tracking_number,
    s.status,
    split_part(s.pickup_address, ',', 1) as pickup_city,
    split_part(s.delivery_address, ',', 1) as delivery_city,
    s.estimated_delivery,
    s.created_at
  from public.shipments s
  where s.tracking_number = p_tracking_number;
$$;

grant execute on function get_public_tracking(text) to anon, authenticated;

-- Matching narrow view of shipment_events for the same public lookup —
-- status + timestamp only, never the `note` field or who logged it.
create or replace function get_public_tracking_events(p_tracking_number text)
returns table (
  status shipment_status,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select e.status, e.created_at
  from public.shipment_events e
  join public.shipments s on s.id = e.shipment_id
  where s.tracking_number = p_tracking_number
  order by e.created_at asc;
$$;

grant execute on function get_public_tracking_events(text) to anon, authenticated;

-- =====================================================================
-- Storage buckets: avatars (public read) and proof-of-delivery (private)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('proof-of-delivery', 'proof-of-delivery', false)
on conflict (id) do nothing;

create policy "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Drivers/admins can upload proof of delivery"
  on storage.objects for insert
  with check (
    bucket_id = 'proof-of-delivery'
    and (auth_role() in ('driver', 'admin'))
  );

create policy "Shipment participants can view proof of delivery"
  on storage.objects for select
  using (
    bucket_id = 'proof-of-delivery'
    and (
      auth_role() = 'admin'
      or exists (
        select 1 from public.shipments s
        where s.proof_of_delivery_url = name
          and (s.customer_id = auth.uid() or s.driver_id = auth_driver_id())
      )
    )
  );

-- =====================================================================
-- Realtime: broadcast shipment + location changes to subscribers
-- =====================================================================
alter publication supabase_realtime add table public.shipments;
alter publication supabase_realtime add table public.shipment_events;
alter publication supabase_realtime add table public.drivers;
