import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cores } from '../../theme/cores';
import { BotaoVoltar } from '../BotaoVoltar';
import { CabecalhoMarca } from '../CabecalhoMarca';

import type { ReactNode } from 'react';
import type { SafeAreaViewProps } from 'react-native-safe-area-context';

type Props = {
  titulo: string;
  subtitulo?: string;
  acaoDireita?: ReactNode;
  voltar?: () => void;
  voltarDesativado?: boolean;
  edges?: SafeAreaViewProps['edges'];
  children: ReactNode;
};

export function LayoutDisciplinas({
  titulo,
  subtitulo,
  acaoDireita,
  voltar,
  voltarDesativado,
  edges,
  children,
}: Props) {
  return (
    <SafeAreaView edges={edges} style={styles.tela}>
      <View style={styles.conteudo}>
        <CabecalhoMarca
          compacto
          acao={voltar && <BotaoVoltar onPress={voltar} desativado={voltarDesativado} />}
          acaoDireita={acaoDireita}
        />
        <View style={styles.apresentacao}>
          <Text accessibilityRole="header" style={styles.titulo}>
            {titulo}
          </Text>
          {subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
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
    paddingTop: 28,
  },
  apresentacao: {
    gap: 4,
    paddingTop: 24,
    paddingBottom: 18,
  },
  titulo: {
    color: cores.texto,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1.1,
  },
  subtitulo: {
    color: cores.secundario,
    fontSize: 15,
    lineHeight: 21,
  },
});
