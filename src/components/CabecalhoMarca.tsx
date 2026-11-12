import { Image, StyleSheet, View } from 'react-native';

import type { ReactNode } from 'react';

const logoNome = require('../../assets/logo-nome.png');

type Props = {
  acao?: ReactNode;
  acaoDireita?: ReactNode;
  compacto?: boolean;
};

export function CabecalhoMarca({ acao, acaoDireita, compacto = false }: Props) {
  return (
    <View style={styles.cabecalho}>
      {acao}
      <Image
        accessible
        accessibilityLabel="StudyRoutine"
        resizeMode="contain"
        source={logoNome}
        style={[styles.logo, compacto && styles.logoCompacto]}
      />
      {acaoDireita && <View style={styles.acaoDireita}>{acaoDireita}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logo: {
    flexShrink: 1,
    width: '72%',
    maxWidth: 264,
    height: 'auto',
    aspectRatio: 590 / 106,
  },
  logoCompacto: { width: '60%', maxWidth: 212 },
  acaoDireita: { marginLeft: 'auto' },
});
