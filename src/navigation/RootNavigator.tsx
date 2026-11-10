import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useConfirmacaoEmail } from '../hooks/useConfirmacaoEmail';
import { useSessao } from '../hooks/useSessao';
import { CadastroScreen } from '../screens/CadastroScreen';
import { InicioScreen } from '../screens/InicioScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { cores } from '../theme/cores';

import type { SupabaseClient } from '@supabase/supabase-js';

type Rotas = {
  Login: undefined;
  Cadastro: { somenteReenvio: boolean } | undefined;
  Inicio: undefined;
};

const Stack = createNativeStackNavigator<Rotas>();

export function RootNavigator({ client }: { client: SupabaseClient }) {
  const usuario = useSessao(client);
  const { aviso, chaveConta, limparAviso } = useConfirmacaoEmail(client, Boolean(usuario));

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
        <Stack.Group navigationKey={`conta-${chaveConta}`}>
          <Stack.Screen name="Login">
            {({ navigation }) => (
              <LoginScreen
                client={client}
                aviso={aviso}
                fecharAviso={limparAviso}
                abrirCadastro={() => {
                  limparAviso();
                  navigation.navigate('Cadastro');
                }}
                pedirNovoLink={() => {
                  limparAviso();
                  navigation.navigate('Cadastro', { somenteReenvio: true });
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Cadastro">
            {({ navigation, route }) => (
              <CadastroScreen
                client={client}
                somenteReenvio={route.params?.somenteReenvio ?? false}
                voltar={() => navigation.goBack()}
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
