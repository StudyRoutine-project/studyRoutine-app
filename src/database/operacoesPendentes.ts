import { randomUUID } from 'expo-crypto';

import { abrirBanco } from './banco';

import type { SQLiteDatabase } from 'expo-sqlite';

type OperacaoPendente = {
  id: string;
  entidade: 'disciplinas' | 'atividades';
  registro_id: string;
  dados: Record<string, unknown>;
};

type OperacaoArmazenada = Omit<OperacaoPendente, 'dados'> & { dados: string };

export async function registrarOperacaoPendente(
  transacao: SQLiteDatabase,
  usuarioId: string,
  entidade: OperacaoPendente['entidade'],
  registroId: string,
  dados: OperacaoPendente['dados'],
) {
  await transacao.runAsync(
    `INSERT INTO operacoes_pendentes (usuario_id, id, entidade, registro_id, dados)
     VALUES (?, ?, ?, ?, ?)`,
    usuarioId,
    randomUUID(),
    entidade,
    registroId,
    JSON.stringify(dados),
  );
}

export async function listarOperacoesPendentes(usuarioId: string): Promise<OperacaoPendente[]> {
  const db = await abrirBanco();
  const operacoes = await db.getAllAsync<OperacaoArmazenada>(
    `SELECT id, entidade, registro_id, dados FROM operacoes_pendentes
     WHERE usuario_id = ? ORDER BY sequencia`,
    usuarioId,
  );
  return operacoes.map((operacao) => ({ ...operacao, dados: JSON.parse(operacao.dados) }));
}

export async function confirmarOperacaoPendente(usuarioId: string, id: string) {
  const db = await abrirBanco();
  await db.runAsync(
    'DELETE FROM operacoes_pendentes WHERE usuario_id = ? AND id = ?',
    usuarioId,
    id,
  );
}
