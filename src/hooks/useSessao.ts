import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { lerUsuarioSalvo } from '../services/supabase';

import type { SupabaseClient, User } from '@supabase/supabase-js';

export function useSessao(client: SupabaseClient) {
  const [usuario, setUsuario] = useState<User | null>();

  useEffect(() => {
    let ativo = true;
    let versao = 0;

    async function restaurar() {
      const leitura = ++versao;
      const salvo = await lerUsuarioSalvo().catch(() => null);

      if (ativo && leitura === versao) setUsuario(salvo);
    }

    void restaurar();

    const { data: { subscription } } = client.auth.onAuthStateChange((evento, sessao) => {
      if (evento === 'INITIAL_SESSION' && !sessao) {
        void restaurar();
        return;
      }

      versao++;
      setUsuario(sessao?.user ?? null);
    });

    function atualizarSessao(estado: typeof AppState.currentState) {
      if (estado === 'active') {
        void client.auth.startAutoRefresh();
      } else {
        void client.auth.stopAutoRefresh();
      }
    }

    atualizarSessao(AppState.currentState);
    const appState = AppState.addEventListener('change', atualizarSessao);

    return () => {
      ativo = false;
      subscription.unsubscribe();
      appState.remove();
      void client.auth.stopAutoRefresh();
    };
  }, [client]);

  return usuario;
}
