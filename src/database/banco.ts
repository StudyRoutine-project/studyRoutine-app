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
    if (versao && versao.user_version < 2) {
      await db.withTransactionAsync(async () => {
        await db.execAsync(`
          CREATE TABLE atividades (
            usuario_id TEXT NOT NULL,
            id TEXT NOT NULL,
            disciplina_id TEXT NOT NULL,
            titulo TEXT NOT NULL CHECK (length(trim(titulo)) > 0),
            tipo TEXT NOT NULL CHECK (tipo IN ('tarefa', 'trabalho', 'prova', 'estudo')),
            data TEXT NOT NULL,
            horario TEXT,
            descricao TEXT,
            concluida INTEGER NOT NULL DEFAULT 0 CHECK (concluida IN (0, 1)),
            excluida INTEGER NOT NULL DEFAULT 0 CHECK (excluida IN (0, 1)),
            criada_em TEXT NOT NULL,
            atualizada_em TEXT NOT NULL,
            PRIMARY KEY (usuario_id, id),
            FOREIGN KEY (usuario_id, disciplina_id) REFERENCES disciplinas (usuario_id, id)
          );

          CREATE INDEX atividades_disciplina_prazo_idx
            ON atividades (usuario_id, disciplina_id, excluida, data, horario, id);

          PRAGMA user_version = 2;
        `);
      });
    }
    if (versao && versao.user_version < 3) {
      await db.withTransactionAsync(async () => {
        await db.execAsync(`
          ALTER TABLE atividades ADD COLUMN adiada INTEGER NOT NULL DEFAULT 0;
          PRAGMA user_version = 3;
        `);
      });
    }
    await db.execAsync('PRAGMA foreign_keys = ON');
    return db;
  } catch (erro) {
    await db.closeAsync();
    throw erro;
  }
}
