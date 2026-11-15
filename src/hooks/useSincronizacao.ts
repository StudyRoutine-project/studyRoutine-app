import { addNetworkStateListener, getNetworkStateAsync } from 'expo-network';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { contarOperacoesPendentes, observarOperacoesLocais } from '../database/operacoesPendentes';
import { sincronizarConta } from '../services/sincronizacao';

import type { SupabaseClient } from '@supabase/supabase-js';

export type EstadoSincronizacao = {
  pendentes: number;
  primeiraCargaConcluida: boolean;
  fase: 'sincronizando' | 'atualizado' | 'offline' | 'erro';
};

export function useSincronizacao(client: SupabaseClient, usuarioId?: string) {
  const [estado, setEstado] = useState<(EstadoSincronizacao & { conta: string })>();
  const solicitar = useRef<() => void>(() => {});

  useEffect(() => {
    if (!usuarioId) return;
    const conta = usuarioId;
    let ativo = true;
    let online = true;
    let redeAtualizada = false;
    let executarNovamente = false;
    let falhas = 0;
    let pendentes = 0;
    let primeiraCargaConcluida = false;
    let requisicao: AbortController | undefined;
    let espera: ReturnType<typeof setTimeout> | undefined;

    function publicar(fase: EstadoSincronizacao['fase']) {
      if (ativo) setEstado({ conta, fase, pendentes, primeiraCargaConcluida });
    }

    function emPrimeiroPlano() {
      return !AppState.currentState || AppState.currentState === 'active';
    }

    async function processar() {
      if (!ativo) return;
      clearTimeout(espera);
      if (requisicao) {
        executarNovamente = true;
        return;
      }

      const controle = new AbortController();
      requisicao = controle;
      let expirou = false;
      const limite = setTimeout(() => {
        expirou = true;
        controle.abort();
      }, 45_000);
      try {
        pendentes = await contarOperacoesPendentes(conta);
        if (!ativo) return;
        if (!online) {
          publicar('offline');
          return;
        }
        if (!emPrimeiroPlano()) return;

        publicar('sincronizando');
        await sincronizarConta(client, conta, controle.signal);
        pendentes = await contarOperacoesPendentes(conta);
        if (expirou) throw new Error('Tempo de sincronização excedido.');
        if (controle.signal.aborted) return;

        primeiraCargaConcluida = true;
        falhas = 0;
        publicar('atualizado');
      } catch {
        pendentes = await contarOperacoesPendentes(conta).catch(() => pendentes);
        if (!ativo || (!expirou && controle.signal.aborted)) return;

        publicar(online ? 'erro' : 'offline');
        if (online && emPrimeiroPlano()) {
          const atraso = Math.min(15_000 * 2 ** falhas, 60_000);
          falhas = Math.min(falhas + 1, 2);
          espera = setTimeout(() => void processar(), atraso);
        }
      } finally {
        clearTimeout(limite);
        requisicao = undefined;
        if (executarNovamente) {
          executarNovamente = false;
          void processar();
        }
      }
    }

    function atualizarRede(conectado?: boolean) {
      const disponivel = conectado !== false;
      if (disponivel === online) return;
      online = disponivel;
      if (!online) requisicao?.abort();
      void processar();
    }

    const pararObservacao = observarOperacoesLocais((usuario) => {
      if (usuario === conta) void processar();
    });
    const rede = addNetworkStateListener(({ isConnected }) => {
      redeAtualizada = true;
      atualizarRede(isConnected);
    });
    void getNetworkStateAsync().then(({ isConnected }) => {
      if (ativo && !redeAtualizada) atualizarRede(isConnected);
    }).catch(() => {});

    const app = AppState.addEventListener('change', (fase) => {
      if (fase === 'active') void processar();
      else {
        clearTimeout(espera);
        requisicao?.abort();
      }
    });

    solicitar.current = () => void processar();
    void processar();

    return () => {
      ativo = false;
      solicitar.current = () => {};
      clearTimeout(espera);
      requisicao?.abort();
      pararObservacao();
      rede.remove();
      app.remove();
    };
  }, [client, usuarioId]);

  return {
    estado: estado?.conta === usuarioId ? estado : undefined,
    sincronizar: () => solicitar.current(),
  };
}
