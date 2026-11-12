import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CabecalhoMarca } from '../components/CabecalhoMarca';
import { cores } from '../theme/cores';

export function AgendaScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.tela}>
      <CabecalhoMarca compacto />
      <Text accessibilityRole="header" style={styles.titulo}>
        Agenda
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, paddingHorizontal: 24, paddingTop: 28, gap: 24 },
  titulo: { color: cores.texto, fontSize: 34, fontWeight: '700', letterSpacing: -1.1 },
});
