import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
  rolavel?: boolean;
  flutuante?: ReactNode;
  children: ReactNode;
};

export function LayoutInterno({
  titulo,
  subtitulo,
  acaoDireita,
  voltar,
  voltarDesativado,
  edges,
  rolavel = false,
  flutuante,
  children,
}: Props) {
  const corpo = (
    <>
      <CabecalhoMarca
        compacto
        acao={voltar && <BotaoVoltar onPress={voltar} desativado={voltarDesativado} />}
        acaoDireita={acaoDireita}
      />
      {titulo && <TituloTela titulo={titulo} subtitulo={subtitulo} />}
      {children}
    </>
  );

  return (
    <SafeAreaView edges={edges} style={styles.tela}>
      {rolavel ? (
        <ScrollView
          contentContainerStyle={[
            styles.coluna,
            styles.conteudoRolavel,
            !!flutuante && styles.espacoFlutuante,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {corpo}
        </ScrollView>
      ) : (
        <View style={[styles.coluna, styles.conteudoFixo]}>{corpo}</View>
      )}
      {flutuante && (
        <View pointerEvents="box-none" style={styles.camadaFlutuante}>
          <View pointerEvents="box-none" style={styles.colunaFlutuante}>
            {flutuante}
          </View>
        </View>
      )}
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
          <Text accessibilityRole="header" numberOfLines={2} style={styles.titulo}>
            {titulo}
          </Text>
        </View>
        {subtitulo && (
          <Text numberOfLines={3} style={styles.subtitulo}>
            {subtitulo}
          </Text>
        )}
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
  coluna: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 520,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  conteudoFixo: { flex: 1 },
  conteudoRolavel: { flexGrow: 1, paddingBottom: 32 },
  espacoFlutuante: { paddingBottom: 96 },
  camadaFlutuante: { ...StyleSheet.absoluteFill, alignItems: 'center' },
  colunaFlutuante: { flex: 1, width: '100%', maxWidth: 520 },
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
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  subtitulo: {
    color: cores.secundario,
    fontSize: 15,
    lineHeight: 21,
  },
});
