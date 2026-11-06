-- impede vínculos entre contas
alter table public.disciplinas
  add constraint disciplinas_id_usuario_unique unique (id, usuario_id);

-- cria tabela de atividades
create table public.atividades (
  id uuid primary key,
  usuario_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  disciplina_id uuid not null,
  titulo text not null,
  tipo text not null,
  data date not null,
  horario time,
  descricao text,
  concluida boolean not null default false,
  excluida boolean not null default false,
  criada_em timestamptz not null default now(),
  atualizada_em timestamptz not null default now(),
  constraint atividades_disciplina_propria foreign key (disciplina_id, usuario_id)
    references public.disciplinas (id, usuario_id) on delete cascade,
  constraint atividades_titulo_preenchido check (titulo ~ '[^[:space:]]'),
  constraint atividades_tipo_valido check (tipo in ('tarefa', 'trabalho', 'prova', 'estudo')),
  constraint atividades_data_finita check (isfinite(data))
);

create index atividades_disciplina_usuario_idx
  on public.atividades (disciplina_id, usuario_id);
create index atividades_usuario_data_idx
  on public.atividades (usuario_id, data, id);

-- protege ID, conta e datas nas tabelas
alter function privado.proteger_metadados_disciplina() rename to proteger_metadados;

create or replace function privado.proteger_metadados()
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
      raise exception using errcode = '22023',
        message = 'Identificador, proprietário e criação não podem ser alterados.';
    end if;

    new.atualizada_em := greatest(
      clock_timestamp(),
      old.atualizada_em + interval '1 microsecond'
    );
  end if;

  return new;
end;
$$;

create trigger proteger_metadados_atividade
  before insert or update on public.atividades
  for each row execute function privado.proteger_metadados();

-- cada conta só pode acessar suas atividades
alter table public.atividades enable row level security;
revoke all on table public.atividades from public, anon, authenticated;
grant select on table public.atividades to authenticated;
grant all on table public.atividades to service_role;

create policy atividades_ler_proprias
  on public.atividades for select to authenticated
  using ((select auth.uid()) = usuario_id);

create policy atividades_cadastrar_proprias
  on public.atividades for insert to authenticated
  with check ((select auth.uid()) = usuario_id);

create policy atividades_editar_proprias
  on public.atividades for update to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);
