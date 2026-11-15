import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet } from 'react-native';

import { cores } from '../theme/cores';

type Props = {
  rotulo: string;
  onPress: () => void;
};

export function BotaoFechar({ rotulo, onPress }: Props) {
  return (
    <Pressable
      accessibilityLabel={rotulo}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.botao, pressed && styles.pressao]}
    >
      <Feather name="x" size={21} color={cores.erro} aria-hidden />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  pressao: { opacity: 0.65 },
});
