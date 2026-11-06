begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(5);

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

set local role anon;
select throws_ok('select public.baixar_dados()', '42501', null,
  'visitante não baixa dados');
select throws_ok($$
  select public.sincronizar_operacao(gen_random_uuid(), 'disciplinas', gen_random_uuid(), '{}')
$$, '42501', null, 'visitante não envia operações');

reset role;
set local role authenticated;

set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select throws_ok('select * from privado.operacoes', '42501', null,
  'bloqueia o acesso direto às confirmações');

select throws_ok($$
  update public.disciplinas set nome = 'Outro nome'
$$, '42501', null, 'só permite alterações pela sincronização');

select throws_ok($$
  select public.sincronizar_operacao(
    gen_random_uuid(), 'disciplinas', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '{"nome":"Outra disciplina","cor":"#5135D9"}'
  )
$$, '42501', null, 'a operação também impede alterar outra conta');

reset role;
select * from finish();
rollback;
