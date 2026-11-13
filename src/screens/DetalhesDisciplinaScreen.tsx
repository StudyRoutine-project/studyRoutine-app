import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { AcaoEditar } from '../components/AcaoEditar';
import { Botao } from '../components/Botao';
import { EstadoVazio } from '../components/EstadoVazio';
import { LayoutInterno, TituloTela } from '../components/LayoutInterno';
import { MensagemErro } from '../components/MensagemErro';
import { FichaAtividade } from '../components/atividades/FichaAtividade';
import { FiltroStatusAtividades } from '../components/atividades/FiltroStatusAtividades';
import { listarAtividadesDisciplina } from '../database/atividades';
import { buscarDisciplina } from '../database/disciplinas';
import { useConclusaoAtividade } from '../hooks/useConclusaoAtividade';
import { useHorarioAtual } from '../hooks/useHorarioAtual';
import { observarAtividadesDosLembretes } from '../services/lembretes';
import { cores } from '../theme/cores';
import { prazoVencido } from '../utils/datas';

import type { Atividade } from '../database/atividades';
import type { Disciplina } from '../database/disciplinas';
import type { StatusAtividades } from '../components/atividades/FiltroStatusAtividades';

type Props = {
  usuarioId: string;
  disciplinaId: string;
  voltar: () => void;
  editarDisciplina: () => void;
  novaAtividade: () => void;
  abrirAtividade: (atividadeId: string) => void;
};

type Estado = 'carregando' | 'erro' | null | { disciplina: Disciplina; atividades: Atividade[] };

