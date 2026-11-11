import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import type { TextStyle } from 'react-native';

import { cores } from '../../theme/cores';

type Props = {
  texto: string;
  pergunta?: string;
  onPress: () => void;
  desativado?: boolean;
  discreto?: boolean;
};

export function LinkConta({ texto, pergunta, onPress, desativado = false, discreto = false }: Props) {
  const [sobCursor, setSobCursor] = useState(false);

  return (
    <Pressable
      accessibilityLabel={texto}
      accessibilityRole="link"
      disabled={desativado}
      onHoverIn={() => setSobCursor(true)}
      onHoverOut={() => setSobCursor(false)}
      onPress={onPress}
      style={[styles.link, desativado && styles.desativado]}
    >
      {({ pressed }) => (
        <Text style={[styles.texto, discreto && styles.discreto]}>
          {pergunta && <Text style={styles.pergunta}>{pergunta}{' '}</Text>}
          <Text
            style={[
              styles.acao,
              (sobCursor || pressed) && !desativado && styles.textoRealcado,
            ]}
          >
            {texto}
          </Text>
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    alignSelf: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 8,
  },
  desativado: {
    opacity: 0.55,
  },
  pergunta: {
    color: cores.secundario,
    fontWeight: '400',
  },
  texto: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  discreto: {
    fontSize: 14,
    fontWeight: '500',
  },
  acao: {
    color: cores.roxo,
    ...Platform.select({
      web: {
        textUnderlineOffset: 4,
        textDecorationThickness: 1,
        transitionProperty: 'color, text-decoration-color',
        transitionDuration: '140ms',
      } as TextStyle,
    }),
  },
  textoRealcado: {
    color: cores.roxoClaro,
    textDecorationColor: cores.roxoClaro,
    textDecorationLine: 'underline',
  },
});
