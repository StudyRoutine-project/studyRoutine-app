import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';

import { cores } from '../theme/cores';

type Props = {
  texto: string;
  onPress: () => void;
};

export function BotaoFlutuante({ texto, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}
    >
      <LinearGradient
        colors={[cores.roxoClaro, cores.roxo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradiente}
      >
        <Feather name="plus" size={20} color={cores.branco} aria-hidden />
        <Text maxFontSizeMultiplier={1.3} style={styles.texto}>
          {texto}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    position: 'absolute',
    right: 24,
    bottom: 20,
    borderRadius: 26,
    boxShadow: `0 6px 16px ${cores.roxo}47`,
  },
  pressionado: { transform: [{ scale: 0.97 }] },
  gradiente: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 52,
    paddingLeft: 18,
    paddingRight: 22,
    borderRadius: 26,
  },
  texto: { color: cores.branco, fontSize: 15, fontWeight: '700' },
});
