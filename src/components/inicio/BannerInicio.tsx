import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, Text, View } from 'react-native';

import { cores } from '../../theme/cores';

const planejamento = require('../../../assets/planejamento.png');

type Props = {
  titulo: string;
  descricao: string;
};

export function BannerInicio({ titulo, descricao }: Props) {
  return (
    <LinearGradient
      colors={[cores.fundoAviso, cores.branco]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <Image
        source={planejamento}
        style={styles.ilustracao}
        resizeMode="contain"
        aria-hidden
      />
      <View style={styles.conteudo}>
        <Text accessibilityRole="header" style={styles.titulo}>
          {titulo}
        </Text>
        <Text style={styles.descricao}>{descricao}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    overflow: 'hidden',
    minHeight: 136,
    justifyContent: 'center',
    padding: 18,
    borderRadius: 24,
    boxShadow: `0 8px 24px ${cores.roxo}14`,
  },
  ilustracao: { position: 'absolute', right: -4, bottom: 2, width: 140, height: 109 },
  conteudo: { gap: 6, maxWidth: '58%' },
  titulo: {
    color: cores.texto,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 24,
  },
  descricao: { color: cores.secundario, fontSize: 13, lineHeight: 18 },
});
