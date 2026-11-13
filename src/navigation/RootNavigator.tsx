import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Platform, StyleSheet, View } from 'react-native';

import { useSessao } from '../hooks/useSessao';
import { CadastroScreen } from '../screens/CadastroScreen';
import { DetalhesDisciplinaScreen } from '../screens/DetalhesDisciplinaScreen';
import { EditarAtividadeScreen } from '../screens/EditarAtividadeScreen';
import { EditarDisciplinaScreen } from '../screens/EditarDisciplinaScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { NovaAtividadeScreen } from '../screens/NovaAtividadeScreen';
import { NovaDisciplinaScreen } from '../screens/NovaDisciplinaScreen';
import { PerfilScreen } from '../screens/PerfilScreen';
import { SolicitarRecuperacaoScreen } from '../screens/SolicitarRecuperacaoScreen';
import { VerificarCodigoScreen } from '../screens/VerificarCodigoScreen';
import {
  acaoAdiarLembrete,
  adiarLembrete,
  atividadeDoLembrete,
  cancelarLembretes,
  restaurarLembretes,
} from '../services/lembretes';
import { cores } from '../theme/cores';
import { AbasNavigator } from './AbasNavigator';

import type { NavigationContainerRef } from '@react-navigation/native';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { NotificationResponse } from 'expo-notifications';
import type { AvisoConta, FinalidadeCodigo } from '../services/autenticacao';

type Rotas = {
  Login: undefined;
  Cadastro: { reenviarPara?: string } | undefined;
  SolicitarRecuperacao: undefined;
  VerificarCodigo: { email: string; finalidade: FinalidadeCodigo };
  Abas: undefined;
  Perfil: undefined;
  NovaDisciplina: undefined;
  EditarDisciplina: { disciplinaId: string };
  DetalhesDisciplina: { disciplinaId: string };
  NovaAtividade: { disciplinaId: string };
  EditarAtividade: { atividadeId: string };
};

const Stack = createNativeStackNavigator<Rotas>();

