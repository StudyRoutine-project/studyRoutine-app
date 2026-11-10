import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSessao } from '../hooks/useSessao';
import { InicioScreen } from '../screens/InicioScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { cores } from '../theme/cores';

import type { SupabaseClient } from '@supabase/supabase-js';

type Rotas = {
  Login: undefined;
  Inicio: undefined;
};

const Stack = createNativeStackNavigator<Rotas>();

export function RootNavigator({ client }: { client: SupabaseClient }) {
  const usuario = useSessao(client);

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
        <Stack.Screen name="Login">
          {() => <LoginScreen client={client} />}
        </Stack.Screen>
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
