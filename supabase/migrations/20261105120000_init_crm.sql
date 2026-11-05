-- Construction CRM: objects, tasks, status machine, immutable history.
-- Authorization lives in public.profiles.role (not user_metadata).
-- Status changes go through public.transition_task; history is append-only.

create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon, authenticated;

create type public.user_role as enum ('manager', 'executor');
create type public.task_status as enum (
  'new',
  'in_progress',
  'review',
  'accepted',
  'rework'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.user_role not null,
  created_at timestamptz not null default now(),
  constraint profiles_full_name_not_empty check (char_length(trim(full_name)) > 0)
);

create table public.objects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint objects_name_not_empty check (char_length(trim(name)) > 0),
  constraint objects_address_not_empty check (char_length(trim(address)) > 0)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  object_id uuid not null references public.objects (id) on delete cascade,
  assignee_id uuid not null references public.profiles (id),
  author_id uuid not null references public.profiles (id),
  status public.task_status not null default 'new',
  created_at timestamptz not null default now(),
  constraint tasks_title_not_empty check (char_length(trim(title)) > 0)
);

create table public.task_status_history (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  from_status public.task_status,
  to_status public.task_status not null,
  changed_by uuid not null references public.profiles (id),
  comment text,
  created_at timestamptz not null default now(),
  constraint history_comment_length check (
    comment is null or char_length(comment) <= 2000
  )
);

create index tasks_object_id_idx on public.tasks (object_id);
create index tasks_assignee_id_idx on public.tasks (assignee_id);
create index tasks_status_idx on public.tasks (status);
create index task_status_history_task_id_idx on public.task_status_history (task_id, created_at);

-- ---------------------------------------------------------------------------
-- Helpers (security definer, private schema)
-- ---------------------------------------------------------------------------

create or replace function private.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'manager'
  );
$$;

create or replace function private.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;

create or replace function private.is_executor_user(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = p_id
      and role = 'executor'
  );
$$;

create or replace function private.seed_bypass()
returns boolean
language sql
stable
set search_path = public
as $$
  select current_user in ('postgres', 'supabase_admin')
    and coalesce(current_setting('app.allow_seed', true), '') = 'true';
$$;

create or replace function private.write_history(
  p_task_id uuid,
  p_from public.task_status,
  p_to public.task_status,
  p_changed_by uuid,
  p_comment text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.writing_history', 'true', true);
  insert into public.task_status_history (
    task_id,
    from_status,
    to_status,
    changed_by,
    comment
  )
  values (
    p_task_id,
    p_from,
    p_to,
    p_changed_by,
    nullif(trim(coalesce(p_comment, '')), '')
  );
end;
$$;

create or replace function private.guard_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if private.is_manager() or current_user in ('postgres', 'supabase_admin') then
      return old;
    end if;
    raise exception 'История статусов неизменяема';
  end if;

  if tg_op = 'UPDATE' then
    raise exception 'История статусов неизменяема';
  end if;

  if coalesce(current_setting('app.writing_history', true), '') is distinct from 'true' then
    raise exception 'Историю можно писать только через смену статуса';
  end if;

  return new;
end;
$$;

create trigger task_status_history_guard
before insert or update or delete on public.task_status_history
for each row
execute function private.guard_history();

create or replace function private.guard_task_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if private.seed_bypass() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if not private.is_manager() then
      raise exception 'Только постановщик может создавать задачи';
    end if;
    if new.status is distinct from 'new' then
      raise exception 'Новая задача должна быть в статусе «Новая»';
    end if;
    if new.author_id is distinct from v_uid then
      raise exception 'Автор задачи должен быть текущим пользователем';
    end if;
    if not private.is_executor_user(new.assignee_id) then
      raise exception 'Исполнителем можно назначить только сотрудника с ролью исполнителя';
    end if;
    return new;
  end if;

  if new.author_id is distinct from old.author_id then
    raise exception 'Автор задачи не меняется';
  end if;
  if new.created_at is distinct from old.created_at then
    raise exception 'Дата создания не меняется';
  end if;

  if new.status is distinct from old.status then
    if coalesce(current_setting('app.transitioning', true), '') is distinct from 'true' then
      raise exception 'Статус меняется только через допустимый переход';
    end if;
  end if;

  if private.current_role() = 'executor' then
    if new.title is distinct from old.title
      or new.description is distinct from old.description
      or new.object_id is distinct from old.object_id
      or new.assignee_id is distinct from old.assignee_id then
      raise exception 'Исполнитель не может редактировать поля задачи';
    end if;
  elsif private.is_manager() then
    if new.assignee_id is distinct from old.assignee_id
      and not private.is_executor_user(new.assignee_id) then
      raise exception 'Исполнителем можно назначить только сотрудника с ролью исполнителя';
    end if;
  else
    raise exception 'Недостаточно прав';
  end if;

  return new;
end;
$$;

create trigger tasks_guard_write
before insert or update on public.tasks
for each row
execute function private.guard_task_write();

create or replace function private.after_task_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if private.seed_bypass() then
    return new;
  end if;
  perform private.write_history(new.id, null, new.status, new.author_id, null);
  return new;
end;
$$;

create trigger tasks_after_insert_history
after insert on public.tasks
for each row
execute function private.after_task_insert();

create or replace function private.guard_object_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if private.seed_bypass() then
    return new;
  end if;
  if not private.is_manager() then
    raise exception 'Только постановщик может менять объекты';
  end if;
  if tg_op = 'INSERT' and new.created_by is distinct from auth.uid() then
    raise exception 'Создатель объекта должен быть текущим пользователем';
  end if;
  if tg_op = 'UPDATE' and new.created_by is distinct from old.created_by then
    raise exception 'Создатель объекта не меняется';
  end if;
  return new;
end;
$$;

create trigger objects_guard_write
before insert or update on public.objects
for each row
execute function private.guard_object_write();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
  v_name text;
begin
  begin
    v_role := nullif(new.raw_app_meta_data ->> 'role', '')::public.user_role;
  exception
    when invalid_text_representation then
      return new;
  end;

  if v_role is null then
    return new;
  end if;

  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    new.email
  );

  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, v_name, v_role)
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- Status transitions
-- ---------------------------------------------------------------------------

