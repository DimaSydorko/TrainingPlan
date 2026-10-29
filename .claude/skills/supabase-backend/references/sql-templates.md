# SQL templates

## Shared (first migration)

```sql
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
```

## Owner table

```sql
create table public.workouts (
  id uuid primary key,
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index workouts_owner_id_idx on public.workouts (owner_id);
alter table public.workouts enable row level security;

create policy workouts_select_own on public.workouts for select to authenticated using ((select auth.uid()) = owner_id);
create policy workouts_insert_own on public.workouts for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy workouts_update_own on public.workouts for update to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy workouts_delete_own on public.workouts for delete to authenticated using ((select auth.uid()) = owner_id);

create trigger workouts_updated_at before update on public.workouts for each row execute function public.set_updated_at();
```

Public-read (publications): select policy `to anon, authenticated using (is_published)`; write policies owner-only; `is_published` changed only via RPC/Edge Function (column grants as in `profiles`).

## RPC (atomic / protected)

```sql
create or replace function public.publish_plan(plan_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.plans set is_published = true
  where id = plan_id and owner_id = (select auth.uid());
  if not found then raise exception 'not found' using errcode = 'P0002'; end if;
end $$;
revoke execute on function public.publish_plan(uuid) from public, anon;
grant execute on function public.publish_plan(uuid) to authenticated;
```

## Storage

```sql
insert into storage.buckets (id, name, public) values ('user-photos', 'user-photos', false);
create policy user_photos_rw on storage.objects for all to authenticated
  using (bucket_id = 'user-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'user-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
```

## pgTAP RLS test

```sql
begin;
select plan(2);
insert into auth.users (id) values ('00000000-0000-0000-0000-00000000000a'), ('00000000-0000-0000-0000-00000000000b');
insert into public.workouts (id, owner_id, name)
  values (gen_random_uuid(), '00000000-0000-0000-0000-00000000000a', 'A');
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000b"}';
select is_empty('select * from public.workouts', 'B cannot read A');
select results_eq('with d as (delete from public.workouts returning 1) select count(*) from d', array[0::bigint], 'B cannot delete A');
select * from finish();
rollback;
```
