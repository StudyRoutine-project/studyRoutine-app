import { Image, StyleSheet, Text, View } from 'react-native';

import { cores } from '../theme/cores';

const ilustracao = require('../../assets/ilustracao.png');

export function EstadoVazio({ mensagem }: { mensagem: string }) {
  return (
    <View style={styles.conteudo}>
      <Image source={ilustracao} resizeMode="contain" aria-hidden style={styles.ilustracao} />
      <Text accessibilityLiveRegion="polite" style={styles.mensagem}>
        {mensagem}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  conteudo: { alignItems: 'center', gap: 12, paddingTop: 22 },
  ilustracao: { width: '100%', maxWidth: 220, height: 148 },
  mensagem: { color: cores.secundario, fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
