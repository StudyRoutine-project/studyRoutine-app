import { StyleSheet, Text, View } from 'react-native';

import { cores } from '../theme/cores';

type Props = {
  titulo: string;
  total?: number;
};

export function CabecalhoSecao({ titulo, total }: Props) {
  return (
    <View style={styles.cabecalho}>
      <Text accessibilityRole="header" style={styles.texto}>
        {titulo}
      </Text>
      {total !== undefined && <Text style={styles.total}>{total}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  texto: { color: cores.texto, fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  total: {
    minWidth: 24,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    color: cores.secundario,
    backgroundColor: cores.branco,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});
