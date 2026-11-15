import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text } from 'react-native';

import { cores } from '../theme/cores';

type Props = {
  rotulo: string;
  onPress: () => void;
  desativada?: boolean;
};

export function AcaoEditar({ rotulo, onPress, desativada }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      disabled={desativada}
      onPress={onPress}
      style={({ pressed }) => [
        styles.botao,
        pressed && styles.pressionado,
        desativada && styles.desativado,
      ]}
    >
      <Feather name="edit-2" size={16} color={cores.roxo} aria-hidden />
      <Text style={styles.texto}>Editar</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
    minHeight: 44,
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pressionado: { backgroundColor: cores.fundoAviso },
  desativado: { opacity: 0.6 },
  texto: { flexShrink: 1, color: cores.roxo, fontSize: 14, fontWeight: '600' },
});
