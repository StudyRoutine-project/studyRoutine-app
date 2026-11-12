import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from '../../theme/cores';

type Props = {
  rotulo: string;
  texto?: string;
  marcada: boolean;
  desativada?: boolean;
  onPress: () => void;
};

export function CheckboxAtividade({ rotulo, texto, marcada, desativada, onPress }: Props) {
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
      <View style={[styles.caixa, marcada && styles.caixaMarcada]}>
        {marcada && <Feather name="check" size={15} color={cores.branco} aria-hidden />}
      </View>
      {texto && <Text style={styles.texto}>{texto}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
    borderRadius: 10,
  },
  comTexto: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    gap: 10,
    paddingHorizontal: 8,
  },
  pressionado: { backgroundColor: cores.fundoAviso },
  caixa: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: cores.secundario,
    borderRadius: 6,
    backgroundColor: cores.branco,
  },
  caixaMarcada: { borderColor: cores.sucesso, backgroundColor: cores.sucesso },
  texto: { flexShrink: 1, color: cores.texto, fontSize: 15, fontWeight: '600' },
});
