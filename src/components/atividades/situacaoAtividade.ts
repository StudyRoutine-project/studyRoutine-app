import { dataLocal, prazoVencido } from '../../utils/datas';

import type { Atividade } from '../../database/atividades';

export type Situacao = 'atrasada' | 'hoje' | 'pendente' | 'concluida';

const ordemSituacao: Record<Situacao, number> = { atrasada: 0, hoje: 1, pendente: 2, concluida: 3 };

export function situacaoAtividade(
  atividade: Pick<Atividade, 'concluida' | 'data' | 'horario'>,
  agora: number,
): Situacao {
  if (atividade.concluida) return 'concluida';
  if (prazoVencido(atividade.data, atividade.horario, agora)) return 'atrasada';
  if (atividade.data === dataLocal(new Date(agora))) return 'hoje';
  return 'pendente';
}

export function agruparPorSituacao(atividades: Atividade[], agora: number) {
  const grupos: Record<Situacao, Atividade[]> = {
    atrasada: [],
    hoje: [],
    pendente: [],
    concluida: [],
  };
  for (const atividade of atividades) grupos[situacaoAtividade(atividade, agora)].push(atividade);
  return grupos;
}

export function ordenarPorUrgencia(atividades: Atividade[], agora: number) {
  return atividades
    .map((atividade) => ({ atividade, ordem: ordemSituacao[situacaoAtividade(atividade, agora)] }))
    .sort((a, b) => a.ordem - b.ordem)
    .map(({ atividade }) => atividade);
}
