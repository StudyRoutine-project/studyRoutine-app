import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, Text, View } from 'react-native';

import { cores } from '../../theme/cores';

import type { ComponentProps } from 'react';

type Props = {
  disciplinas: number;
  pendentes: number;
  concluidas: number;
};

export function ResumoEstudos({ disciplinas, pendentes, concluidas }: Props) {
  const indicadores = [
    { rotulo: 'Disciplinas', valor: disciplinas, icone: 'book-open', cor: cores.roxo },
    { rotulo: 'Pendentes', valor: pendentes, icone: 'clock', cor: cores.aviso },
    { rotulo: 'Concluídas', valor: concluidas, icone: 'check', cor: cores.sucesso },
  ] satisfies {
    rotulo: string;
    valor: number;
    icone: ComponentProps<typeof Feather>['name'];
    cor: string;
  }[];

  return (
    <View style={styles.resumo}>
      {indicadores.map(({ rotulo, valor, icone, cor }) => (
        <View key={rotulo} style={styles.cartao}>
          <View style={styles.contagem}>
            <Feather name={icone} size={21} color={cor} aria-hidden />
            <Text style={styles.numero}>{valor}</Text>
          </View>
          <Text style={styles.rotulo}>{rotulo}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  resumo: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cartao: {
    flexBasis: 82,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 102,
    gap: 8,
    paddingHorizontal: 7,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  contagem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  numero: { color: cores.texto, fontSize: 25, fontWeight: '700', fontVariant: ['tabular-nums'] },
  rotulo: { color: cores.secundario, fontSize: 12, textAlign: 'center' },
});
