import { situacaoAtividade } from './situacaoAtividade';

import type { Atividade } from '../database/atividades';

const formatoMes = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const formatoDia = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

const formatoDiaMes = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

const diasRelativos = new Map([
  [-1, 'Ontem'],
  [0, 'Hoje'],
  [1, 'Amanhã'],
]);

export type MarcadorAgenda = 'atrasada' | 'pendente' | 'concluida';

function inicioMes(data: string) {
  return new Date(data.slice(0, 7) + '-01T00:00:00Z');
}

function escreverData(data: Date) {
  return data.toISOString().slice(0, 10);
}

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatarMesAgenda(data: string) {
  return capitalizar(formatoMes.format(inicioMes(data)));
}

export function formatarDiaAgenda(data: string) {
  return capitalizar(formatoDia.format(new Date(data + 'T00:00:00Z')));
}

export function descreverDiaAgenda(data: string, hoje: string) {
  const dia = new Date(data + 'T00:00:00Z');
  const diferenca = Math.round((dia.getTime() - Date.parse(hoje + 'T00:00:00Z')) / 86_400_000);
  const relativo = diasRelativos.get(diferenca);
  return relativo ? `${relativo}, ${formatoDiaMes.format(dia)}` : formatarDiaAgenda(data);
}

export function deslocarMesAgenda(data: string, deslocamento: number, hoje: string) {
  const mes = inicioMes(data);
  mes.setUTCMonth(mes.getUTCMonth() + deslocamento);
  const ano = mes.getUTCFullYear();
  if (ano < 1 || ano > 9999) return data;

  const primeiroDia = escreverData(mes);
  return hoje.slice(0, 7) === primeiroDia.slice(0, 7) ? hoje : primeiroDia;
}

export function semanasDoMes(data: string) {
  const mes = inicioMes(data);
  const inicio = mes.getUTCDay();
  const fim = new Date(mes);
  fim.setUTCMonth(fim.getUTCMonth() + 1, 0);
  const total = fim.getUTCDate();

  return Array.from({ length: Math.ceil((inicio + total) / 7) }, (_, semana) =>
    Array.from({ length: 7 }, (_, coluna) => {
      const dia = semana * 7 + coluna - inicio + 1;
      if (dia < 1 || dia > total) return null;
      const data = new Date(mes);
      data.setUTCDate(dia);
      return { dia, data: escreverData(data) };
    }),
  );
}

export function agruparAtividadesPorDia(atividades: Atividade[]) {
  const dias = new Map<string, Atividade[]>();
  for (const atividade of atividades) {
    const lista = dias.get(atividade.data);
    if (lista) lista.push(atividade);
    else dias.set(atividade.data, [atividade]);
  }
  return dias;
}

export function marcarDias(atividadesPorDia: ReadonlyMap<string, Atividade[]>, agora: number) {
  const dias = new Map<string, Set<MarcadorAgenda>>();
  for (const [dia, atividades] of atividadesPorDia) {
    const marcadores = new Set<MarcadorAgenda>();
    for (const atividade of atividades) {
      const situacao = situacaoAtividade(atividade, agora);
      marcadores.add(situacao === 'hoje' ? 'pendente' : situacao);
    }
    dias.set(dia, marcadores);
  }
  return dias;
}
