import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { supabase } from './src/services/supabase';
import { cores } from './src/theme/cores';

const temaNavegacao = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: cores.fundo,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {supabase ? (
        <NavigationContainer theme={temaNavegacao}>
          <RootNavigator client={supabase} />
        </NavigationContainer>
      ) : (
        <SafeAreaView style={styles.aviso}>
          <Text style={styles.texto}>
            Não foi possível abrir o StudyRoutine.
          </Text>
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  aviso: {
    flex: 1,
    justifyContent: 'center',
    padding: 28,
    backgroundColor: cores.fundo,
  },
  texto: {
    color: cores.texto,
    fontSize: 16,
    textAlign: 'center',
  },
});
