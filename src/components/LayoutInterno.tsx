import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cores } from '../theme/cores';
import { BotaoVoltar } from './BotaoVoltar';
import { CabecalhoMarca } from './CabecalhoMarca';

import type { ReactElement, ReactNode } from 'react';
import type { SafeAreaViewProps } from 'react-native-safe-area-context';

type Props = {
  titulo?: string;
  subtitulo?: string;
  acaoDireita?: ReactNode;
  voltar?: () => void;
  voltarDesativado?: boolean;
  edges?: SafeAreaViewProps['edges'];
  children: ReactNode;
};

export function LayoutInterno({
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
        {titulo && <TituloTela titulo={titulo} subtitulo={subtitulo} />}
        {children}
      </View>
    </SafeAreaView>
  );
}

export function TituloTela({
  titulo,
  subtitulo,
  acao,
}: {
  titulo: string;
  subtitulo?: string;
  acao?: ReactElement;
}) {
  return (
    <View style={[styles.apresentacao, acao && styles.apresentacaoComAcao]}>
      <View style={[styles.textos, acao && styles.textosComAcao]}>
        <View style={acao && styles.linhaTitulo}>
          <Text accessibilityRole="header" style={styles.titulo}>
            {titulo}
          </Text>
        </View>
        {subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
      </View>
      {acao}
    </View>
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
    paddingTop: 24,
    paddingBottom: 18,
  },
  apresentacaoComAcao: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 8 },
  textos: { gap: 4 },
  textosComAcao: { flexBasis: 184, flexGrow: 1, flexShrink: 1 },
  linhaTitulo: { minHeight: 44, justifyContent: 'center' },
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
