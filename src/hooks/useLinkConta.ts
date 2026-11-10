import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { lerLinkConta, retornoContaWeb, validarLinkConta } from '../services/autenticacao';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { AvisoConta } from '../services/autenticacao';

type EstadoRecuperacao = 'abrindo' | 'confirmado' | 'invalido' | 'indisponivel';

export function useLinkConta(client: SupabaseClient, autenticado: boolean) {
  const [aviso, setAviso] = useState<AvisoConta | null>(null);
  const [recuperacao, setRecuperacao] = useState<EstadoRecuperacao | null>(null);
  const [chaveConta, setChaveConta] = useState(0);

  useEffect(() => {
    if (autenticado && aviso) setAviso(null);
  }, [autenticado, aviso]);

  useEffect(() => {
    let ativo = true;
    let ultimoLink: string | null = null;

    async function abrirLink(url: string | null | undefined) {
      if (!ativo || !url || url === ultimoLink) return;

      const link = lerLinkConta(url);
      if (!link) return;

      ultimoLink = url;
      setRecuperacao(link.tipo === 'recuperacao' ? 'abrindo' : null);
      const resultado = await validarLinkConta(client, link);
      if (!ativo || ultimoLink !== url) return;

      if (resultado === 'indisponivel') {
        ultimoLink = null;
      } else if (retornoContaWeb(link.tipo) && url === window.location.href) {
        window.history.replaceState(window.history.state, '', '/');
      }

      if (link.tipo === 'recuperacao') {
        setRecuperacao(resultado === 'entrar' ? 'invalido' : resultado);
      } else {
        setAviso(resultado);
      }
      if (resultado !== 'confirmado') setChaveConta((chave) => chave + 1);
    }

    const inscricao = Linking.addEventListener('url', ({ url }) => void abrirLink(url));
    void Linking.getInitialURL().then(abrirLink).catch(() => {});

    return () => {
      ativo = false;
      inscricao.remove();
    };
  }, [client]);

  return {
    aviso,
    recuperacao,
    chaveConta,
    limparAviso: () => setAviso(null),
    finalizarRecuperacao: () => setRecuperacao(null),
    concluirRecuperacao: () => {
      setAviso('senha-alterada');
      setRecuperacao(null);
      setChaveConta((chave) => chave + 1);
    },
  };
}
