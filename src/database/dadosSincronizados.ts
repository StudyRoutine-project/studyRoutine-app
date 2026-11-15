import { transacionarBanco } from './banco';

import type { Atividade } from './atividades';
import type { Disciplina } from './disciplinas';

type DisciplinaRemota = Disciplina & { excluida: boolean };
type AtividadeRemota = Omit<Atividade, 'concluida' | 'adiada'> & {
  concluida: boolean;
  excluida: boolean;
};

export type DadosRemotos = {
  disciplinas: DisciplinaRemota[];
  atividades: AtividadeRemota[];
};

const observadores = new Set<(usuarioId: string) => void>();

export function observarDadosSincronizados(usuarioId: string, atualizar: () => void) {
  function observar(conta: string) {
    if (conta === usuarioId) atualizar();
  }

  observadores.add(observar);
  return () => {
    observadores.delete(observar);
  };
}

export async function importarDadosRemotos(
  usuarioId: string,
  dados: DadosRemotos,
  signal: AbortSignal,
) {
  if (
    dados.disciplinas.some((item) => item.usuario_id !== usuarioId) ||
    dados.atividades.some((item) => item.usuario_id !== usuarioId)
  ) {
    throw new Error('A resposta da sincronização contém registros de outra conta.');
  }

  let alterado = false;
  await transacionarBanco(async (transacao) => {
    if (signal.aborted) return;
    const pendentes = await transacao.getAllAsync<{ entidade: string; registro_id: string }>(
      'SELECT entidade, registro_id FROM operacoes_pendentes WHERE usuario_id = ?',
      usuarioId,
    );
    const protegidos = new Set(
      pendentes.map(({ entidade, registro_id }) => entidade + ':' + registro_id),
    );

    for (const item of dados.disciplinas) {
      if (protegidos.has('disciplinas:' + item.id)) continue;

      const { changes } = await transacao.runAsync(
        `INSERT INTO disciplinas (usuario_id, id, nome, descricao, cor, criada_em, atualizada_em, excluida)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (usuario_id, id) DO UPDATE SET nome = excluded.nome,
           descricao = excluded.descricao, cor = excluded.cor, criada_em = excluded.criada_em,
           atualizada_em = excluded.atualizada_em, excluida = excluded.excluida
         WHERE disciplinas.nome IS NOT excluded.nome OR disciplinas.descricao IS NOT excluded.descricao
           OR disciplinas.cor IS NOT excluded.cor OR disciplinas.excluida IS NOT excluded.excluida`,
        usuarioId, item.id, item.nome, item.descricao, item.cor,
        item.criada_em, item.atualizada_em, Number(item.excluida),
      );
      alterado ||= changes > 0;
    }

    for (const item of dados.atividades) {
      if (protegidos.has('atividades:' + item.id)) continue;

      const { changes } = await transacao.runAsync(
        `INSERT INTO atividades (
           usuario_id, id, disciplina_id, titulo, tipo, data, horario, descricao,
           concluida, excluida, criada_em, atualizada_em
         )
         SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN d.excluida = 1 THEN 1 ELSE ? END, ?, ?
         FROM disciplinas d WHERE d.usuario_id = ? AND d.id = ?
         ON CONFLICT (usuario_id, id) DO UPDATE SET
           disciplina_id = excluded.disciplina_id, titulo = excluded.titulo, tipo = excluded.tipo,
           adiada = CASE WHEN atividades.data = excluded.data
             AND substr(atividades.horario, 1, 5) IS substr(excluded.horario, 1, 5)
             THEN atividades.adiada ELSE 0 END,
           data = excluded.data, horario = excluded.horario, descricao = excluded.descricao,
           concluida = excluded.concluida, excluida = excluded.excluida,
           criada_em = excluded.criada_em, atualizada_em = excluded.atualizada_em
         WHERE atividades.disciplina_id IS NOT excluded.disciplina_id
           OR atividades.titulo IS NOT excluded.titulo OR atividades.tipo IS NOT excluded.tipo
           OR atividades.data IS NOT excluded.data OR atividades.horario IS NOT excluded.horario
           OR atividades.descricao IS NOT excluded.descricao OR atividades.concluida IS NOT excluded.concluida
           OR atividades.excluida IS NOT excluded.excluida`,
        usuarioId, item.id, item.disciplina_id, item.titulo, item.tipo, item.data,
        item.horario?.slice(0, 5) ?? null, item.descricao,
        Number(item.concluida), Number(item.excluida), item.criada_em, item.atualizada_em,
        usuarioId, item.disciplina_id,
      );
      alterado ||= changes > 0;
    }
  });

  if (alterado) {
    for (const observar of observadores) observar(usuarioId);
  }
}
