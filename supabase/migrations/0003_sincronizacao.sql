-- guarda respostas pra reenvios
create table privado.operacoes (
  usuario_id uuid not null references auth.users (id) on delete cascade,
  id uuid not null,
  entidade text not null,
  registro_id uuid not null,
  dados jsonb not null,
  resposta jsonb not null,
  primary key (usuario_id, id)
);

alter table privado.operacoes enable row level security;
revoke all on table privado.operacoes from public, anon, authenticated;
revoke insert, update on table public.disciplinas from authenticated;

-- salva alteração e confirmação
create function privado.aplicar_operacao(
  p_operacao_id uuid,
  p_entidade text,
  p_registro_id uuid,
  p_dados jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := auth.uid();
  v_anterior privado.operacoes%rowtype;
  v_registro jsonb;
  v_resposta jsonb;
begin
  if v_usuario is null then
    raise exception using errcode = '42501', message = 'Entre na conta para sincronizar.';
  end if;

  if p_operacao_id is null or p_registro_id is null
    or p_entidade is null or p_entidade not in ('disciplinas', 'atividades')
    or p_dados is null or jsonb_typeof(p_dados) <> 'object' then
    raise exception using errcode = '22023', message = 'Operação inválida.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_usuario::text, 0));

  select * into v_anterior from privado.operacoes
  where usuario_id = v_usuario and id = p_operacao_id;

  if found then
    if v_anterior.entidade <> p_entidade
      or v_anterior.registro_id <> p_registro_id
      or v_anterior.dados <> p_dados then
      raise exception using errcode = '22023',
        message = 'O ID da operação já foi usado com outros dados.';
    end if;
    return v_anterior.resposta;
  end if;

  if p_entidade = 'disciplinas' then
    if p_dados - array['nome', 'descricao', 'cor', 'excluida'] <> '{}'::jsonb then
      raise exception using errcode = '22023', message = 'Campo de disciplina inválido.';
    end if;

    insert into public.disciplinas as d (
      id, usuario_id, nome, descricao, cor, excluida
    )
    values (
      p_registro_id, v_usuario, p_dados ->> 'nome', p_dados ->> 'descricao',
      p_dados ->> 'cor', coalesce((p_dados ->> 'excluida')::boolean, false)
    )
    on conflict (id) do update set
      nome = excluded.nome,
      descricao = excluded.descricao,
      cor = excluded.cor,
      excluida = excluded.excluida
    where d.usuario_id = v_usuario
    returning to_jsonb(d) into v_registro;

    -- marca atividades como excluídas
    if (v_registro ->> 'excluida')::boolean then
      update public.atividades set excluida = true
      where disciplina_id = p_registro_id and usuario_id = v_usuario and not excluida;
    end if;
  else
    if p_dados - array[
      'disciplina_id', 'titulo', 'tipo', 'data', 'horario', 'descricao', 'concluida', 'excluida'
    ] <> '{}'::jsonb then
      raise exception using errcode = '22023', message = 'Campo de atividade inválido.';
    end if;

    if not exists (
      select 1 from public.disciplinas
      where id = (p_dados ->> 'disciplina_id')::uuid and usuario_id = v_usuario
        and (not excluida or coalesce((p_dados ->> 'excluida')::boolean, false))
    ) then
      raise exception using errcode = '23503',
        message = 'Sincronize uma disciplina ativa desta conta antes da atividade.';
    end if;

    insert into public.atividades as a (
      id, usuario_id, disciplina_id, titulo, tipo, data, horario, descricao, concluida, excluida
    )
    values (
      p_registro_id, v_usuario, (p_dados ->> 'disciplina_id')::uuid,
      p_dados ->> 'titulo', p_dados ->> 'tipo', (p_dados ->> 'data')::date,
      (p_dados ->> 'horario')::time, p_dados ->> 'descricao',
      coalesce((p_dados ->> 'concluida')::boolean, false),
      coalesce((p_dados ->> 'excluida')::boolean, false)
    )
    on conflict (id) do update set
      disciplina_id = excluded.disciplina_id,
      titulo = excluded.titulo,
      tipo = excluded.tipo,
      data = excluded.data,
      horario = excluded.horario,
      descricao = excluded.descricao,
      concluida = excluded.concluida,
      excluida = excluded.excluida
    where a.usuario_id = v_usuario
    returning to_jsonb(a) into v_registro;
  end if;

  if v_registro is null then
    raise exception using errcode = '42501', message = 'Registro indisponível para esta conta.';
  end if;

  v_resposta := jsonb_build_object(
    'operacao_id', p_operacao_id, 'entidade', p_entidade, 'registro', v_registro
  );

  insert into privado.operacoes (usuario_id, id, entidade, registro_id, dados, resposta)
  values (v_usuario, p_operacao_id, p_entidade, p_registro_id, p_dados, v_resposta);

  return v_resposta;
end;
$$;

revoke all on function privado.aplicar_operacao(uuid, text, uuid, jsonb)
  from public, anon, authenticated;
grant usage on schema privado to authenticated;
grant execute on function privado.aplicar_operacao(uuid, text, uuid, jsonb) to authenticated;

-- recebe alterações pela API
create function public.sincronizar_operacao(
  p_operacao_id uuid,
  p_entidade text,
  p_registro_id uuid,
  p_dados jsonb
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select privado.aplicar_operacao(p_operacao_id, p_entidade, p_registro_id, p_dados);
$$;

revoke all on function public.sincronizar_operacao(uuid, text, uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.sincronizar_operacao(uuid, text, uuid, jsonb) to authenticated;

-- baixa os dados da conta
create function public.baixar_dados()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'disciplinas', coalesce(
      (select jsonb_agg(d order by id) from public.disciplinas d), '[]'::jsonb
    ),
    'atividades', coalesce(
      (select jsonb_agg(a order by id) from public.atividades a), '[]'::jsonb
    )
  );
$$;

revoke all on function public.baixar_dados() from public, anon, authenticated;
grant execute on function public.baixar_dados() to authenticated;
