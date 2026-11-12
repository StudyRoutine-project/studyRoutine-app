import { openDatabaseAsync } from 'expo-sqlite';

import type { SQLiteDatabase } from 'expo-sqlite';

let banco: Promise<SQLiteDatabase> | undefined;

export function abrirBanco() {
  banco ??= prepararBanco().catch((erro) => {
    banco = undefined;
    throw erro;
  });
  return banco;
}

async function prepararBanco() {
  const db = await openDatabaseAsync('studyroutine.db');

  try {
    const versao = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    if (versao?.user_version === 0) {
      await db.execAsync('PRAGMA journal_mode = WAL');
      await db.withTransactionAsync(async () => {
        await db.execAsync(`
          CREATE TABLE disciplinas (
            usuario_id TEXT NOT NULL,
            id TEXT NOT NULL,
            nome TEXT NOT NULL,
            descricao TEXT,
            cor TEXT NOT NULL,
            criada_em TEXT NOT NULL,
            atualizada_em TEXT NOT NULL,
            excluida INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (usuario_id, id)
          );

          CREATE TABLE operacoes_pendentes (
            sequencia INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id TEXT NOT NULL,
            id TEXT NOT NULL UNIQUE,
            entidade TEXT NOT NULL,
            registro_id TEXT NOT NULL,
            dados TEXT NOT NULL
          );

          CREATE INDEX operacoes_pendentes_usuario_idx
            ON operacoes_pendentes (usuario_id, sequencia);

          PRAGMA user_version = 1;
        `);
      });
    }
    return db;
  } catch (erro) {
    await db.closeAsync();
    throw erro;
  }
}