create or replace function private.transition_task(
  p_task_id uuid,
  p_new_status public.task_status,
  p_comment text default null
)
returns public.tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role public.user_role;
  v_task public.tasks;
  v_comment text := nullif(trim(coalesce(p_comment, '')), '');
begin
  if v_uid is null then
    raise exception 'Нужна авторизация';
  end if;

  select role into v_role
  from public.profiles
  where id = v_uid;

  if v_role is null then
    raise exception 'Профиль не найден';
  end if;

  select * into v_task
  from public.tasks
  where id = p_task_id
  for update;

  if not found then
    raise exception 'Задача не найдена';
  end if;

  if v_task.status = 'new' and p_new_status = 'in_progress' then
    if v_role <> 'executor' or v_task.assignee_id <> v_uid then
      raise exception 'В работу задачу берёт только назначенный исполнитель';
    end if;
  elsif v_task.status = 'in_progress' and p_new_status = 'review' then
    if v_role <> 'executor' or v_task.assignee_id <> v_uid then
      raise exception 'На проверку задачу отправляет только назначенный исполнитель';
    end if;
  elsif v_task.status = 'review' and p_new_status = 'accepted' then
    if v_role <> 'manager' then
      raise exception 'Принять задачу может только постановщик';
    end if;
  elsif v_task.status = 'review' and p_new_status = 'rework' then
    if v_role <> 'manager' then
      raise exception 'Вернуть на доработку может только постановщик';
    end if;
    if v_comment is null then
      raise exception 'Для возврата на доработку нужен комментарий';
    end if;
  elsif v_task.status = 'rework' and p_new_status = 'in_progress' then
    if v_role <> 'executor' or v_task.assignee_id <> v_uid then
      raise exception 'С доработки в работу задачу возвращает только назначенный исполнитель';
    end if;
  else
    raise exception 'Переход % → % запрещён', v_task.status, p_new_status;
  end if;

  perform private.write_history(
    v_task.id,
    v_task.status,
    p_new_status,
    v_uid,
    v_comment
  );

  perform set_config('app.transitioning', 'true', true);

  update public.tasks
  set status = p_new_status
  where id = v_task.id
  returning * into v_task;

  return v_task;
end;
$$;

create or replace function public.transition_task(
  p_task_id uuid,
  p_new_status public.task_status,
  p_comment text default null
)
returns public.tasks
language sql
security definer
set search_path = public
as $$
  select * from private.transition_task(p_task_id, p_new_status, p_comment);
$$;

revoke all on function public.transition_task(uuid, public.task_status, text) from public;
grant execute on function public.transition_task(uuid, public.task_status, text) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.objects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_status_history enable row level security;

revoke all on table public.profiles from anon, authenticated, public;
revoke all on table public.objects from anon, authenticated, public;
revoke all on table public.tasks from anon, authenticated, public;
revoke all on table public.task_status_history from anon, authenticated, public;

grant select on table public.profiles to authenticated;
grant select, insert, update, delete on table public.objects to authenticated;
grant select, insert, update, delete on table public.tasks to authenticated;
grant select on table public.task_status_history to authenticated;

create policy profiles_select
on public.profiles
for select
to authenticated
using (
  private.is_manager()
  or id = auth.uid()
  or exists (
    select 1
    from public.tasks t
    where t.assignee_id = auth.uid()
      and (t.author_id = profiles.id or t.assignee_id = profiles.id)
  )
);

create policy objects_select
on public.objects
for select
to authenticated
using (
  private.is_manager()
  or exists (
    select 1
    from public.tasks t
    where t.object_id = objects.id
      and t.assignee_id = auth.uid()
  )
);

create policy objects_insert
on public.objects
for insert
to authenticated
with check (private.is_manager() and created_by = auth.uid());

create policy objects_update
on public.objects
for update
to authenticated
using (private.is_manager())
with check (private.is_manager());

create policy objects_delete
on public.objects
for delete
to authenticated
using (private.is_manager());

create policy tasks_select
on public.tasks
for select
to authenticated
using (
  private.is_manager()
  or assignee_id = auth.uid()
);

create policy tasks_insert
on public.tasks
for insert
to authenticated
with check (
  private.is_manager()
  and author_id = auth.uid()
  and status = 'new'
);

create policy tasks_update
on public.tasks
for update
to authenticated
using (private.is_manager())
with check (private.is_manager());

create policy tasks_delete
on public.tasks
for delete
to authenticated
using (private.is_manager());

create policy history_select
on public.task_status_history
for select
to authenticated
using (
  private.is_manager()
  or exists (
    select 1
    from public.tasks t
    where t.id = task_status_history.task_id
      and t.assignee_id = auth.uid()
  )
);

-- No insert/update/delete policies on history: API clients cannot mutate it.
