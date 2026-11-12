import Feather from '@expo/vector-icons/Feather';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { cores } from '../../theme/cores';

import type { ComponentProps } from 'react';

export type OpcaoSelecao<T extends string> = {
  valor: T;
  rotulo: string;
  icone: ComponentProps<typeof Feather>['name'];
  cor: string;
};

export function ListaSelecao<T extends string>({
  opcoes,
  valor,
  selecionar,
}: {
  opcoes: readonly OpcaoSelecao<T>[];
  valor?: T;
  selecionar: (valor: T) => void;
}) {
  return (
    <ScrollView style={styles.lista} contentContainerStyle={styles.opcoes}>
      {opcoes.map((opcao) => {
        const selecionada = opcao.valor === valor;
        return (
          <Pressable
            key={opcao.valor}
            accessibilityRole="radio"
            aria-checked={selecionada}
            accessibilityLabel={opcao.rotulo}
            onPress={() => selecionar(opcao.valor)}
            style={[styles.opcao, selecionada && styles.selecionada]}
          >
            <View style={[styles.icone, { backgroundColor: `${opcao.cor}18` }]}>
              <Feather name={opcao.icone} color={opcao.cor} size={19} aria-hidden />
            </View>
            <Text style={styles.rotulo}>{opcao.rotulo}</Text>
            {selecionada && <Feather name="check" size={18} color={cores.roxo} aria-hidden />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lista: { flexGrow: 0, flexShrink: 1 },
  opcoes: { gap: 8 },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    gap: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 12,
  },
  selecionada: { backgroundColor: cores.fundoAviso, borderColor: cores.roxo },
  icone: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  rotulo: { flex: 1, color: cores.texto, fontSize: 15, fontWeight: '600' },
});
