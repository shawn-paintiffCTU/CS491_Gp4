-- Plethora of PIES!
-- Proposed PostgreSQL database schema. It is not connected to the current app.

-- Top-level groups such as Pizzas, Sides, and Drinks.
CREATE TABLE categories (
    category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Products customers see on the menu.
CREATE TABLE menu_items (
    menu_item_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    base_price_cents INTEGER NOT NULL CHECK (base_price_cents >= 0),
    image_path VARCHAR(255),
    is_customizable BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT fk_menu_item_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE RESTRICT
);

-- Price adjustments available in the pizza customizer.
CREATE TABLE pizza_sizes (
    size_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    price_adjustment_cents INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE crusts (
    crust_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    price_adjustment_cents INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Individual ingredients customers can add to a pizza.
CREATE TABLE toppings (
    topping_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Many-to-many link between menu pizzas and their included toppings.
CREATE TABLE menu_item_toppings (
    menu_item_id INTEGER NOT NULL,
    topping_id INTEGER NOT NULL,
    is_included BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (menu_item_id, topping_id),

    CONSTRAINT fk_item_topping_menu_item
        FOREIGN KEY (menu_item_id)
        REFERENCES menu_items(menu_item_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_item_topping_topping
        FOREIGN KEY (topping_id)
        REFERENCES toppings(topping_id)
        ON DELETE RESTRICT
);

-- Indexes make common category and active-item lookups faster.
CREATE INDEX idx_menu_items_category
    ON menu_items(category_id);

CREATE INDEX idx_menu_items_active
    ON menu_items(is_active);

CREATE INDEX idx_toppings_active
    ON toppings(is_active);


-- ============================================================
-- Sprint 2: User profiles and role-based access control
-- ============================================================

-- Roles recognized by the application.
do $$
begin
  create type public.app_role
    as enum ('customer', 'manager', 'admin');
exception
  when duplicate_object then null;
end
$$;

-- Customer information that may safely be accessed by the application.
create table if not exists public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  full_name text
    check (char_length(full_name) <= 100),

  phone text
    check (char_length(phone) <= 30),

  created_at timestamptz
    not null default now(),

  updated_at timestamptz
    not null default now()
);

-- Roles are kept separate so customers cannot promote themselves
-- while editing ordinary profile information.
create table if not exists public.user_roles (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  role public.app_role
    not null default 'customer',

  created_at timestamptz
    not null default now(),

  updated_at timestamptz
    not null default now()
);

-- Automatically update the modification timestamp.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at
  on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists user_roles_set_updated_at
  on public.user_roles;

create trigger user_roles_set_updated_at
before update on public.user_roles
for each row
execute function public.set_updated_at();

-- Automatically give every new authenticated user a profile and
-- the customer role. Website registration can never choose admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    full_name
  )
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (
    user_id,
    role
  )
  values (
    new.id,
    'customer'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created
  on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Create records for accounts that existed before this trigger.
insert into public.profiles (
  id,
  full_name
)
select
  id,
  nullif(raw_user_meta_data ->> 'full_name', '')
from auth.users
on conflict (id) do nothing;

insert into public.user_roles (
  user_id,
  role
)
select
  id,
  'customer'
from auth.users
on conflict (user_id) do nothing;

-- Helper used by secure database policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all
  on function public.is_admin()
  from public;

grant execute
  on function public.is_admin()
  to authenticated;

-- Remove general access before granting only what is required.
revoke all on public.profiles from anon;
revoke all on public.user_roles from anon;

revoke all on public.profiles from authenticated;
revoke all on public.user_roles from authenticated;

grant select, update
  on public.profiles
  to authenticated;

grant select
  on public.user_roles
  to authenticated;

grant usage
  on type public.app_role
  to authenticated;

-- Row Level Security remains the final access-control layer.
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

drop policy if exists "Users can view their own profile"
  on public.profiles;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile"
  on public.profiles;

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Admins can view all profiles"
  on public.profiles;

create policy "Admins can view all profiles"
on public.profiles
for select
to authenticated
using ((select public.is_admin()));

drop policy if exists "Users can view their own role"
  on public.user_roles;

create policy "Users can view their own role"
on public.user_roles
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Admins can view all roles"
  on public.user_roles;

create policy "Admins can view all roles"
on public.user_roles
for select
to authenticated
using ((select public.is_admin()));