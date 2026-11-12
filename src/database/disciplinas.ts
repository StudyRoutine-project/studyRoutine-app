import { randomUUID } from 'expo-crypto';

import { normalizarTexto } from '../utils/normalizarTexto';
import { abrirBanco } from './banco';

import type { SQLiteDatabase } from 'expo-sqlite';

export type DadosDisciplina = {
  nome: string;
  descricao?: string | null;
  cor: string;
};

export type Disciplina = {
  id: string;
  usuario_id: string;
  nome: string;
  descricao: string | null;
  cor: string;
  criada_em: string;
  atualizada_em: string;
};

export class NomeDisciplinaDuplicadoError extends Error {
  constructor() {
    super('Já existe uma disciplina com esse nome.');
    this.name = 'NomeDisciplinaDuplicadoError';
  }
}

const disciplinasAtivas = `
  SELECT id, usuario_id, nome, descricao, cor, criada_em, atualizada_em
  FROM disciplinas WHERE usuario_id = ? AND excluida = 0`;

function prepararDados(dados: DadosDisciplina) {
  const nome = dados.nome.trim();
  const descricao = dados.descricao?.trim() || null;
  const cor = dados.cor.trim();
  if (!nome) throw new Error('Informe o nome da disciplina.');
  if (!/^#[0-9a-f]{6}$/i.test(cor)) throw new Error('Escolha uma cor válida.');
  return { nome, descricao, cor };
}

async function validarNomeDisponivel(
  transacao: SQLiteDatabase,
  usuarioId: string,
  nome: string,
  id?: string,
) {
  const nomeNormalizado = normalizarTexto(nome);
  const disciplinas = await transacao.getAllAsync<Pick<Disciplina, 'id' | 'nome'>>(
    'SELECT id, nome FROM disciplinas WHERE usuario_id = ? AND excluida = 0',
    usuarioId,
  );
  if (
    disciplinas.some((item) => item.id !== id && normalizarTexto(item.nome) === nomeNormalizado)
  ) {
    throw new NomeDisciplinaDuplicadoError();
  }
}

async function registrarOperacao(
  transacao: SQLiteDatabase,
  usuarioId: string,
  id: string,
  dados: DadosDisciplina & { excluida?: true },
) {
  await transacao.runAsync(
    `INSERT INTO operacoes_pendentes (usuario_id, id, entidade, registro_id, dados)
     VALUES (?, ?, 'disciplinas', ?, ?)`,
    usuarioId,
    randomUUID(),
    id,
    JSON.stringify(dados),
  );
}

export async function cadastrarDisciplina(usuarioId: string, dados: DadosDisciplina) {
  const { nome, descricao, cor } = prepararDados(dados);
  const id = randomUUID();
  const agora = new Date().toISOString();
  const db = await abrirBanco();

  await db.withExclusiveTransactionAsync(async (transacao) => {
    await validarNomeDisponivel(transacao, usuarioId, nome);
    await transacao.runAsync(
      `INSERT INTO disciplinas (usuario_id, id, nome, descricao, cor, criada_em, atualizada_em)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      usuarioId,
      id,
      nome,
      descricao,
      cor,
      agora,
      agora,
    );
    await registrarOperacao(transacao, usuarioId, id, { nome, descricao, cor });
  });

  return {
    id,
    usuario_id: usuarioId,
    nome,
    descricao,
    cor,
    criada_em: agora,
    atualizada_em: agora,
  };
}

export async function listarDisciplinas(usuarioId: string) {
  const db = await abrirBanco();
  return db.getAllAsync<Disciplina>(`${disciplinasAtivas} ORDER BY nome, id`, usuarioId);
}

export async function buscarDisciplina(usuarioId: string, id: string) {
  const db = await abrirBanco();
  return db.getFirstAsync<Disciplina>(`${disciplinasAtivas} AND id = ?`, usuarioId, id);
}

export async function editarDisciplina(usuarioId: string, id: string, dados: DadosDisciplina) {
  const alteracao = prepararDados(dados);
  const db = await abrirBanco();

  await db.withExclusiveTransactionAsync(async (transacao) => {
    await validarNomeDisponivel(transacao, usuarioId, alteracao.nome, id);
    const { changes } = await transacao.runAsync(
      `UPDATE disciplinas SET nome = ?, descricao = ?, cor = ?, atualizada_em = ?
       WHERE usuario_id = ? AND id = ? AND excluida = 0`,
      alteracao.nome,
      alteracao.descricao,
      alteracao.cor,
      new Date().toISOString(),
      usuarioId,
      id,
    );
    if (changes === 0) throw new Error('Disciplina indisponível.');
    await registrarOperacao(transacao, usuarioId, id, alteracao);
  });
}

export async function excluirDisciplina(usuarioId: string, id: string) {
  const db = await abrirBanco();

  await db.withExclusiveTransactionAsync(async (transacao) => {
    const dados = await transacao.getFirstAsync<Pick<Disciplina, 'nome' | 'descricao' | 'cor'>>(
      `UPDATE disciplinas SET excluida = 1, atualizada_em = ?
       WHERE usuario_id = ? AND id = ? AND excluida = 0
       RETURNING nome, descricao, cor`,
      new Date().toISOString(),
      usuarioId,
      id,
    );
    if (dados) await registrarOperacao(transacao, usuarioId, id, { ...dados, excluida: true });
  });
}
