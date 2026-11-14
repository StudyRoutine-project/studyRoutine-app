import Feather from '@expo/vector-icons/Feather';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import { cores } from '../../theme/cores';

type Props = {
  rotulo: string;
  texto?: string;
  marcada: boolean;
  desativada?: boolean;
  onPress: () => void;
};

export function CheckboxAtividade({ rotulo, texto, marcada, desativada, onPress }: Props) {
  const escala = useRef(new Animated.Value(1)).current;
  const anterior = useRef(marcada);

  useEffect(() => {
    if (anterior.current === marcada) return;
    anterior.current = marcada;
    escala.setValue(0.75);
    Animated.spring(escala, {
      toValue: 1,
      friction: 4,
      tension: 160,
      useNativeDriver: true,
    }).start();
  }, [marcada, escala]);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={rotulo}
      aria-checked={marcada}
      disabled={desativada}
      onPress={onPress}
      style={({ pressed }) => [
        styles.botao,
        texto && styles.comTexto,
        pressed && styles.pressionado,
      ]}
    >
      <Animated.View
        style={[styles.caixa, marcada && styles.caixaMarcada, { transform: [{ scale: escala }] }]}
      >
        <Feather
          name="check"
          size={15}
          color={marcada ? cores.branco : cores.borda}
          aria-hidden
        />
      </Animated.View>
      {texto && <Text style={styles.texto}>{texto}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    minHeight: 48,
    borderRadius: 24,
  },
  comTexto: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    gap: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  pressionado: { backgroundColor: `${cores.sucesso}12` },
  caixa: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: cores.bordaForte,
    borderRadius: 13,
    backgroundColor: cores.branco,
  },
  caixaMarcada: {
    borderColor: cores.sucesso,
    backgroundColor: cores.sucesso,
    boxShadow: `0 0 0 4px ${cores.sucesso}1F`,
  },
  texto: { flexShrink: 1, color: cores.texto, fontSize: 15, fontWeight: '600' },
});
