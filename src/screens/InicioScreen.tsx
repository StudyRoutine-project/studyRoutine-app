import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { Botao } from '../components/Botao';
import { EstadoVazio } from '../components/EstadoVazio';
import { LayoutInterno } from '../components/LayoutInterno';
import { MensagemErro } from '../components/MensagemErro';
import { FichaAtividade } from '../components/atividades/FichaAtividade';
import { ResumoEstudos } from '../components/inicio/ResumoEstudos';
import { listarAtividades } from '../database/atividades';
import { listarDisciplinas } from '../database/disciplinas';
import { useConclusaoAtividade } from '../hooks/useConclusaoAtividade';
import { useHorarioAtual } from '../hooks/useHorarioAtual';
import { observarAtividadesDosLembretes } from '../services/lembretes';
import { cores } from '../theme/cores';
import { dataLocal, prazoVencido } from '../utils/datas';

import type { ReactNode } from 'react';
import type { Atividade } from '../database/atividades';
import type { Disciplina } from '../database/disciplinas';

type Props = {
  usuarioId: string;
  nome: string;
  acaoPerfil: ReactNode;
  novaDisciplina: () => void;
  novaAtividade: () => void;
  abrirAtividade: (id: string) => void;
};

type Dados = { disciplinas: Disciplina[]; atividades: Atividade[] };

const limitePrioridades = 3;

const formatoData = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export function InicioScreen({
  usuarioId,
  nome,
  acaoPerfil,
  novaDisciplina,
  novaAtividade,
  abrirAtividade,
}: Props) {
  const [dados, setDados] = useState<Dados>();
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const agora = useHorarioAtual();

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      let versao = 0;

      function carregar() {
        const leitura = ++versao;
        setErro(false);
        void Promise.all([listarDisciplinas(usuarioId), listarAtividades(usuarioId)]).then(
          ([disciplinas, atividades]) => {
            if (ativo && leitura === versao) setDados({ disciplinas, atividades });
          },
          () => {
            if (ativo && leitura === versao) setErro(true);
          },
        );
      }

      carregar();
      const pararObservacao = observarAtividadesDosLembretes((conta) => {
        if (conta === usuarioId) carregar();
      });

      return () => {
        ativo = false;
        pararObservacao();
      };
    }, [usuarioId, tentativa]),
  );

  const { alterarConclusao, atividadeSalvando, erroConclusao } = useConclusaoAtividade(
    usuarioId,
    (id, concluida) => {
      setDados((atual) => {
        if (!atual) return atual;

        return {
          ...atual,
          atividades: atual.atividades.map((atividade) =>
            atividade.id === id ? { ...atividade, concluida } : atividade,
          ),
        };
      });
    },
  );

  const resumo = useMemo(() => {
    if (!dados) return;

    const disciplinas = new Map(dados.disciplinas.map(({ id, nome }) => [id, nome]));
    const atrasadas: Atividade[] = [];
    const hoje: Atividade[] = [];
    const proximas: Atividade[] = [];
    const diaAtual = dataLocal(new Date(agora));
    let concluidas = 0;

    for (const atividade of dados.atividades) {
      if (atividade.concluida) {
        concluidas++;
      } else if (prazoVencido(atividade.data, atividade.horario, agora)) {
        atrasadas.push(atividade);
      } else if (atividade.data === diaAtual) {
        hoje.push(atividade);
      } else {
        proximas.push(atividade);
      }
    }

    return {
      disciplinas,
      pendentes: dados.atividades.length - concluidas,
      concluidas,
      prioridades: [...atrasadas, ...hoje, ...proximas].slice(0, limitePrioridades),
    };
  }, [dados, agora]);

  const primeiroNome = nome.trim().split(/\s+/)[0];
  const data = formatoData.format(agora);

  return (
    <LayoutInterno acaoDireita={acaoPerfil} edges={['top', 'left', 'right']}>
      <FlatList
        data={resumo?.prioridades ?? []}
        keyExtractor={(atividade) => atividade.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            <View style={styles.apresentacao}>
              <Text accessibilityRole="header" style={styles.titulo}>
                {primeiroNome ? `Olá, ${primeiroNome}` : 'Início'}
              </Text>
              <View style={styles.linhaData}>
                <Feather name="calendar" size={15} color={cores.secundario} aria-hidden />
                <Text style={styles.data}>{data.charAt(0).toUpperCase() + data.slice(1)}</Text>
              </View>
            </View>
            {resumo && resumo.disciplinas.size > 0 && (
              <ResumoEstudos
                disciplinas={resumo.disciplinas.size}
                pendentes={resumo.pendentes}
                concluidas={resumo.concluidas}
              />
            )}
            {erro && (
              <View style={styles.estado}>
                <MensagemErro mensagem="Não foi possível carregar seus estudos." />
                <Botao texto="Tentar de novo" compacto onPress={() => setTentativa((n) => n + 1)} />
              </View>
            )}
            {!!resumo?.prioridades.length && (
              <View style={styles.cabecalhoPrioridades}>
                <Text accessibilityRole="header" style={styles.prioridades}>
                  Prioridades
                </Text>
                <Botao texto="Nova atividade" icone="plus" compacto onPress={novaAtividade} />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          erro ? undefined : (
            <View style={styles.estado}>
              {resumo ? (
                <>
                  <EstadoVazio
                    mensagem={
                      resumo.disciplinas.size === 0
                        ? 'Cadastre sua primeira disciplina para começar.'
                        : resumo.concluidas > 0
                          ? 'Você está em dia.'
                          : 'Nenhuma atividade cadastrada.'
                    }
                  />
                  <View style={styles.acaoVazia}>
                    {resumo.disciplinas.size === 0 ? (
                      <Botao texto="Nova disciplina" icone="plus" compacto onPress={novaDisciplina} />
                    ) : (
                      <Botao texto="Nova atividade" icone="plus" compacto onPress={novaAtividade} />
                    )}
                  </View>
                </>
              ) : (
                <ActivityIndicator accessibilityLabel="Carregando o início" color={cores.roxo} />
              )}
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <FichaAtividade
              atividade={item}
              disciplina={resumo?.disciplinas.get(item.disciplina_id)}
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
    </LayoutInterno>
  );
}

const styles = StyleSheet.create({
  lista: { flexGrow: 1, paddingTop: 24, paddingBottom: 24 },
  cabecalho: { gap: 22, paddingBottom: 12 },
  apresentacao: { gap: 7 },
  linhaData: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  data: { flexShrink: 1, color: cores.secundario, fontSize: 14 },
  titulo: { color: cores.texto, fontSize: 34, fontWeight: '700', letterSpacing: -1 },
  estado: { gap: 16, paddingBottom: 12 },
  acaoVazia: { alignSelf: 'center' },
  cabecalhoPrioridades: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  prioridades: { color: cores.texto, fontSize: 21, fontWeight: '700' },
  item: { gap: 6, marginBottom: 8 },
});
