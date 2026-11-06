begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(2);

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
  update public.disciplinas set usuario_id = '22222222-2222-4222-8222-222222222222'
  where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
$$, '22023', null, 'o proprietário não pode ser alterado');

set local role authenticated;

set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select results_eq('select nome from public.disciplinas', $$values ('Matemática'::text)$$,
  'a leitura respeita a conta');


reset role;
select * from finish();
rollback;
