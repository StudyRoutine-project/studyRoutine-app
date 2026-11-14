import { useRef, useState } from 'react';
import { LayoutAnimation } from 'react-native';

import { definirConclusaoAtividade } from '../database/atividades';
import { atualizarLembretes } from '../services/lembretes';

import type { Atividade } from '../database/atividades';

const tempoConfirmacao = 650;

function esperar(milissegundos: number) {
  return new Promise((resolver) => setTimeout(resolver, milissegundos));
}

export function useConclusaoAtividade(
  usuarioId: string,
  atualizar: (id: string, concluida: Atividade['concluida']) => void,
) {
  const [atividadeSalvando, setAtividadeSalvando] = useState<string>();
  const [marcacao, setMarcacao] = useState<Pick<Atividade, 'id' | 'concluida'>>();
  const [erroConclusao, setErroConclusao] = useState<string>();
  const salvando = useRef(false);

  async function alterarConclusao(atividade: Atividade) {
    if (salvando.current) return;

    const concluida = atividade.concluida === 0 ? 1 : 0;
    const inicio = Date.now();
    salvando.current = true;
    setAtividadeSalvando(atividade.id);
    setMarcacao({ id: atividade.id, concluida });
    setErroConclusao(undefined);
    try {
      await definirConclusaoAtividade(usuarioId, atividade.id, concluida === 1);
      await esperar(tempoConfirmacao - (Date.now() - inicio));
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      atualizar(atividade.id, concluida);
      atualizarLembretes(usuarioId);
    } catch {
      setErroConclusao(atividade.id);
    } finally {
      salvando.current = false;
      setAtividadeSalvando(undefined);
      setMarcacao(undefined);
    }
  }

  function exibir(atividade: Atividade): Atividade {
    if (marcacao?.id !== atividade.id) return atividade;
    return { ...atividade, concluida: marcacao.concluida };
  }

  return { alterarConclusao, atividadeSalvando, erroConclusao, exibir };
}
