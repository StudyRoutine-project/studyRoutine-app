import { randomUUID } from 'expo-crypto';

import { horarioValido } from '../utils/datas';
import { abrirBanco } from './banco';
import { registrarOperacaoPendente } from './operacoesPendentes';

import type { SQLiteDatabase } from 'expo-sqlite';

export const tiposAtividade = ['tarefa', 'trabalho', 'prova', 'estudo'] as const;
export type TipoAtividade = (typeof tiposAtividade)[number];

export type DadosAtividade = {
  disciplina_id: string;
  titulo: string;
  tipo: TipoAtividade;
  data: string;
  horario?: string | null;
  descricao?: string | null;
};

export type Atividade = DadosAtividade & {
  id: string;
  usuario_id: string;
  horario: string | null;
  descricao: string | null;
  concluida: 0 | 1;
  criada_em: string;
  atualizada_em: string;
};

type DadosAtividadeAlterada = DadosAtividade & { concluida: Atividade['concluida'] };

const camposAlteracao = 'disciplina_id, titulo, tipo, data, horario, descricao, concluida';

export class DisciplinaIndisponivelError extends Error {
  constructor() {
    super('Escolha uma disciplina disponível.');
    this.name = 'DisciplinaIndisponivelError';
  }
}

function prepararDados(dados: DadosAtividade) {
  const { disciplina_id, tipo, data } = dados;
  const titulo = dados.titulo.trim();
  const descricao = dados.descricao?.trim() || null;
  const horario = dados.horario || null;
  if (!titulo || !tiposAtividade.includes(tipo)) throw new Error('Informe o título e o tipo.');

  const dia = new Date(`${data}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(data) ||
    data.startsWith('0000') ||
    !Number.isFinite(+dia) ||
    !dia.toISOString().startsWith(`${data}T`)
  ) {
    throw new Error('Informe uma data válida.');
  }
  if (horario && !horarioValido(horario)) {
    throw new Error('Informe um horário válido.');
  }

  return { disciplina_id, titulo, tipo, data, horario, descricao };
}

export async function cadastrarAtividade(usuarioId: string, dados: DadosAtividade) {
  const alteracao = prepararDados(dados);
  const { disciplina_id, titulo, tipo, data, horario, descricao } = alteracao;
  const id = randomUUID();
  const agora = new Date().toISOString();
  const db = await abrirBanco();

  await db.withExclusiveTransactionAsync(async (transacao) => {
    const { changes } = await transacao.runAsync(
      `INSERT INTO atividades
         (usuario_id, id, disciplina_id, titulo, tipo, data, horario, descricao, criada_em, atualizada_em)
       SELECT usuario_id, ?, id, ?, ?, ?, ?, ?, ?, ?
       FROM disciplinas WHERE usuario_id = ? AND id = ? AND excluida = 0`,
      id,
      titulo,
      tipo,
      data,
      horario,
      descricao,
      agora,
      agora,
      usuarioId,
      disciplina_id,
    );
    if (changes === 0) throw new DisciplinaIndisponivelError();
    await registrarOperacaoPendente(transacao, usuarioId, 'atividades', id, alteracao);
  });
}

export async function buscarAtividade(usuarioId: string, id: string) {
  const db = await abrirBanco();
  return db.getFirstAsync<Atividade>(
    `SELECT a.*
     FROM atividades a JOIN disciplinas d ON d.usuario_id = a.usuario_id AND d.id = a.disciplina_id
     WHERE a.usuario_id = ? AND a.id = ? AND a.excluida = 0 AND d.excluida = 0`,
    usuarioId,
    id,
  );
}

export async function editarAtividade(
  usuarioId: string,
  id: string,
  dados: DadosAtividade,
  concluida?: boolean,
) {
  const { disciplina_id, titulo, tipo, data, horario, descricao } = prepararDados(dados);
  const db = await abrirBanco();

  await db.withExclusiveTransactionAsync(async (transacao) => {
    const disciplina = await transacao.getFirstAsync(
      'SELECT 1 FROM disciplinas WHERE usuario_id = ? AND id = ? AND excluida = 0',
      usuarioId,
      disciplina_id,
    );
    if (!disciplina) throw new DisciplinaIndisponivelError();

    const alteracao = await transacao.getFirstAsync<DadosAtividadeAlterada>(
      `UPDATE atividades
       SET disciplina_id = ?, titulo = ?, tipo = ?, data = ?, horario = ?, descricao = ?,
           concluida = coalesce(?, concluida), atualizada_em = ?
       WHERE usuario_id = ? AND id = ? AND excluida = 0
       RETURNING ${camposAlteracao}`,
      disciplina_id,
      titulo,
      tipo,
      data,
      horario,
      descricao,
      concluida === undefined ? null : Number(concluida),
      new Date().toISOString(),
      usuarioId,
      id,
    );
    if (!alteracao) throw new Error('Atividade indisponível.');
    await registrarAlteracao(transacao, usuarioId, id, alteracao);
  });
}

export async function definirConclusaoAtividade(usuarioId: string, id: string, concluida: boolean) {
  const db = await abrirBanco();

  await db.withExclusiveTransactionAsync(async (transacao) => {
    const alteracao = await transacao.getFirstAsync<DadosAtividadeAlterada>(
      `UPDATE atividades SET concluida = ?, atualizada_em = ?
       WHERE usuario_id = ? AND id = ? AND excluida = 0
       RETURNING ${camposAlteracao}`,
      Number(concluida),
      new Date().toISOString(),
      usuarioId,
      id,
    );
    if (!alteracao) throw new Error('Atividade indisponível.');
    await registrarAlteracao(transacao, usuarioId, id, alteracao);
  });
}

export async function excluirAtividade(usuarioId: string, id: string) {
  const db = await abrirBanco();

  await db.withExclusiveTransactionAsync(async (transacao) => {
    const alteracao = await transacao.getFirstAsync<DadosAtividadeAlterada>(
      `UPDATE atividades SET excluida = 1, atualizada_em = ?
       WHERE usuario_id = ? AND id = ? AND excluida = 0
       RETURNING ${camposAlteracao}`,
      new Date().toISOString(),
      usuarioId,
      id,
    );
    if (alteracao) await registrarAlteracao(transacao, usuarioId, id, alteracao, true);
  });
}

async function registrarAlteracao(
  transacao: SQLiteDatabase,
  usuarioId: string,
  id: string,
  dados: DadosAtividadeAlterada,
  excluida = false,
) {
  await registrarOperacaoPendente(transacao, usuarioId, 'atividades', id, {
    ...dados,
    concluida: dados.concluida === 1,
    excluida,
  });
}

export async function listarAtividadesDisciplina(usuarioId: string, disciplinaId: string) {
  const db = await abrirBanco();
  return db.getAllAsync<Atividade>(
    `SELECT id, usuario_id, disciplina_id, titulo, tipo, data, horario, descricao, concluida,
       criada_em, atualizada_em
     FROM atividades WHERE usuario_id = ? AND disciplina_id = ? AND excluida = 0
     ORDER BY data, horario IS NULL, horario, id`,
    usuarioId,
    disciplinaId,
  );
}
