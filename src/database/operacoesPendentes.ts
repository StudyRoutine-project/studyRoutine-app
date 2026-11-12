import { abrirBanco } from './banco';

type OperacaoPendente = {
  id: string;
  entidade: 'disciplinas' | 'atividades';
  registro_id: string;
  dados: Record<string, unknown>;
};

type OperacaoArmazenada = Omit<OperacaoPendente, 'dados'> & { dados: string };

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
