import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { BotaoFlutuante } from '../components/BotaoFlutuante';
import { CampoTexto } from '../components/CampoTexto';
import { EstadoErro } from '../components/EstadoErro';
import { EstadoVazio } from '../components/EstadoVazio';
import { situacaoAtividade } from '../components/atividades/situacaoAtividade';
import { FichaDisciplina } from '../components/disciplinas/FichaDisciplina';
import { LayoutInterno, TituloTela } from '../components/LayoutInterno';
import { listarAtividades } from '../database/atividades';
import { listarDisciplinas } from '../database/disciplinas';
import { useHorarioAtual } from '../hooks/useHorarioAtual';
import { cores } from '../theme/cores';
import { normalizarTexto } from '../utils/normalizarTexto';

import type { ReactNode } from 'react';
import type { ResumoDisciplina } from '../components/disciplinas/FichaDisciplina';
import type { Atividade } from '../database/atividades';
import type { Disciplina } from '../database/disciplinas';

type Props = {
  usuarioId: string;
  acaoPerfil: ReactNode;
  novaDisciplina: () => void;
  abrirDisciplina: (disciplinaId: string) => void;
};

type EstadoLista = 'carregando' | 'erro' | { disciplinas: Disciplina[]; atividades: Atividade[] };

const resumoVazio: ResumoDisciplina = { atrasadas: 0, pendentes: 0, concluidas: 0 };

export function DisciplinasScreen({
  usuarioId,
  acaoPerfil,
  novaDisciplina,
  abrirDisciplina,
}: Props) {
  const [estado, setEstado] = useState<EstadoLista>('carregando');
  const [tentativa, setTentativa] = useState(0);
  const [busca, setBusca] = useState('');

  useFocusEffect(
    useCallback(() => {
      let ativa = true;
      setEstado('carregando');
      void Promise.all([listarDisciplinas(usuarioId), listarAtividades(usuarioId)]).then(
        ([disciplinas, atividades]) => {
          if (ativa) setEstado({ disciplinas, atividades });
        },
        () => {
          if (ativa) setEstado('erro');
        },
      );
      return () => {
        ativa = false;
      };
    }, [tentativa, usuarioId]),
  );

  const agora = useHorarioAtual();
  const disciplinas = typeof estado === 'object' ? estado.disciplinas : [];
  const termo = normalizarTexto(busca);
  const lista = disciplinas.filter((disciplina) =>
    normalizarTexto(disciplina.nome).includes(termo),
  );

  const resumos = useMemo(() => {
    const porDisciplina = new Map<string, ResumoDisciplina>();
    if (typeof estado !== 'object') return porDisciplina;

    for (const atividade of estado.atividades) {
      const resumo = { ...(porDisciplina.get(atividade.disciplina_id) ?? resumoVazio) };
      const situacao = situacaoAtividade(atividade, agora);
      if (situacao === 'concluida') resumo.concluidas++;
      else if (situacao === 'atrasada') resumo.atrasadas++;
      else resumo.pendentes++;
      porDisciplina.set(atividade.disciplina_id, resumo);
    }
    return porDisciplina;
  }, [estado, agora]);

  function abrirFormulario() {
    setBusca('');
    novaDisciplina();
  }

  return (
    <LayoutInterno
      rolavel
      acaoDireita={acaoPerfil}
      edges={['top', 'left', 'right']}
      flutuante={
        typeof estado === 'object' && (
          <BotaoFlutuante texto="Nova disciplina" onPress={abrirFormulario} />
        )
      }
    >
      <TituloTela titulo="Disciplinas" subtitulo="Organize suas matérias e atividades." />
      {estado === 'carregando' ? (
        <View style={styles.centro}>
          <ActivityIndicator color={cores.roxo} accessibilityLabel="Carregando disciplinas" />
        </View>
      ) : estado === 'erro' ? (
        <View style={styles.erro}>
          <EstadoErro
            mensagem="Não foi possível carregar as disciplinas."
            tentarDeNovo={() => setTentativa(tentativa + 1)}
          />
        </View>
      ) : (
        <>
          {disciplinas.length > 0 && (
            <CampoTexto
              accessibilityLabel="Buscar disciplina"
              icone="search"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setBusca}
              placeholder="Buscar disciplina"
              returnKeyType="search"
              value={busca}
              acao={
                busca !== '' && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Limpar busca"
                    onPress={() => setBusca('')}
                    style={styles.limpar}
                  >
                    <Feather aria-hidden name="x" size={19} color={cores.secundario} />
                  </Pressable>
                )
              }
            />
          )}
          <View style={styles.conteudo}>
            {lista.length === 0 ? (
              <EstadoVazio
                {...(disciplinas.length === 0
                  ? {
                      ilustracao: 'disciplinas',
                      titulo: 'Nenhuma disciplina cadastrada',
                      descricao: 'Cadastre sua primeira disciplina para começar.',
                    }
                  : { ilustracao: 'busca', titulo: 'Nenhuma disciplina encontrada' })}
              />
            ) : (
              <View style={styles.lista}>
                {lista.map((disciplina) => (
                  <FichaDisciplina
                    key={disciplina.id}
                    nome={disciplina.nome}
                    cor={disciplina.cor}
                    resumo={resumos.get(disciplina.id) ?? resumoVazio}
                    onPress={() => abrirDisciplina(disciplina.id)}
                  />
                ))}
              </View>
            )}
          </View>
        </>
      )}
    </LayoutInterno>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  erro: { paddingTop: 14 },
  conteudo: { flexGrow: 1, paddingTop: 14 },
  lista: { gap: 12 },
  limpar: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
