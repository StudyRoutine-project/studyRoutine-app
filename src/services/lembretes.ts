import AsyncStorage from '@react-native-async-storage/async-storage';
import { isRunningInExpoGo } from 'expo';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { listarAtividadesParaLembretes } from '../database/atividades';

import type { NotificationPermissionsStatus } from 'expo-notifications';

const canal = Platform.OS === 'android' && !isRunningInExpoGo() ? 'lembretes' : undefined;
let operacao: Promise<unknown> = Promise.resolve();

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

async function agendarPendencias(usuarioId: string) {
  const agora = new Date();
  const dia = [
    agora.getFullYear(),
    String(agora.getMonth() + 1).padStart(2, '0'),
    String(agora.getDate()).padStart(2, '0'),
  ].join('-');
  const atividades = await listarAtividadesParaLembretes(usuarioId, dia);

  for (const atividade of atividades) {
    const horario = atividade.horario.slice(0, 5);
    const prazo = new Date(`${atividade.data}T${horario}:00`);
    if (!(prazo.getTime() > Date.now())) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: `${prefixoLembrete(usuarioId)}${atividade.id}`,
      content: {
        title: 'Lembrete de atividade',
        body: atividade.titulo,
        sound: 'default',
        data: { atividadeId: atividade.id, usuarioId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: prazo,
        channelId: canal,
      },
    });
  }
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

    await limparAgendamentos(usuarioId);
    if (!ativar) {
      await AsyncStorage.setItem(chavePreferencia(usuarioId), 'false');
      return false;
    }

    try {
      await agendarPendencias(usuarioId);
      await AsyncStorage.setItem(chavePreferencia(usuarioId), 'true');
      return true;
    } catch (erro) {
      await limparAgendamentos(usuarioId).catch(() => {});
      throw erro;
    }
  });
}

export function restaurarLembretes(usuarioId: string) {
  return enfileirar(async () => {
    const { ativados } = await lerEstadoLembretes(usuarioId);
    await limparAgendamentos(usuarioId);
    if (ativados) await agendarPendencias(usuarioId);
  });
}

export function cancelarLembretes(usuarioId: string) {
  return enfileirar(() => limparAgendamentos(usuarioId));
}
