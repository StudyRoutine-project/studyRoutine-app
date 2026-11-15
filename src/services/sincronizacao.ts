import { importarDadosRemotos } from '../database/dadosSincronizados';
import { confirmarOperacaoPendente, listarOperacoesPendentes } from '../database/operacoesPendentes';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { DadosRemotos } from '../database/dadosSincronizados';

type Confirmacao = {
  operacao_id: string;
  entidade: string;
  registro: { id: string; usuario_id: string };
};

export async function sincronizarConta(client: SupabaseClient, usuarioId: string, signal: AbortSignal) {
  const pendentes = await listarOperacoesPendentes(usuarioId);
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  const sessao = data.session;
  if (!sessao || sessao.user.id !== usuarioId || signal.aborted) {
    throw new Error('Sessão indisponível para sincronizar.');
  }

  const autorizacao = 'Bearer ' + sessao.access_token;
  let falhaEnvio: unknown;

  for (const operacao of pendentes) {
    if (signal.aborted) return;
    const resposta = await client.rpc('sincronizar_operacao', {
      p_operacao_id: operacao.id,
      p_entidade: operacao.entidade,
      p_registro_id: operacao.registro_id,
      p_dados: operacao.dados,
    })
      .setHeader('Authorization', autorizacao)
      .abortSignal(signal);
    const confirmacao = resposta.data as unknown as Confirmacao | null;

    if (signal.aborted) return;
    if (
      resposta.error ||
      confirmacao?.operacao_id !== operacao.id ||
      confirmacao.entidade !== operacao.entidade ||
      confirmacao.registro?.id !== operacao.registro_id ||
      confirmacao.registro.usuario_id !== usuarioId
    ) {
      falhaEnvio = resposta.error ?? new Error('O servidor não confirmou a operação.');
      break;
    }

    await confirmarOperacaoPendente(usuarioId, operacao.id);
  }

  if (signal.aborted) return;

  const resposta = await client.rpc('baixar_dados')
    .setHeader('Authorization', autorizacao)
    .abortSignal(signal);
  if (signal.aborted) return;
  if (resposta.error) throw resposta.error;
  const dados = resposta.data as unknown as DadosRemotos | null;
  if (!Array.isArray(dados?.disciplinas) || !Array.isArray(dados?.atividades)) {
    throw new Error('O servidor não retornou os dados da conta.');
  }

  await importarDadosRemotos(usuarioId, dados, signal);
  if (falhaEnvio) throw falhaEnvio;
}
