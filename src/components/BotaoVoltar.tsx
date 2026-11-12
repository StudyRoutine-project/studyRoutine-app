import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet } from 'react-native';

import { cores } from '../theme/cores';

type Props = {
  onPress: () => void;
  desativado?: boolean;
};

export function BotaoVoltar({ onPress, desativado = false }: Props) {
  return (
    <Pressable
      accessibilityLabel="Voltar"
      accessibilityRole="button"
      disabled={desativado}
      onPress={onPress}
      style={({ pressed }) => [
        styles.botao,
        pressed && styles.pressionado,
        desativado && styles.desativado,
      ]}
    >
      <Feather accessible={false} aria-hidden color={cores.roxo} name="chevron-left" size={24} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  pressionado: {
    opacity: 0.7,
  },
  desativado: {
    opacity: 0.55,
  },
});
