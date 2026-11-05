-- Demo users, objects and tasks. Run as a privileged role, not from the client.
-- Passwords are only for the test assignment review.

select set_config('app.allow_seed', 'true', true);
select set_config('app.writing_history', 'true', true);

create or replace function private.seed_user(
  p_id uuid,
  p_email text,
  p_password text,
  p_full_name text,
  p_role public.user_role
)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    p_id,
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', jsonb_build_array('email'),
      'role', p_role
    ),
    jsonb_build_object('full_name', p_full_name),
    now(),
    now(),
    null,
    null,
    null,
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    gen_random_uuid(),
    p_id,
    jsonb_build_object('sub', p_id::text, 'email', p_email, 'email_verified', true),
    'email',
    p_id::text,
    now(),
    now(),
    now()
  );
end;
$$;

select private.seed_user(
  '11111111-1111-4111-8111-111111111111',
  'anna@crm-demo.com',
  'Manager123!',
  'Анна Петрова',
  'manager'
);

select private.seed_user(
  '44444444-4444-4444-8444-444444444444',
  'elena@crm-demo.com',
  'Elena123456!',
  'Елена Орлова',
  'manager'
);

select private.seed_user(
  '22222222-2222-4222-8222-222222222222',
  'ivan@crm-demo.com',
  'Ivan123456!',
  'Иван Сидоров',
  'executor'
);

select private.seed_user(
  '33333333-3333-4333-8333-333333333333',
  'olga@crm-demo.com',
  'Olga123456!',
  'Ольга Козлова',
  'executor'
);

insert into public.objects (id, name, address, created_by, created_at)
values
  (
    'aaaa1111-0000-4000-8000-000000000001',
    'ЖК «Северный»',
    'ул. Ленина, 15',
    '11111111-1111-4111-8111-111111111111',
    now() - interval '12 days'
  ),
  (
    'aaaa1111-0000-4000-8000-000000000002',
    'БЦ «Горизонт»',
    'пр. Независимости, 42',
    '11111111-1111-4111-8111-111111111111',
    now() - interval '9 days'
  ),
  (
    'aaaa1111-0000-4000-8000-000000000003',
    'Склад «Логистик»',
    'ул. Промышленная, 8',
    '44444444-4444-4444-8444-444444444444',
    now() - interval '6 days'
  );

insert into public.tasks (
  id, title, description, object_id, assignee_id, author_id, status, created_at
)
values
  (
    'bbbb1111-0000-4000-8000-000000000001',
    'Заливка фундамента секции А',
    'Проверить опалубку, залить бетон М350, закрыть плёнкой.',
    'aaaa1111-0000-4000-8000-000000000001',
    '22222222-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111',
    'accepted',
    now() - interval '11 days'
  ),
  (
    'bbbb1111-0000-4000-8000-000000000002',
    'Разводка электрики 1 этаж',
    'Кабель ВВГнг, щит учёта, проверка сопротивления изоляции.',
    'aaaa1111-0000-4000-8000-000000000001',
    '22222222-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111',
    'in_progress',
    now() - interval '5 days'
  ),
  (
    'bbbb1111-0000-4000-8000-000000000003',
    'Монтаж кровли паркинга',
    'Профлист, узлы примыкания, водосток.',
    'aaaa1111-0000-4000-8000-000000000001',
    '33333333-3333-4333-8333-333333333333',
    '11111111-1111-4111-8111-111111111111',
    'new',
    now() - interval '1 day'
  ),
  (
    'bbbb1111-0000-4000-8000-000000000004',
    'Пусконаладка вентиляции',
    'Настройка приточных установок, акты замеров.',
    'aaaa1111-0000-4000-8000-000000000002',
    '22222222-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111',
    'review',
    now() - interval '8 days'
  ),
  (
    'bbbb1111-0000-4000-8000-000000000005',
    'Пожарная сигнализация',
    'Извещатели, СОУЭ, вывод на пульт. Вернуть, если нет исполнительной схемы.',
    'aaaa1111-0000-4000-8000-000000000002',
    '33333333-3333-4333-8333-333333333333',
    '44444444-4444-4444-8444-444444444444',
    'rework',
    now() - interval '7 days'
  ),
  (
    'bbbb1111-0000-4000-8000-000000000006',
    'Установка ворот дока 3',
    'Секционные ворота, докшелтер, проверка уплотнения.',
    'aaaa1111-0000-4000-8000-000000000003',
    '33333333-3333-4333-8333-333333333333',
    '44444444-4444-4444-8444-444444444444',
    'in_progress',
    now() - interval '4 days'
  ),
  (
    'bbbb1111-0000-4000-8000-000000000007',
    'Освещение рампы',
    'Светильники IP65, датчики движения, щит освещения.',
    'aaaa1111-0000-4000-8000-000000000003',
    '22222222-2222-4222-8222-222222222222',
    '11111111-1111-4111-8111-111111111111',
    'new',
    now() - interval '2 days'
  );

