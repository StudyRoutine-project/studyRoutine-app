import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { configurarLembretes, lerEstadoLembretes } from '../services/lembretes';

type EstadoLembretes = Awaited<ReturnType<typeof lerEstadoLembretes>>;

export function useLembretes(usuarioId: string) {
  const [estado, setEstado] = useState<EstadoLembretes | null>(null);
  const [valorPendente, setValorPendente] = useState<boolean | null>(null);
  const [erro, setErro] = useState<string>();
  const [tentativa, setTentativa] = useState(0);
  const verificouPermissao = useRef(false);
  const alterandoRef = useRef(false);
  const versao = useRef(0);

  useEffect(() => {
    let ativo = true;

    async function atualizar() {
      if (alterandoRef.current) return;
      const leitura = ++versao.current;
      try {
        const atual = await lerEstadoLembretes(usuarioId, verificouPermissao.current);
        if (ativo && leitura === versao.current) {
          setEstado(atual);
          setErro(undefined);
        }
      } catch {
        if (ativo && leitura === versao.current) {
          setErro('Não foi possível carregar os lembretes.');
        }
      }
    }

    void atualizar();
    const assinatura = AppState.addEventListener('change', (appState) => {
      if (appState === 'active') void atualizar();
    });

    return () => {
      ativo = false;
      assinatura.remove();
    };
  }, [usuarioId, tentativa]);

  async function alterar(ativar: boolean) {
    if (alterandoRef.current) return;

    alterandoRef.current = true;
    versao.current++;
    setValorPendente(ativar);
    setErro(undefined);

    try {
      const ativados = await configurarLembretes(usuarioId, ativar);
      verificouPermissao.current = ativar;
      setEstado({ ativados, bloqueados: ativar && !ativados });
    } catch {
      setErro('Não foi possível alterar os lembretes. Tente de novo.');
    } finally {
      alterandoRef.current = false;
      setValorPendente(null);
    }
  }

  function tentarNovamente() {
    setErro(undefined);
    setTentativa((atual) => atual + 1);
  }

  return {
    estado,
    ativados: valorPendente ?? estado?.ativados ?? false,
    alterando: valorPendente !== null,
    erro,
    alterar,
    tentarNovamente,
  };
}
