import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { cores } from '../../theme/cores';

type Props = {
  cor: string;
  onChange: (cor: string) => void;
  desativado: boolean;
};

const coresDisciplina = [
  { nome: 'Vermelho', valor: '#BB354A' },
  { nome: 'Verde', valor: '#268054' },
  { nome: 'Amarelo', valor: '#F2BE38' },
  { nome: 'Rosa', valor: '#D34E86' },
  { nome: 'Roxo', valor: cores.roxo },
  { nome: 'Azul', valor: '#2866AD' },
  { nome: 'Cinza', valor: '#697385' },
  { nome: 'Laranja', valor: '#CE591F' },
];

export function SeletorCorDisciplina({ cor, onChange, desativado }: Props) {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.seletor}>
      <Text style={styles.rotulo}>Cor</Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Cor da disciplina"
        style={styles.grade}
      >
        {coresDisciplina.map(({ nome, valor }) => {
          const selecionada = valor === cor;
          return (
            <Pressable
              key={valor}
              accessibilityRole="radio"
              accessibilityLabel={nome}
              aria-checked={selecionada}
              disabled={desativado}
              onPress={() => onChange(valor)}
              style={[styles.opcao, width < 400 && styles.opcaoEstreita]}
            >
              <View style={[styles.contorno, selecionada && styles.selecionada]}>
                <View style={[styles.amostra, { backgroundColor: valor }]}>
                  {selecionada && (
                    <View style={styles.marca}>
                      <Feather name="check" size={13} color={cores.texto} aria-hidden />
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  seletor: { gap: 4 },
  rotulo: { color: cores.texto, fontSize: 14, fontWeight: '600' },
  grade: { flexDirection: 'row', flexWrap: 'wrap' },
  opcao: { width: '12.5%', height: 48, alignItems: 'center', justifyContent: 'center' },
  opcaoEstreita: { width: '25%' },
  contorno: {
    width: 40,
    height: 40,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selecionada: { borderColor: cores.roxo },
  amostra: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marca: { backgroundColor: cores.branco, borderRadius: 8, padding: 1 },
});
