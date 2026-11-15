import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { cores } from '../../theme/cores';

type Props = {
  cor: string;
  corOriginal?: string;
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

function distanciaEntreCores(primeira: string, segunda: string) {
  return [1, 3, 5].reduce((distancia, inicio) => {
    const a = Number.parseInt(primeira.slice(inicio, inicio + 2), 16);
    const b = Number.parseInt(segunda.slice(inicio, inicio + 2), 16);
    return distancia + (a - b) ** 2;
  }, 0);
}

export function SeletorCorDisciplina({
  cor,
  corOriginal = cores.roxo,
  onChange,
  desativado,
}: Props) {
  const { width } = useWindowDimensions();
  // Mostra o tom salvo no lugar da cor mais parecida da paleta.
  const opcaoOriginal = coresDisciplina.reduce((maisProxima, opcao) =>
    distanciaEntreCores(corOriginal, opcao.valor) <
    distanciaEntreCores(corOriginal, maisProxima.valor)
      ? opcao
      : maisProxima,
  );

  return (
    <View style={styles.seletor}>
      <Text style={styles.rotulo}>Cor</Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Cor da disciplina"
        style={styles.grade}
      >
        {coresDisciplina.map((opcao) => {
          const valor = opcao === opcaoOriginal ? corOriginal : opcao.valor;
          const selecionada = valor.toUpperCase() === cor.toUpperCase();
          const nome =
            valor.toUpperCase() === opcao.valor.toUpperCase() ? opcao.nome : 'Cor original';
          return (
            <Pressable
              key={opcao.valor}
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