export function DetalhesDisciplinaScreen({
  usuarioId,
  disciplinaId,
  voltar,
  editarDisciplina,
  novaAtividade,
  abrirAtividade,
}: Props) {
  const [estado, setEstado] = useState<Estado>('carregando');
  const [tentativa, setTentativa] = useState(0);
  const [filtro, setFiltro] = useState<StatusAtividades>('todas');
  const agora = useHorarioAtual();
  const { alterarConclusao, atividadeSalvando, erroConclusao } = useConclusaoAtividade(
    usuarioId,
    (id, concluida) => {
      setEstado((atual) => {
        if (!atual || typeof atual === 'string') return atual;

        return {
          ...atual,
          atividades: atual.atividades.map((item) =>
            item.id === id ? { ...item, concluida } : item,
          ),
        };
      });
    },
  );

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setEstado('carregando');
      void Promise.all([
        buscarDisciplina(usuarioId, disciplinaId),
        listarAtividadesDisciplina(usuarioId, disciplinaId),
      ]).then(
        ([disciplina, atividades]) => {
          if (ativo) setEstado(disciplina ? { disciplina, atividades } : null);
        },
        () => {
          if (ativo) setEstado('erro');
        },
      );
      const pararObservacao = observarAtividadesDosLembretes((conta, atividade) => {
        if (conta !== usuarioId || atividade.disciplina_id !== disciplinaId) return;
        setEstado((atual) => {
          if (!atual || typeof atual === 'string') return atual;
          const atividades = atual.atividades.map((item) =>
            item.id === atividade.id ? { ...item, ...atividade } : item,
          );
          atividades.sort(
            (a, b) =>
              a.data.localeCompare(b.data) ||
              (a.horario ?? '24:00').localeCompare(b.horario ?? '24:00') ||
              a.id.localeCompare(b.id),
          );
          return { ...atual, atividades };
        });
      });
      return () => {
        ativo = false;
        pararObservacao();
      };
    }, [usuarioId, disciplinaId, tentativa]),
  );

  const lista = estado && typeof estado === 'object' ? estado : null;
  const atividadesPorStatus = useMemo(() => {
    const grupos: Record<StatusAtividades, Atividade[]> = {
      todas: lista?.atividades ?? [],
      pendentes: [],
      atrasadas: [],
      concluidas: [],
    };
    for (const atividade of grupos.todas) {
      if (atividade.concluida) {
        grupos.concluidas.push(atividade);
      } else if (prazoVencido(atividade.data, atividade.horario, agora)) {
        grupos.atrasadas.push(atividade);
      } else {
        grupos.pendentes.push(atividade);
      }
    }
    return grupos;
  }, [lista?.atividades, agora]);
  const temAtividades = atividadesPorStatus.todas.length > 0;
  const contagens = {
    todas: atividadesPorStatus.todas.length,
    pendentes: atividadesPorStatus.pendentes.length,
    atrasadas: atividadesPorStatus.atrasadas.length,
    concluidas: atividadesPorStatus.concluidas.length,
  };

  return (
    <LayoutInterno titulo={lista ? undefined : 'Disciplina'} voltar={voltar}>
      {lista ? (
        <FlatList
          data={atividadesPorStatus[filtro]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          ListHeaderComponent={
            <>
              <TituloTela
                titulo={lista.disciplina.nome}
                subtitulo={lista.disciplina.descricao ?? undefined}
                acao={<AcaoEditar rotulo="Editar disciplina" onPress={editarDisciplina} />}
              />
              <View style={styles.cabecalhoAtividades}>
                <Text accessibilityRole="header" style={styles.subtitulo}>
                  Atividades
                </Text>
                {temAtividades && (
                  <Botao texto="Nova atividade" icone="plus" onPress={novaAtividade} compacto />
                )}
              </View>
              {temAtividades && (
                <View style={styles.filtro}>
                  <FiltroStatusAtividades
                    valor={filtro}
                    contagens={contagens}
                    selecionar={setFiltro}
                  />
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            temAtividades ? (
              <EstadoVazio
                mensagem={
                  filtro === 'pendentes'
                    ? 'Nenhuma atividade pendente'
                    : filtro === 'atrasadas'
                      ? 'Nenhuma atividade atrasada'
                      : 'Nenhuma atividade concluída'
                }
              />
            ) : (
              <View style={styles.vazio}>
                <EstadoVazio mensagem="Nenhuma atividade nesta disciplina" />
                <View style={styles.acaoVazio}>
                  <Botao texto="Nova atividade" icone="plus" onPress={novaAtividade} />
                </View>
              </View>
            )
          }
          renderItem={({ item }) => (
            <View style={styles.item}>
              <FichaAtividade
                atividade={item}
                agora={agora}
                onPress={() => abrirAtividade(item.id)}
                onAlterarConclusao={() => void alterarConclusao(item)}
                salvando={atividadeSalvando === item.id}
                conclusaoDesativada={atividadeSalvando !== undefined}
              />
              {erroConclusao === item.id && (
                <MensagemErro mensagem="Não foi possível atualizar a atividade. Tente de novo." />
              )}
            </View>
          )}
        />
      ) : estado === 'carregando' ? (
        <ActivityIndicator color={cores.roxo} accessibilityLabel="Carregando disciplina" />
      ) : estado === 'erro' ? (
        <View style={styles.erro}>
          <MensagemErro mensagem="Não foi possível carregar a disciplina." />
          <Botao texto="Tentar de novo" onPress={() => setTentativa((atual) => atual + 1)} />
        </View>
      ) : (
        <EstadoVazio mensagem="Disciplina indisponível" />
      )}
    </LayoutInterno>
  );
}

const styles = StyleSheet.create({
  cabecalhoAtividades: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: cores.borda,
  },
  subtitulo: { flexShrink: 1, color: cores.texto, fontSize: 21, fontWeight: '700' },
  filtro: { marginTop: 12 },
  vazio: { gap: 16, paddingBottom: 8 },
  acaoVazio: { alignSelf: 'center', width: '100%', maxWidth: 280 },
  lista: { gap: 12, paddingBottom: 20 },
  item: { gap: 6 },
  erro: { gap: 12 },
});
