import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cores } from '../../theme/cores';
import { BotaoVoltar } from '../BotaoVoltar';

import type { ReactNode } from 'react';

type Props = {
  titulo: string;
  voltar: () => void;
  voltarDesativado?: boolean;
  children: ReactNode;
};

export function LayoutDisciplinas({ titulo, voltar, voltarDesativado, children }: Props) {
  return (
    <SafeAreaView style={styles.tela}>
      <View style={styles.conteudo}>
        <View style={styles.cabecalho}>
          <BotaoVoltar onPress={voltar} desativado={voltarDesativado} />
          <Text accessibilityRole="header" style={styles.titulo}>
            {titulo}
          </Text>
        </View>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 520,
    paddingHorizontal: 24,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 18,
  },
  titulo: {
    flex: 1,
    color: cores.texto,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.7,
  },
});
