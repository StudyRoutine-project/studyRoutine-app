import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import type { ViewStyle } from 'react-native';

import { cores } from '../../theme/cores';

type Props = {
  texto: string;
  pergunta?: string;
  onPress: () => void;
  desativado?: boolean;
};

export function LinkConta({ texto, pergunta, onPress, desativado = false }: Props) {
  const [sobCursor, setSobCursor] = useState(false);

  return (
    <Pressable
      accessibilityLabel={texto}
      accessibilityRole="button"
      disabled={desativado}
      onHoverIn={() => setSobCursor(true)}
      onHoverOut={() => setSobCursor(false)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.link,
        (sobCursor || pressed) && !desativado && styles.realce,
        desativado && styles.desativado,
      ]}
    >
      <Text style={styles.texto}>
        {pergunta && <Text style={styles.pergunta}>{pergunta}{' '}</Text>}
        {texto}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    alignSelf: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 8,
    borderRadius: 10,
    ...Platform.select({
      web: { transitionProperty: 'background-color', transitionDuration: '140ms' } as ViewStyle,
    }),
  },
  realce: {
    backgroundColor: cores.fundo,
  },
  desativado: {
    opacity: 0.55,
  },
  pergunta: {
    color: cores.secundario,
    fontWeight: '400',
  },
  texto: {
    color: cores.roxo,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
