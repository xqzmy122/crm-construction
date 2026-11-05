-- RLS helpers must be executable by authenticated (policies call them).
-- Users without app_metadata.role cannot be created via public signup.

grant usage on schema private to authenticated;
grant execute on function private.is_manager() to authenticated;

revoke all on function public.transition_task(uuid, public.task_status, text) from public, anon;
grant execute on function public.transition_task(uuid, public.task_status, text) to authenticated;

create or replace function private.require_assigned_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if nullif(new.raw_app_meta_data ->> 'role', '') is null then
    raise exception 'Регистрация закрыта. Пользователя создаёт администратор.';
  end if;
  return new;
end;
$$;

drop trigger if exists require_assigned_role on auth.users;

create trigger require_assigned_role
before insert on auth.users
for each row
execute function private.require_assigned_role();
