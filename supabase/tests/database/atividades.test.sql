begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(1);

insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'ana@example.invalid'),
  ('22222222-2222-4222-8222-222222222222', 'bruno@example.invalid');

insert into public.disciplinas (id, usuario_id, nome, cor) values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'Matemática', '#7C5CFF'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '22222222-2222-4222-8222-222222222222',
    'Física', '#5135D9'
  );

select throws_ok($$
  insert into public.atividades (id, usuario_id, disciplina_id, titulo, tipo, data) values (
    gen_random_uuid(), '11111111-1111-4111-8111-111111111111',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Revisar', 'estudo', '2026-11-17'
  )
$$, '23503', null, 'não permite vínculos entre contas');

select * from finish();
rollback;
