import { StyleSheet, Text, View } from 'react-native';

import { cores } from '../theme/cores';
import { superficie } from '../theme/superficie';

import type { Icon } from 'phosphor-react-native';

type Props = {
  icone: Icon;
  cor: string;
  valor: number;
  complemento?: string;
  rotulo: string;
  progresso?: number;
};

export function IndicadorNumero({
  icone: Icone,
  cor,
  valor,
  complemento,
  rotulo,
  progresso,
}: Props) {
  return (
    <View
      accessible
      accessibilityLabel={[valor, complemento, rotulo].filter(Boolean).join(' ')}
      style={[superficie, styles.indicador]}
    >
      <View style={[styles.selo, { backgroundColor: `${cor}17` }]}>
        <Icone weight="fill" color={cor} size={26} aria-hidden />
      </View>
      <View style={styles.textos}>
        <Text style={styles.valor}>
          {valor}
          {complemento && <Text style={styles.complemento}> {complemento}</Text>}
        </Text>
        <Text numberOfLines={1} style={styles.rotulo}>
          {rotulo}
        </Text>
        {progresso !== undefined && (
          <View style={[styles.trilho, { backgroundColor: `${cor}1F` }]}>
            <View
              style={[
                styles.preenchido,
                { width: `${Math.round(progresso * 100)}%`, backgroundColor: cor },
              ]}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  indicador: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  selo: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
  },
  textos: { flex: 1, gap: 1 },
  valor: {
    color: cores.texto,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
  },
  complemento: { color: cores.secundario, fontSize: 13, fontWeight: '500', letterSpacing: 0 },
  rotulo: { color: cores.secundario, fontSize: 13, fontWeight: '500' },
  trilho: { height: 5, marginTop: 6, overflow: 'hidden', borderRadius: 3 },
  preenchido: { height: '100%', borderRadius: 3 },
});