insert into public.task_status_history (
  task_id, from_status, to_status, changed_by, comment, created_at
)
values
  ('bbbb1111-0000-4000-8000-000000000001', null, 'new', '11111111-1111-4111-8111-111111111111', null, now() - interval '11 days'),
  ('bbbb1111-0000-4000-8000-000000000001', 'new', 'in_progress', '22222222-2222-4222-8222-222222222222', null, now() - interval '10 days'),
  ('bbbb1111-0000-4000-8000-000000000001', 'in_progress', 'review', '22222222-2222-4222-8222-222222222222', null, now() - interval '9 days'),
  ('bbbb1111-0000-4000-8000-000000000001', 'review', 'accepted', '11111111-1111-4111-8111-111111111111', 'Бетон принят, кубики в норме.', now() - interval '8 days'),

  ('bbbb1111-0000-4000-8000-000000000002', null, 'new', '11111111-1111-4111-8111-111111111111', null, now() - interval '5 days'),
  ('bbbb1111-0000-4000-8000-000000000002', 'new', 'in_progress', '22222222-2222-4222-8222-222222222222', null, now() - interval '4 days'),

  ('bbbb1111-0000-4000-8000-000000000003', null, 'new', '11111111-1111-4111-8111-111111111111', null, now() - interval '1 day'),

  ('bbbb1111-0000-4000-8000-000000000004', null, 'new', '11111111-1111-4111-8111-111111111111', null, now() - interval '8 days'),
  ('bbbb1111-0000-4000-8000-000000000004', 'new', 'in_progress', '22222222-2222-4222-8222-222222222222', null, now() - interval '6 days'),
  ('bbbb1111-0000-4000-8000-000000000004', 'in_progress', 'review', '22222222-2222-4222-8222-222222222222', null, now() - interval '1 day'),

  ('bbbb1111-0000-4000-8000-000000000005', null, 'new', '44444444-4444-4444-8444-444444444444', null, now() - interval '7 days'),
  ('bbbb1111-0000-4000-8000-000000000005', 'new', 'in_progress', '33333333-3333-4333-8333-333333333333', null, now() - interval '5 days'),
  ('bbbb1111-0000-4000-8000-000000000005', 'in_progress', 'review', '33333333-3333-4333-8333-333333333333', null, now() - interval '3 days'),
  ('bbbb1111-0000-4000-8000-000000000005', 'review', 'rework', '44444444-4444-4444-8444-444444444444', 'Нет исполнительной схемы и акта скрытых работ. Добавьте и верните на проверку.', now() - interval '2 days'),

  ('bbbb1111-0000-4000-8000-000000000006', null, 'new', '44444444-4444-4444-8444-444444444444', null, now() - interval '4 days'),
  ('bbbb1111-0000-4000-8000-000000000006', 'new', 'in_progress', '33333333-3333-4333-8333-333333333333', null, now() - interval '3 days'),

  ('bbbb1111-0000-4000-8000-000000000007', null, 'new', '11111111-1111-4111-8111-111111111111', null, now() - interval '2 days');
