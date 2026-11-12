import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CabecalhoMarca } from '../components/CabecalhoMarca';
import { cores } from '../theme/cores';

import type { ReactNode } from 'react';

export function AgendaScreen({ acaoPerfil }: { acaoPerfil: ReactNode }) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.tela}>
      <View style={styles.conteudo}>
        <CabecalhoMarca compacto acaoDireita={acaoPerfil} />
        <Text accessibilityRole="header" style={styles.titulo}>
          Agenda
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 520,
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 24,
  },
  titulo: { color: cores.texto, fontSize: 34, fontWeight: '700', letterSpacing: -1.1 },
});
