import { randomUUID } from 'expo-crypto';

import { abrirBanco, transacionarBanco } from './banco';

import type { SQLiteDatabase } from 'expo-sqlite';

type OperacaoPendente = {
  id: string;
  entidade: 'disciplinas' | 'atividades';
  registro_id: string;
  dados: Record<string, unknown>;
};

type OperacaoArmazenada = Omit<OperacaoPendente, 'dados'> & { dados: string };

const observadores = new Set<(usuarioId: string) => void>();

export function observarOperacoesLocais(observar: (usuarioId: string) => void) {
  observadores.add(observar);
  return () => {
    observadores.delete(observar);
  };
}

export async function gravarAlteracaoLocal(
  usuarioId: string,
  executar: (transacao: SQLiteDatabase) => Promise<void>,
) {
  await transacionarBanco(executar);
  for (const observar of observadores) observar(usuarioId);
}

export async function contarOperacoesPendentes(usuarioId: string) {
  const db = await abrirBanco();
  const resultado = await db.getFirstAsync<{ total: number }>(
    'SELECT count(*) AS total FROM operacoes_pendentes WHERE usuario_id = ?',
    usuarioId,
  );
  return resultado?.total ?? 0;
}

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
  await transacionarBanco(async (transacao) => {
    await transacao.runAsync(
      'DELETE FROM operacoes_pendentes WHERE usuario_id = ? AND id = ?',
      usuarioId,
      id,
    );
  });
}
