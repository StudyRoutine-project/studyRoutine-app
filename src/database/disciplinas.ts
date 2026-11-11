import { randomUUID } from 'expo-crypto';

import { abrirBanco } from './banco';

type DadosDisciplina = {
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

const disciplinasAtivas = `
  SELECT id, usuario_id, nome, descricao, cor, criada_em, atualizada_em
  FROM disciplinas WHERE usuario_id = ? AND excluida = 0`;

export async function cadastrarDisciplina(usuarioId: string, dados: DadosDisciplina) {
  const nome = dados.nome.trim();
  const descricao = dados.descricao?.trim() || null;
  const cor = dados.cor.trim();
  if (!nome) throw new Error('Informe o nome da disciplina.');
  if (!/^#[0-9a-f]{6}$/i.test(cor)) throw new Error('Escolha uma cor válida.');

  const id = randomUUID();
  const operacaoId = randomUUID();
  const agora = new Date().toISOString();
  const db = await abrirBanco();

  await db.withExclusiveTransactionAsync(async (transacao) => {
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
    await transacao.runAsync(
      `INSERT INTO operacoes_pendentes (usuario_id, id, entidade, registro_id, dados)
       VALUES (?, ?, 'disciplinas', ?, ?)`,
      usuarioId,
      operacaoId,
      id,
      JSON.stringify({ nome, descricao, cor }),
    );
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
