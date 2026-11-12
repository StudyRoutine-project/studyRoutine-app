import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from '../../theme/cores';

const opcoes = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'pendentes', rotulo: 'Pendentes' },
  { valor: 'concluidas', rotulo: 'Concluídas' },
] as const;

export type StatusAtividades = (typeof opcoes)[number]['valor'];

type Props = {
  valor: StatusAtividades;
  contagens: Record<StatusAtividades, number>;
  selecionar: (valor: StatusAtividades) => void;
};

export function FiltroStatusAtividades({ valor, contagens, selecionar }: Props) {
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Status das atividades"
      style={styles.grupo}
    >
      {opcoes.map((opcao) => {
        const ativa = opcao.valor === valor;
        const total = contagens[opcao.valor];
        return (
          <Pressable
            key={opcao.valor}
            accessibilityRole="radio"
            accessibilityLabel={`${opcao.rotulo}, ${total}`}
            aria-checked={ativa}
            onPress={() => selecionar(opcao.valor)}
            style={({ pressed }) => [
              styles.opcao,
              ativa && styles.ativa,
              pressed && styles.pressao,
            ]}
          >
            <Text style={[styles.rotulo, ativa && styles.rotuloAtivo]}>
              {opcao.rotulo} <Text style={[styles.total, ativa && styles.totalAtivo]}>{total}</Text>
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 14,
    backgroundColor: cores.fundoAviso,
  },
  opcao: {
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 10,
  },
  ativa: { borderColor: cores.borda, backgroundColor: cores.branco },
  pressao: { opacity: 0.75 },
  rotulo: { color: cores.secundario, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  rotuloAtivo: { color: cores.roxo, fontWeight: '700' },
  total: { fontWeight: '500', fontVariant: ['tabular-nums'], opacity: 0.7 },
  totalAtivo: { opacity: 1 },
});
