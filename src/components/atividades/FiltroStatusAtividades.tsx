import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { cores } from '../../theme/cores';
import { ListaSelecao } from './ListaSelecao';
import { PainelSelecao } from './PainelSelecao';

import type { OpcaoSelecao } from './ListaSelecao';

export type StatusAtividades = 'todas' | 'pendentes' | 'atrasadas' | 'concluidas';

const opcoes = [
  { valor: 'todas', rotulo: 'Todas', icone: 'layers', cor: cores.roxo },
  { valor: 'pendentes', rotulo: 'Pendentes', icone: 'clock', cor: cores.aviso },
  { valor: 'atrasadas', rotulo: 'Atrasadas', icone: 'alert-triangle', cor: cores.erro },
  { valor: 'concluidas', rotulo: 'Concluídas', icone: 'check-circle', cor: cores.sucesso },
] satisfies OpcaoSelecao<StatusAtividades>[];

type Props = {
  valor: StatusAtividades;
  contagens: Record<StatusAtividades, number>;
  selecionar: (valor: StatusAtividades) => void;
};

export function FiltroStatusAtividades({ valor, contagens, selecionar }: Props) {
  const [aberto, setAberto] = useState(false);
  const atual = opcoes.find((opcao) => opcao.valor === valor) ?? opcoes[0];

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Filtrar atividades. Filtro atual: ${atual.rotulo}`}
        accessibilityState={{ expanded: aberto }}
        onPress={() => setAberto(true)}
        style={({ pressed }) => [styles.botao, pressed && styles.pressao]}
      >
        <Feather name="sliders" size={16} color={cores.roxo} aria-hidden />
        <Text style={styles.rotulo}>{atual.rotulo}</Text>
        <Text style={styles.contagem}>{contagens[valor]}</Text>
        <Feather name="chevron-down" size={16} color={cores.secundario} aria-hidden />
      </Pressable>
      {aberto && (
        <PainelSelecao titulo="Filtrar atividades" fechar={() => setAberto(false)}>
          <ListaSelecao
            opcoes={opcoes.map((opcao) => ({ ...opcao, total: contagens[opcao.valor] }))}
            valor={valor}
            selecionar={(escolha) => {
              selecionar(escolha);
              setAberto(false);
            }}
          />
        </PainelSelecao>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  botao: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    maxWidth: '100%',
    paddingHorizontal: 11,
    paddingVertical: 6,
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
  },
  pressao: { backgroundColor: cores.fundoAviso },
  rotulo: { flexShrink: 1, color: cores.texto, fontSize: 14, fontWeight: '600' },
  contagem: {
    color: cores.secundario,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
