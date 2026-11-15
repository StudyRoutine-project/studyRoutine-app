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
import { listarAtividadesDisciplina } from '../database/atividades';
import { observarDadosSincronizados } from '../database/dadosSincronizados';
import { buscarDisciplina } from '../database/disciplinas';
import { marcarConclusao, useConclusaoAtividade } from '../hooks/useConclusaoAtividade';
import { useHorarioAtual } from '../hooks/useHorarioAtual';
import { observarAtividadesDosLembretes } from '../services/lembretes';
import { cores } from '../theme/cores';
import { agruparPorSituacao } from '../utils/situacaoAtividade';

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

function separarPorStatus(atividades: Atividade[], agora: number) {
  const { atrasada, hoje, pendente, concluida } = agruparPorSituacao(atividades, agora);
  return {
    todas: atividades,
    pendentes: [...hoje, ...pendente],
    atrasadas: atrasada,
    concluidas: concluida,
  } satisfies Record<StatusAtividades, Atividade[]>;
}

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
      return { ...atual, atividades: marcarConclusao(atual.atividades, id, concluida) };
    });
  });

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      let versao = 0;

      function carregar() {
        const leitura = ++versao;
        void Promise.all([
          buscarDisciplina(usuarioId, disciplinaId),
          listarAtividadesDisciplina(usuarioId, disciplinaId),
        ]).then(
          ([disciplina, atividades]) => {
            if (ativo && leitura === versao) setEstado(disciplina ? { disciplina, atividades } : null);
          },
          () => {
            if (ativo && leitura === versao) setEstado('erro');
          },
        );
      }

      setEstado('carregando');
      carregar();
      const pararSincronizacao = observarDadosSincronizados(usuarioId, carregar);
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
        pararSincronizacao();
      };
    }, [usuarioId, disciplinaId, tentativa]),
  );

  const lista = estado && typeof estado === 'object' ? estado : null;
  const { aplicar } = conclusao;
  const atividadesPorStatus = useMemo(
    () => separarPorStatus(lista?.atividades ?? [], agora),
    [lista?.atividades, agora],
  );
  const contagens = useMemo(() => {
    const exibidas = separarPorStatus(aplicar(lista?.atividades ?? []), agora);
    return {
      todas: exibidas.todas.length,
      pendentes: exibidas.pendentes.length,
      atrasadas: exibidas.atrasadas.length,
      concluidas: exibidas.concluidas.length,
    } satisfies Record<StatusAtividades, number>;
  }, [aplicar, lista?.atividades, agora]);

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
  const total = contagens.todas;
  const concluidas = contagens.concluidas;
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
