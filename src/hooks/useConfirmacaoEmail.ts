import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { confirmarEmail, retornoConfirmacaoWeb } from '../services/autenticacao';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ResultadoConfirmacao } from '../services/autenticacao';

export function useConfirmacaoEmail(client: SupabaseClient, autenticado: boolean) {
  const [aviso, setAviso] = useState<ResultadoConfirmacao | null>(null);
  const [chaveConta, setChaveConta] = useState(0);

  useEffect(() => {
    if (autenticado && aviso) setAviso(null);
  }, [autenticado, aviso]);

  useEffect(() => {
    let ativo = true;
    let ultimoLink: string | null = null;

    async function abrirLink(url: string | null | undefined) {
      if (!ativo || !url || url === ultimoLink) return;

      ultimoLink = url;
      const resultado = await confirmarEmail(client, url);
      if (!ativo || ultimoLink !== url || !resultado) return;

      if (resultado === 'indisponivel') {
        ultimoLink = null;
      } else if (retornoConfirmacaoWeb() && url === window.location.href) {
        window.history.replaceState(window.history.state, '', '/');
      }
      setAviso(resultado);
      if (resultado !== 'confirmado') setChaveConta((chave) => chave + 1);
    }

    const inscricao = Linking.addEventListener('url', ({ url }) => void abrirLink(url));
    void Linking.getInitialURL().then(abrirLink).catch(() => {});

    return () => {
      ativo = false;
      inscricao.remove();
    };
  }, [client]);

  return { aviso, chaveConta, limparAviso: () => setAviso(null) };
}
