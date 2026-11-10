import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSessao } from '../hooks/useSessao';
import { CadastroScreen } from '../screens/CadastroScreen';
import { InicioScreen } from '../screens/InicioScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SolicitarRecuperacaoScreen } from '../screens/SolicitarRecuperacaoScreen';
import { VerificarCodigoScreen } from '../screens/VerificarCodigoScreen';
import { cores } from '../theme/cores';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { AvisoConta, FinalidadeCodigo } from '../services/autenticacao';

type Rotas = {
  Login: undefined;
  Cadastro: { reenviarPara?: string } | undefined;
  SolicitarRecuperacao: undefined;
  VerificarCodigo: { email: string; finalidade: FinalidadeCodigo };
  Inicio: undefined;
};

const Stack = createNativeStackNavigator<Rotas>();

export function RootNavigator({ client }: { client: SupabaseClient }) {
  const usuario = useSessao(client);
  const [aviso, setAviso] = useState<AvisoConta | null>(null);

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
        <Stack.Screen name="Inicio">
          {() => <InicioScreen client={client} usuario={usuario} />}
        </Stack.Screen>
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
