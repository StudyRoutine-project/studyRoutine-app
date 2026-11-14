import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from '../theme/cores';
import { superficie } from '../theme/superficie';

type Props = {
  mensagem: string;
  tentarDeNovo: () => void;
};

export function EstadoErro({ mensagem, tentarDeNovo }: Props) {
  return (
    <View style={[superficie, styles.cartao]}>
      <View style={styles.icone}>
        <Feather name="cloud-off" size={18} color={cores.erro} aria-hidden />
      </View>
      <Text accessibilityRole="alert" style={styles.mensagem}>
        {mensagem}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={tentarDeNovo}
        style={({ pressed }) => [styles.acao, pressed && styles.pressionado]}
      >
        <Feather name="rotate-cw" size={15} color={cores.roxo} aria-hidden />
        <Text style={styles.textoAcao}>Tentar de novo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, padding: 14 },
  icone: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: `${cores.erro}14`,
  },
  mensagem: { flex: 1, minWidth: 140, color: cores.texto, fontSize: 14, fontWeight: '600' },
  acao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: cores.fundoAviso,
  },
  pressionado: { opacity: 0.7 },
  textoAcao: { color: cores.roxo, fontSize: 14, fontWeight: '700' },
});
