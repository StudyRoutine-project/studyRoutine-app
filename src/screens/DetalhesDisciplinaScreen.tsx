import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AcaoEditar } from '../components/AcaoEditar';
import { BotaoFlutuante } from '../components/BotaoFlutuante';
import { CabecalhoSecao } from '../components/CabecalhoSecao';
import { EstadoErro } from '../components/EstadoErro';
import { EstadoVazio } from '../components/EstadoVazio';
import { LayoutInterno, TituloTela } from '../components/LayoutInterno';
import { ResumoNumeros } from '../components/ResumoNumeros';
import { FiltroStatusAtividades } from '../components/atividades/FiltroStatusAtividades';
import { ListaAtividades } from '../components/atividades/ListaAtividades';
import {
  agruparPorSituacao,
  ordenarPorUrgencia,
} from '../components/atividades/situacaoAtividade';
import { listarAtividadesDisciplina } from '../database/atividades';
import { buscarDisciplina } from '../database/disciplinas';
import { useConclusaoAtividade } from '../hooks/useConclusaoAtividade';
import { useHorarioAtual } from '../hooks/useHorarioAtual';
import { observarAtividadesDosLembretes } from '../services/lembretes';
import { cores } from '../theme/cores';

import type { ComponentProps } from 'react';
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

const vazioPorFiltro = {
  todas: { ilustracao: 'atividades', titulo: 'Nenhuma atividade nesta disciplina' },
  pendentes: { ilustracao: 'emDia', titulo: 'Nenhuma atividade pendente' },
  atrasadas: { ilustracao: 'emDia', titulo: 'Nenhuma atividade atrasada' },
  concluidas: { ilustracao: 'atividades', titulo: 'Nenhuma atividade concluída' },
} satisfies Record<StatusAtividades, ComponentProps<typeof EstadoVazio>>;

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
  const conclusao = useConclusaoAtividade(usuarioId, (id, concluida) => {
    setEstado((atual) => {
      if (!atual || typeof atual === 'string') return atual;

      return {
        ...atual,
        atividades: atual.atividades.map((item) =>
          item.id === id ? { ...item, concluida } : item,
        ),
      };
    });
  });

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
    const atividades = lista?.atividades ?? [];
    const { atrasada, hoje, pendente, concluida } = agruparPorSituacao(atividades, agora);
    return {
      todas: ordenarPorUrgencia(atividades, agora),
      pendentes: [...hoje, ...pendente],
      atrasadas: atrasada,
      concluidas: concluida,
    } satisfies Record<StatusAtividades, Atividade[]>;
  }, [lista?.atividades, agora]);

  if (!lista) {
    return (
      <LayoutInterno titulo="Disciplina" voltar={voltar}>
        {estado === 'carregando' ? (
          <ActivityIndicator color={cores.roxo} accessibilityLabel="Carregando disciplina" />
        ) : estado === 'erro' ? (
          <EstadoErro
            mensagem="Não foi possível carregar a disciplina."
            tentarDeNovo={() => setTentativa((atual) => atual + 1)}
          />
        ) : (
          <EstadoVazio ilustracao="busca" titulo="Disciplina indisponível" />
        )}
      </LayoutInterno>
    );
  }

  const { disciplina } = lista;
  const total = atividadesPorStatus.todas.length;
  const concluidas = atividadesPorStatus.concluidas.length;
  const contagens = {
    todas: total,
    pendentes: atividadesPorStatus.pendentes.length,
    atrasadas: atividadesPorStatus.atrasadas.length,
    concluidas,
  };
  const atividades = atividadesPorStatus[filtro];

  return (
    <LayoutInterno
      rolavel
      voltar={voltar}
      flutuante={<BotaoFlutuante texto="Nova atividade" onPress={novaAtividade} />}
    >
      <View style={styles.conteudo}>
        <View>
          <TituloTela
            titulo={disciplina.nome}
            subtitulo={disciplina.descricao ?? undefined}
            acao={<AcaoEditar rotulo="Editar disciplina" onPress={editarDisciplina} />}
          />
          {total > 0 && (
            <ResumoNumeros
              atrasadas={contagens.atrasadas}
              concluidas={concluidas}
              total={total}
            />
          )}
        </View>

        <View style={styles.secao}>
          <CabecalhoSecao titulo="Atividades" />
          {total > 0 && (
            <FiltroStatusAtividades valor={filtro} contagens={contagens} selecionar={setFiltro} />
          )}
        </View>

        {atividades.length > 0 ? (
          <ListaAtividades
            atividades={atividades}
            agora={agora}
            conclusao={conclusao}
            abrirAtividade={abrirAtividade}
          />
        ) : (
          <EstadoVazio {...vazioPorFiltro[filtro]} />
        )}
      </View>
    </LayoutInterno>
  );
}

const styles = StyleSheet.create({
  conteudo: { gap: 20 },
  secao: { gap: 12 },
});
