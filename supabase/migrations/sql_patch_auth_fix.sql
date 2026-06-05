-- Run this exact SQL in your live Supabase SQL Editor to fix the "Database error saving new user" bug

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;
