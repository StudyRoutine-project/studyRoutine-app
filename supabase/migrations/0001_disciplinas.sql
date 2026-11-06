-- cria schema
create schema if not exists privado;
revoke all on schema privado from public, anon, authenticated;

-- cria tabela de disciplinas
create table public.disciplinas (
  id uuid primary key,
  usuario_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  nome text not null,
  descricao text,
  cor text not null,
  criada_em timestamptz not null default now(),
  atualizada_em timestamptz not null default now(),
  excluida boolean not null default false,
  constraint disciplinas_nome_preenchido check (nome ~ '[^[:space:]]'),
  constraint disciplinas_cor_hexadecimal check (cor ~ '^#[0-9A-Fa-f]{6}$')
);

create index disciplinas_usuario_atualizacao_idx
  on public.disciplinas (usuario_id, atualizada_em, id);

-- mantém ID, conta e data de criação
create function privado.proteger_metadados_disciplina()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.criada_em := clock_timestamp();
    new.atualizada_em := new.criada_em;
  else
    if new.id is distinct from old.id
      or new.usuario_id is distinct from old.usuario_id
      or new.criada_em is distinct from old.criada_em then
      raise exception using
        errcode = '22023',
        message = 'Identificador, proprietário e criação da disciplina não podem ser alterados.';
    end if;

    new.atualizada_em := greatest(
      clock_timestamp(),
      old.atualizada_em + interval '1 microsecond'
    );
  end if;

  return new;
end;
$$;

revoke all on function privado.proteger_metadados_disciplina()
  from public, anon, authenticated;

create trigger proteger_metadados_disciplina
  before insert or update on public.disciplinas
  for each row execute function privado.proteger_metadados_disciplina();

-- cada conta pode acessar só suas disciplinas
alter table public.disciplinas enable row level security;

revoke all on table public.disciplinas from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select, insert, update on table public.disciplinas to authenticated;
grant all on table public.disciplinas to service_role;

create policy disciplinas_ler_proprias
  on public.disciplinas for select
  to authenticated
  using ((select auth.uid()) = usuario_id);

create policy disciplinas_cadastrar_proprias
  on public.disciplinas for insert
  to authenticated
  with check ((select auth.uid()) = usuario_id);

create policy disciplinas_editar_proprias
  on public.disciplinas for update
  to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);
