import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text } from 'react-native';

import type { ComponentProps } from 'react';
import type { ViewStyle } from 'react-native';

import { cores } from '../theme/cores';

type Props = {
  texto: string;
  onPress: () => void;
  ocupado?: boolean;
  concluido?: boolean;
  icone?: ComponentProps<typeof Feather>['name'];
  compacto?: boolean;
};

export function Botao({
  texto,
  onPress,
  ocupado = false,
  concluido = false,
  icone,
  compacto = false,
}: Props) {
  const [sobCursor, setSobCursor] = useState(false);
  const desativado = ocupado || concluido;

  return (
    <Pressable
      accessibilityLabel={texto}
      accessibilityRole="button"
      accessibilityLiveRegion="polite"
      accessibilityState={{ busy: ocupado, disabled: desativado }}
      disabled={desativado}
      onHoverIn={() => setSobCursor(true)}
      onHoverOut={() => setSobCursor(false)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.botao,
        sobCursor && !desativado && styles.hover,
        pressed && styles.pressao,
      ]}
    >
      <LinearGradient
        colors={[cores.roxoClaro, cores.roxo, '#2E1B88']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradiente,
          compacto && styles.gradienteCompacto,
          compacto && desativado && styles.gradienteComStatus,
        ]}
      >
        {icone && !ocupado && (
          <Feather
            accessible={false}
            aria-hidden
            name={icone}
            size={compacto ? 17 : 19}
            color={cores.branco}
          />
        )}
        <Text style={[styles.texto, compacto && styles.textoCompacto]}>{texto}</Text>
        {ocupado ? (
          <ActivityIndicator color={cores.branco} style={styles.icone} />
        ) : (
          concluido && (
            <Feather
              accessible={false}
              aria-hidden
              color={cores.branco}
              name="check"
              size={21}
              style={styles.icone}
            />
          )
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    borderRadius: 27,
    overflow: 'hidden',
    ...Platform.select({
      web: { transitionProperty: 'opacity, transform', transitionDuration: '140ms' } as ViewStyle,
    }),
  },
  hover: {
    opacity: 0.92,
  },
  pressao: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
  gradiente: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 52,
    paddingVertical: 12,
  },
  gradienteCompacto: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 9 },
  gradienteComStatus: { paddingHorizontal: 44 },
  texto: {
    flexShrink: 1,
    color: cores.branco,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  textoCompacto: { fontSize: 14 },
  icone: {
    position: 'absolute',
    right: 18,
  },
});