export function RootNavigator({ client }: { client: SupabaseClient }) {
  const usuario = useSessao(client);
  const navigation = useNavigation<NavigationContainerRef<Rotas>>();
  const [aviso, setAviso] = useState<AvisoConta | null>(null);
  const nome = usuario?.user_metadata.nome;
  const nomeUsuario = typeof nome === 'string' ? nome.trim() : '';
  const usuarioId = usuario?.id;

  useEffect(() => {
    if (!usuarioId) return;

    void restaurarLembretes(usuarioId).catch(() => {});
    return () => {
      void cancelarLembretes(usuarioId).catch(() => {});
    };
  }, [usuarioId]);

  useEffect(() => {
    if (!usuarioId || (Platform.OS !== 'android' && Platform.OS !== 'ios')) return;

    const contaId = usuarioId;
    let respostaPendente: NotificationResponse | undefined;
    let ultimaResposta: string | undefined;

    function tratarRespostaPendente() {
      if (
        !respostaPendente ||
        !navigation.isReady() ||
        (AppState.currentState && AppState.currentState !== 'active')
      ) return;

      const resposta = respostaPendente;
      respostaPendente = undefined;
      Notifications.clearLastNotificationResponse();

      const atividadeId = atividadeDoLembrete(resposta, contaId);
      if (!atividadeId) return;

      if (resposta.actionIdentifier === acaoAdiarLembrete) {
        void adiarLembrete(contaId, resposta).catch(() => {
          Alert.alert('Lembretes', 'Não foi possível adiar este lembrete.');
        });
      } else if (resposta.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        navigation.navigate('EditarAtividade', { atividadeId });
      }
    }

    function receberResposta(resposta: NotificationResponse) {
      const { date, request } = resposta.notification;
      const chave = `${request.identifier}/${date}/${resposta.actionIdentifier}`;
      if (chave === ultimaResposta) return;

      ultimaResposta = chave;
      respostaPendente = resposta;
      tratarRespostaPendente();
    }

    function lerUltimaResposta() {
      const resposta = Notifications.getLastNotificationResponse();
      if (resposta) receberResposta(resposta);
      tratarRespostaPendente();
    }

    const removerPronto = navigation.addListener('ready', tratarRespostaPendente);
    const assinatura = Notifications.addNotificationResponseReceivedListener(receberResposta);
    const estadoApp = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') lerUltimaResposta();
    });
    lerUltimaResposta();

    return () => {
      assinatura.remove();
      estadoApp.remove();
      removerPronto();
    };
  }, [navigation, usuarioId]);

  if (usuario === undefined) {
    return (
      <View style={styles.carregamento}>
        <ActivityIndicator accessibilityLabel="Abrindo o StudyRoutine" color={cores.roxo} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {usuario ? (
        <Stack.Group navigationKey={usuario.id}>
          <Stack.Screen name="Abas">
            {({ navigation }) => (
              <AbasNavigator
                usuarioId={usuario.id}
                nome={nomeUsuario}
                email={usuario.email}
                abrirPerfil={() => navigation.navigate('Perfil')}
                novaDisciplina={() => navigation.navigate('NovaDisciplina')}
                abrirDisciplina={(disciplinaId) =>
                  navigation.navigate('DetalhesDisciplina', { disciplinaId })
                }
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="DetalhesDisciplina">
            {({ navigation, route }) => (
              <DetalhesDisciplinaScreen
                key={route.params.disciplinaId}
                usuarioId={usuario.id}
                disciplinaId={route.params.disciplinaId}
                voltar={() => navigation.goBack()}
                editarDisciplina={() => navigation.navigate('EditarDisciplina', route.params)}
                novaAtividade={() => navigation.navigate('NovaAtividade', route.params)}
                abrirAtividade={(atividadeId) =>
                  navigation.navigate('EditarAtividade', { atividadeId })
                }
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="NovaAtividade">
            {({ navigation, route }) => (
              <NovaAtividadeScreen
                usuarioId={usuario.id}
                disciplinaId={route.params.disciplinaId}
                voltar={() => navigation.goBack()}
                concluir={(disciplinaId) => {
                  if (navigation.isFocused())
                    navigation.popTo('DetalhesDisciplina', { disciplinaId });
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="EditarAtividade">
            {({ navigation, route }) => (
              <EditarAtividadeScreen
                key={route.params.atividadeId}
                usuarioId={usuario.id}
                atividadeId={route.params.atividadeId}
                voltar={() => navigation.goBack()}
                concluir={() => {
                  if (navigation.isFocused()) navigation.goBack();
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Perfil">
            {({ navigation }) => (
              <PerfilScreen
                client={client}
                usuarioId={usuario.id}
                nome={nomeUsuario}
                email={usuario.email}
                voltar={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="NovaDisciplina">
            {({ navigation }) => (
              <NovaDisciplinaScreen
                usuarioId={usuario.id}
                voltar={() => navigation.goBack()}
                concluir={() => {
                  if (navigation.isFocused()) navigation.goBack();
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="EditarDisciplina">
            {({ navigation, route }) => (
              <EditarDisciplinaScreen
                usuarioId={usuario.id}
                disciplinaId={route.params.disciplinaId}
                voltar={() => navigation.goBack()}
                concluir={() => {
                  if (navigation.isFocused()) navigation.goBack();
                }}
                concluirExclusao={() => {
                  if (navigation.isFocused()) navigation.popTo('Abas');
                }}
              />
            )}
          </Stack.Screen>
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Login">
            {({ navigation }) => (
              <LoginScreen
                client={client}
                aviso={aviso}
                fecharAviso={() => setAviso(null)}
                abrirCadastro={() => {
                  setAviso(null);
                  navigation.navigate('Cadastro');
                }}
                recuperarSenha={() => {
                  setAviso(null);
                  navigation.navigate('SolicitarRecuperacao');
                }}
                abrirReenvioConfirmacao={(email) => {
                  setAviso(null);
                  navigation.navigate('Cadastro', { reenviarPara: email });
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Cadastro">
            {({ navigation, route }) => (
              <CadastroScreen
                client={client}
                reenviarPara={route.params?.reenviarPara}
                voltar={() => navigation.goBack()}
                verificarCodigo={(email) => {
                  if (navigation.isFocused()) {
                    navigation.navigate('VerificarCodigo', { email, finalidade: 'cadastro' });
                  }
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="SolicitarRecuperacao">
            {({ navigation }) => (
              <SolicitarRecuperacaoScreen
                client={client}
                voltar={() => navigation.goBack()}
                verificarCodigo={(email) => {
                  if (navigation.isFocused()) {
                    navigation.navigate('VerificarCodigo', { email, finalidade: 'recuperacao' });
                  }
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="VerificarCodigo">
            {({ navigation, route }) => (
              <VerificarCodigoScreen
                client={client}
                email={route.params.email}
                finalidade={route.params.finalidade}
                voltar={() => navigation.goBack()}
                concluir={(mensagem) => {
                  if (!navigation.isFocused()) return;
                  setAviso(mensagem);
                  navigation.popToTop();
                }}
              />
            )}
          </Stack.Screen>
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  carregamento: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundo,
  },
});
