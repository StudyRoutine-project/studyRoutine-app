import { useRef, useState } from 'react';

import { definirConclusaoAtividade } from '../database/atividades';
import { atualizarLembretes } from '../services/lembretes';

import type { Atividade } from '../database/atividades';

export function useConclusaoAtividade(
  usuarioId: string,
  atualizar: (id: string, concluida: Atividade['concluida']) => void,
) {
  const [atividadeSalvando, setAtividadeSalvando] = useState<string>();
  const [erroConclusao, setErroConclusao] = useState<string>();
  const salvando = useRef(false);

  async function alterarConclusao(atividade: Atividade) {
    if (salvando.current) return;

    const concluida = atividade.concluida === 0;
    salvando.current = true;
    setAtividadeSalvando(atividade.id);
    setErroConclusao(undefined);
    try {
      await definirConclusaoAtividade(usuarioId, atividade.id, concluida);
      atualizar(atividade.id, concluida ? 1 : 0);
      atualizarLembretes(usuarioId);
    } catch {
      setErroConclusao(atividade.id);
    } finally {
      salvando.current = false;
      setAtividadeSalvando(undefined);
    }
  }

  return { alterarConclusao, atividadeSalvando, erroConclusao };
}
