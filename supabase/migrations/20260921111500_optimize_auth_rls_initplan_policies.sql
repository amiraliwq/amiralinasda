-- Performance hardening applied to production Supabase on 2026-09-21.
-- Keep auth.uid() initialization outside per-row evaluation in the user-owned RLS policies.

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles for select to public
using (id = (select auth.uid()));

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update to public
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "users read own enrollments" on public.enrollments;
create policy "users read own enrollments" on public.enrollments for select to public
using (user_id = (select auth.uid()));

drop policy if exists "users create own enrollments" on public.enrollments;
create policy "users create own enrollments" on public.enrollments for insert to public
with check (user_id = (select auth.uid()));

drop policy if exists "users create own orders" on public.orders;
create policy "users create own orders" on public.orders for insert to public
with check (user_id = (select auth.uid()));

drop policy if exists "users read own orders" on public.orders;
create policy "users read own orders" on public.orders for select to public
using (user_id = (select auth.uid()));

drop policy if exists "users create own order items" on public.order_items;
create policy "users create own order items" on public.order_items for insert to public
with check (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = (select auth.uid())
  )
);

drop policy if exists "users read own order items" on public.order_items;
create policy "users read own order items" on public.order_items for select to public
using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.user_id = (select auth.uid())
  )
);
