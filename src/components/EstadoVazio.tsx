import { Image, StyleSheet, Text, View } from 'react-native';

import { cores } from '../theme/cores';

import type { ReactNode } from 'react';

const ilustracoes = {
  atividades: require('../../assets/atividades.png'),
  disciplinas: require('../../assets/disciplinas.png'),
  busca: require('../../assets/busca.png'),
  emDia: require('../../assets/em-dia.png'),
};

type Props = {
  ilustracao: keyof typeof ilustracoes;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
};

export function EstadoVazio({ ilustracao, titulo, descricao, acao }: Props) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.conteudo}>
      <Image
        source={ilustracoes[ilustracao]}
        style={styles.ilustracao}
        resizeMode="contain"
        aria-hidden
      />
      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        {descricao && <Text style={styles.descricao}>{descricao}</Text>}
      </View>
      {acao}
    </View>
  );
}

const styles = StyleSheet.create({
  conteudo: { alignItems: 'center', gap: 14, paddingVertical: 20, paddingHorizontal: 12 },
  ilustracao: { width: 152, height: 114 },
  textos: { alignItems: 'center', gap: 4 },
  titulo: { color: cores.texto, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  descricao: {
    maxWidth: 280,
    color: cores.secundario,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
