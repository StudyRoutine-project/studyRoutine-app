import AsyncStorage from '@react-native-async-storage/async-storage';
import { isRunningInExpoGo } from 'expo';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

import {
  alterarPrazoAtividade,
  buscarAtividade,
  definirConclusaoAtividade,
  listarAtividadesParaLembretes,
} from '../database/atividades';
import { formatarPrazoResumido } from '../utils/datas';

import type {
  DateTriggerInput,
  NotificationPermissionsStatus,
  NotificationRequestInput,
  NotificationResponse,
} from 'expo-notifications';
import type { Atividade } from '../database/atividades';

type AlteracaoAtividade = Pick<Atividade, 'id' | 'disciplina_id' | 'data' | 'horario' | 'concluida' | 'adiada'>;

const androidNoExpoGo = Platform.OS === 'android' && isRunningInExpoGo();
const canal = Platform.OS === 'android' && !androidNoExpoGo ? 'lembretes' : undefined;
const categoriaLembretes = 'lembretes';
export const acaoAdiarLembrete = 'adiarLembrete';
export const acaoConcluirLembrete = 'concluirLembrete';
let operacao: Promise<unknown> = Promise.resolve();
const observadores = new Set<(usuarioId: string, atividade: AlteracaoAtividade) => void>();

Notifications.setNotificationHandler({
  handleNotification: async ({ request }) => {
    const lembrete = request.identifier.startsWith('lembrete:');
    return {
      shouldShowBanner: lembrete,
      shouldShowList: lembrete,
      shouldPlaySound: lembrete,
      shouldSetBadge: false,
    };
  },
});

function chavePreferencia(usuarioId: string) {
  return `@studyroutine/lembretes/${usuarioId}`;
}

function prefixoLembrete(usuarioId: string) {
  return `lembrete:${usuarioId}:`;
}

function enfileirar<T>(executar: () => Promise<T>) {
  const resultado = operacao.then(executar, executar);
  operacao = resultado;
  return resultado;
}

function permiteLembretes(permissao: NotificationPermissionsStatus) {
  return (
    permissao.granted ||
    permissao.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

async function canalBloqueado() {
  if (!canal) return false;
  const configuracao = await Notifications.getNotificationChannelAsync(canal);
  return configuracao?.importance === Notifications.AndroidImportance.NONE;
}

async function solicitarPermissaoLembretes() {
  const configuracao = canal
    ? await Notifications.setNotificationChannelAsync(canal, {
      name: 'Lembretes de atividades',
      importance: Notifications.AndroidImportance.DEFAULT,
    })
    : null;

  let permissao = await Notifications.getPermissionsAsync();
  if (!permiteLembretes(permissao) && permissao.canAskAgain) {
    permissao = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: true },
    });
  }

  return (
    permiteLembretes(permissao) &&
    configuracao?.importance !== Notifications.AndroidImportance.NONE
  );
}

async function limparAgendamentos(usuarioId: string) {
  const prefixo = prefixoLembrete(usuarioId);
  const agendados = await Notifications.getAllScheduledNotificationsAsync();
  for (const { identifier } of agendados) {
    if (identifier.startsWith(prefixo)) {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    }
  }
}

export function observarAtividadesDosLembretes(
  observar: (usuarioId: string, atividade: AlteracaoAtividade) => void,
) {
  observadores.add(observar);
  return () => {
    observadores.delete(observar);
  };
}

async function prepararAgendamentos(usuarioId: string) {
  const atividades = await listarAtividadesParaLembretes(usuarioId);
  const agendamentos = new Map<string, NotificationRequestInput & { trigger: DateTriggerInput }>();

  for (const atividade of atividades) {
    const horario = atividade.horario.slice(0, 5);
    const prazo = new Date(`${atividade.data}T${horario}:00`);
    const identifier = `${prefixoLembrete(usuarioId)}${atividade.id}`;

    agendamentos.set(identifier, {
      identifier,
      content: {
        title: atividade.titulo,
        body: `${atividade.disciplina} · ${formatarPrazoResumido(atividade.data, horario)}`,
        sound: 'default',
        categoryIdentifier: categoriaLembretes,
        data: { atividadeId: atividade.id, usuarioId, prazo: prazo.getTime() },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: prazo,
        channelId: canal,
      },
    });
  }

  return agendamentos;
}

async function sincronizarAgendamentos(usuarioId: string) {
  const previstos = await prepararAgendamentos(usuarioId);
  const prefixo = prefixoLembrete(usuarioId);
  if (previstos.size > 0) {
    await Notifications.setNotificationCategoryAsync(categoriaLembretes, [
      {
        identifier: acaoAdiarLembrete,
        buttonTitle: 'Lembrar em 10 min',
        options: { opensAppToForeground: !androidNoExpoGo },
      },
      {
        identifier: acaoConcluirLembrete,
        buttonTitle: 'Concluir',
        options: { opensAppToForeground: !androidNoExpoGo },
      },
    ]);
  }

  for (const aviso of await Notifications.getAllScheduledNotificationsAsync()) {
    if (!aviso.identifier.startsWith(prefixo)) continue;

    const previsto = previstos.get(aviso.identifier);
    if (
      previsto &&
      aviso.content.title === previsto.content.title &&
      aviso.content.body === previsto.content.body &&
      aviso.content.categoryIdentifier === previsto.content.categoryIdentifier &&
      aviso.content.data?.prazo === previsto.content.data?.prazo
    ) {
      previstos.delete(aviso.identifier);
    } else {
      await Notifications.cancelScheduledNotificationAsync(aviso.identifier);
    }
  }

  for (const aviso of previstos.values()) {
    if (Number(aviso.trigger.date) > Date.now()) {
      await Notifications.scheduleNotificationAsync(aviso);
    }
  }
}

