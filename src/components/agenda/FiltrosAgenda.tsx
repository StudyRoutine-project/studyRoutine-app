import { CaretDownIcon, XIcon } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from '../../theme/cores';
import { ListaSelecao } from '../atividades/ListaSelecao';
import { PainelSelecao } from '../atividades/PainelSelecao';
import { opcoesTipo } from '../atividades/tiposAtividade';
import { IconeDisciplina } from '../disciplinas/IconeDisciplina';

import type { TipoAtividade } from '../../database/atividades';
import type { Disciplina } from '../../database/disciplinas';
import type { OpcaoSelecao } from '../atividades/ListaSelecao';

export type PreferenciasAgenda = {
  disciplinaId: string | null;
  tipo: TipoAtividade | null;
};

type Props = {
  disciplinas: Disciplina[];
  valor: PreferenciasAgenda;
  alterar: (preferencias: PreferenciasAgenda) => void;
};

const tipos: OpcaoSelecao<TipoAtividade | ''>[] = [
  { valor: '', rotulo: 'Todos os tipos', icone: 'layers', cor: cores.roxo },
  ...opcoesTipo,
];

export function FiltrosAgenda({ disciplinas, valor, alterar }: Props) {
  const [aberto, setAberto] = useState<'disciplina' | 'tipo'>();
  const disciplina = disciplinas.find(({ id }) => id === valor.disciplinaId);
  const tipo = tipos.find((opcao) => opcao.valor === valor.tipo);
  const opcoesDisciplina: OpcaoSelecao<string>[] = [
    { valor: '', rotulo: 'Todas as disciplinas', icone: IconeDisciplina, cor: cores.roxo },
    ...disciplinas.map(({ id, nome, cor }) => ({
      valor: id,
      rotulo: nome,
      icone: IconeDisciplina,
      cor,
    })),
  ];

  return (
    <View style={styles.filtros}>
      <Filtro
        rotulo="Disciplina"
        selecionado={disciplina?.nome}
        abrir={() => setAberto('disciplina')}
        limpar={() => alterar({ ...valor, disciplinaId: null })}
      />
      <Filtro
        rotulo="Tipo"
        selecionado={tipo?.rotulo}
        abrir={() => setAberto('tipo')}
        limpar={() => alterar({ ...valor, tipo: null })}
      />
      {aberto && (
        <PainelSelecao
          titulo={aberto === 'disciplina' ? 'Filtrar por disciplina' : 'Filtrar por tipo'}
          fechar={() => setAberto(undefined)}
        >
          {aberto === 'disciplina' ? (
            <ListaSelecao
              opcoes={opcoesDisciplina}
              valor={disciplina?.id ?? ''}
              selecionar={(id) => {
                alterar({ ...valor, disciplinaId: id || null });
                setAberto(undefined);
              }}
            />
          ) : (
            <ListaSelecao
              opcoes={tipos}
              valor={valor.tipo ?? ''}
              selecionar={(tipo) => {
                alterar({ ...valor, tipo: tipo || null });
                setAberto(undefined);
              }}
            />
          )}
        </PainelSelecao>
      )}
    </View>
  );
}

function Filtro({
  rotulo,
  selecionado,
  abrir,
  limpar,
}: {
  rotulo: string;
  selecionado?: string;
  abrir: () => void;
  limpar: () => void;
}) {
  const ativo = selecionado !== undefined;

  return (
    <View style={[styles.filtro, ativo && styles.ativo]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Filtrar por ${rotulo.toLowerCase()}, ${selecionado ?? 'todos'}`}
        hitSlop={{ top: 6, bottom: 6 }}
        onPress={abrir}
        style={({ pressed }) => [styles.abrir, pressed && styles.pressionado]}
      >
        <Text numberOfLines={1} style={[styles.rotulo, ativo && styles.rotuloAtivo]}>
          {selecionado ?? rotulo}
        </Text>
        {!ativo && <CaretDownIcon size={14} color={cores.secundario} aria-hidden />}
      </Pressable>
      {ativo && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Limpar filtro de ${rotulo.toLowerCase()}`}
          hitSlop={{ top: 6, bottom: 6, right: 6 }}
          onPress={limpar}
          style={({ pressed }) => [styles.limpar, pressed && styles.pressionado]}
        >
          <XIcon size={14} weight="bold" color={cores.roxo} aria-hidden />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filtro: {
    maxWidth: '100%',
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
  },
  ativo: { borderColor: `${cores.roxo}40`, backgroundColor: cores.fundoAviso },
  abrir: {
    flexShrink: 1,
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
  },
  limpar: {
    width: 30,
    height: 34,
    marginLeft: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressionado: { opacity: 0.6 },
  rotulo: { flexShrink: 1, color: cores.texto, fontSize: 13, fontWeight: '600' },
  rotuloAtivo: { color: cores.roxo },
});
