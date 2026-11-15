import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BotaoFlutuante } from '../components/BotaoFlutuante';
import { CabecalhoSecao } from '../components/CabecalhoSecao';
import { EstadoErro } from '../components/EstadoErro';
import { EstadoCarregamentoEstudos } from '../components/EstadoCarregamentoEstudos';
import { EstadoVazio } from '../components/EstadoVazio';
import { LayoutInterno } from '../components/LayoutInterno';
import { CalendarioAgenda } from '../components/agenda/CalendarioAgenda';
import { FiltrosAgenda } from '../components/agenda/FiltrosAgenda';
import { ListaAtividades } from '../components/atividades/ListaAtividades';
import { useDadosAgenda } from '../hooks/useDadosAgenda';
import { useHorarioAtual } from '../hooks/useHorarioAtual';
import { cores } from '../theme/cores';
import {
  agruparAtividadesPorDia,
  descreverDiaAgenda,
  deslocarMesAgenda,
  marcarDias,
} from '../utils/calendario';
import { dataLocal } from '../utils/datas';

import type { ReactNode } from 'react';
import type { EstadoSincronizacao } from '../hooks/useSincronizacao';

type Props = {
  usuarioId: string;
  sincronizacao?: EstadoSincronizacao;
  sincronizar: () => void;
  acaoPerfil: ReactNode;
  abrirAtividade: (id: string) => void;
  novaAtividade: (dia: string) => void;
  novaDisciplina: () => void;
};

export function AgendaScreen({
  usuarioId,
  sincronizacao,
  sincronizar,
  acaoPerfil,
  abrirAtividade,
  novaAtividade,
  novaDisciplina,
}: Props) {
  const agora = useHorarioAtual();
  const hoje = dataLocal(new Date(agora));
  const [diaEscolhido, setDiaEscolhido] = useState<string>();
  const dia = diaEscolhido ?? hoje;
  const { dados, erro, aguardandoSincronizacao, recarregar, filtros, alterarFiltros, conclusao } =
    useDadosAgenda(usuarioId, sincronizacao?.primeiraCargaConcluida);

  const disciplinas = useMemo(
    () => new Map(dados?.disciplinas.map((disciplina) => [disciplina.id, disciplina])),
    [dados?.disciplinas],
  );

  const disciplinaId =
    filtros?.disciplinaId && disciplinas.has(filtros.disciplinaId) ? filtros.disciplinaId : null;
  const tipo = filtros?.tipo ?? null;
  const temFiltros = Boolean(disciplinaId || tipo);
  const temDisciplinas = Boolean(dados && dados.disciplinas.length > 0);

  const { aplicar } = conclusao;
  const atividadesPorDia = useMemo(() => {
    const atividades = aplicar(dados?.atividades ?? []).filter(
      (atividade) =>
        (!disciplinaId || atividade.disciplina_id === disciplinaId) &&
        (!tipo || atividade.tipo === tipo),
    );
    return agruparAtividadesPorDia(atividades);
  }, [aplicar, dados?.atividades, disciplinaId, tipo]);

  const marcadores = useMemo(() => marcarDias(atividadesPorDia, agora), [atividadesPorDia, agora]);
  const atividades = atividadesPorDia.get(dia) ?? [];

  function conteudoDia() {
    if (atividades.length > 0) {
      return (
        <ListaAtividades
          atividades={atividades}
          disciplinas={disciplinas}
          agora={agora}
          somenteHorario
          conclusao={conclusao}
          abrirAtividade={abrirAtividade}
        />
      );
    }
    if (!temDisciplinas) {
      return (
        <EstadoVazio
          ilustracao="disciplinas"
          titulo="Nenhuma disciplina cadastrada"
          descricao="Cadastre uma disciplina para adicionar atividades à agenda."
        />
      );
    }
    if (temFiltros) {
      return (
        <EstadoVazio
          ilustracao="busca"
          titulo="Nenhuma atividade com esses filtros"
          acao={
            <Pressable
              accessibilityRole="button"
              onPress={() => alterarFiltros({ disciplinaId: null, tipo: null })}
              style={({ pressed }) => [styles.botaoLimpar, pressed && styles.pressionado]}
            >
              <Text style={styles.link}>Limpar filtros</Text>
            </Pressable>
          }
        />
      );
    }
    return <EstadoVazio ilustracao="atividades" titulo="Nenhuma atividade neste dia" />;
  }

  return (
    <LayoutInterno
      rolavel
      titulo="Agenda"
      subtitulo="Acompanhe sua rotina de estudos"
      acaoDireita={acaoPerfil}
      edges={['top', 'left', 'right']}
      flutuante={
        dados && !erro && !aguardandoSincronizacao && (
          <BotaoFlutuante
            texto={temDisciplinas ? 'Nova atividade' : 'Nova disciplina'}
            onPress={temDisciplinas ? () => novaAtividade(dia) : novaDisciplina}
          />
        )
      }
    >
      <View style={styles.conteudo}>
        {dados && filtros && temDisciplinas && (
          <FiltrosAgenda
            disciplinas={dados.disciplinas}
            valor={{ disciplinaId, tipo }}
            alterar={alterarFiltros}
          />
        )}

        <CalendarioAgenda
          selecionado={dia}
          hoje={hoje}
          marcadores={marcadores}
          selecionar={setDiaEscolhido}
          mudarMes={(direcao) => setDiaEscolhido(deslocarMesAgenda(dia, direcao, hoje))}
        />

        {erro ? (
          <EstadoErro mensagem="Não foi possível carregar a agenda." tentarDeNovo={recarregar} />
        ) : !dados || !filtros || aguardandoSincronizacao ? (
          <EstadoCarregamentoEstudos
            fase={aguardandoSincronizacao ? sincronizacao?.fase : undefined}
            sincronizar={sincronizar}
          />
        ) : (
          <View style={styles.secao}>
            <CabecalhoSecao
              titulo={descreverDiaAgenda(dia, hoje)}
              total={atividades.length || undefined}
            />
            {conteudoDia()}
          </View>
        )}
      </View>
    </LayoutInterno>
  );
}

const styles = StyleSheet.create({
  conteudo: { gap: 16 },
  secao: { gap: 10 },
  botaoLimpar: {
    minHeight: 44,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: cores.fundoAviso,
  },
  link: { color: cores.roxo, fontSize: 13, fontWeight: '700' },
  pressionado: { opacity: 0.7 },
});