export function atividadeDoLembrete(resposta: NotificationResponse, usuarioId: string) {
  const { identifier, content } = resposta.notification.request;
  const atividadeId = content.data?.atividadeId;

  if (
    content.data?.usuarioId === usuarioId &&
    typeof atividadeId === 'string' &&
    atividadeId.length > 0 &&
    identifier === `${prefixoLembrete(usuarioId)}${atividadeId}`
  ) {
    return atividadeId;
  }
}

export function aplicarAcaoDoLembrete(usuarioId: string, resposta: NotificationResponse) {
  return enfileirar(async () => {
    const atividadeId = atividadeDoLembrete(resposta, usuarioId);
    if (!atividadeId) return;

    const { identifier, content } = resposta.notification.request;
    const atividade = await buscarAtividade(usuarioId, atividadeId);
    if (!atividade?.horario || atividade.concluida) return;

    const horario = atividade.horario.slice(0, 5);
    const prazo = new Date(`${atividade.data}T${horario}:00`).getTime();
    if (prazo !== content.data?.prazo) return;

    let alteracao: AlteracaoAtividade;
    if (resposta.actionIdentifier === acaoConcluirLembrete) {
      await definirConclusaoAtividade(usuarioId, atividadeId, true);
      alteracao = { ...atividade, concluida: 1 };
    } else if (resposta.actionIdentifier === acaoAdiarLembrete) {
      const { ativados } = await lerEstadoLembretes(usuarioId);
      if (!ativados) return;

      const minuto = 60 * 1000;
      const momento = new Date((Math.ceil(Date.now() / minuto) + 10) * minuto);
      const ano = momento.getFullYear();
      const mes = String(momento.getMonth() + 1).padStart(2, '0');
      const dia = String(momento.getDate()).padStart(2, '0');
      const novoPrazo = {
        data: `${ano}-${mes}-${dia}`,
        horario: momento.toTimeString().slice(0, 5),
      };
      if (!(await alterarPrazoAtividade(usuarioId, atividade, novoPrazo))) return;
      alteracao = { ...atividade, ...novoPrazo, adiada: 1 };
    } else {
      return;
    }

    for (const observar of observadores) observar(usuarioId, alteracao);
    await Notifications.dismissNotificationAsync(identifier).catch(() => { });
    if (alteracao.concluida) {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } else {
      await sincronizarAgendamentos(usuarioId);
    }
  });
}

export async function lerEstadoLembretes(usuarioId: string, verificarPermissao = false) {
  const preferenciaAtiva = (await AsyncStorage.getItem(chavePreferencia(usuarioId))) === 'true';
  if (!preferenciaAtiva && !verificarPermissao) {
    return { ativados: false, bloqueados: false };
  }

  const permissao = await Notifications.getPermissionsAsync();
  if (!permiteLembretes(permissao)) {
    return { ativados: false, bloqueados: permissao.status === 'denied' };
  }

  const bloqueados = await canalBloqueado();
  return { ativados: preferenciaAtiva && !bloqueados, bloqueados };
}

export function configurarLembretes(usuarioId: string, ativar: boolean) {
  return enfileirar(async () => {
    if (ativar && !(await solicitarPermissaoLembretes())) return false;

    if (!ativar) {
      await limparAgendamentos(usuarioId);
      await AsyncStorage.setItem(chavePreferencia(usuarioId), 'false');
      return false;
    }

    try {
      await sincronizarAgendamentos(usuarioId);
      await AsyncStorage.setItem(chavePreferencia(usuarioId), 'true');
      return true;
    } catch (erro) {
      await limparAgendamentos(usuarioId).catch(() => { });
      throw erro;
    }
  });
}

export function restaurarLembretes(usuarioId: string) {
  return enfileirar(async () => {
    const { ativados } = await lerEstadoLembretes(usuarioId);
    if (ativados) {
      await sincronizarAgendamentos(usuarioId);
    } else {
      await limparAgendamentos(usuarioId);
    }
  });
}

export function atualizarLembretes(usuarioId: string) {
  void restaurarLembretes(usuarioId).catch(() => {
    Alert.alert('Lembretes', 'Não foi possível atualizar os lembretes. Tente reativá-los no Perfil.');
  });
}

export function cancelarLembretes(usuarioId: string) {
  return enfileirar(() => limparAgendamentos(usuarioId));
}
