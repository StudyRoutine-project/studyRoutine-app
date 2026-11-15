import Feather from '@expo/vector-icons/Feather';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BotaoFlutuante } from '../components/BotaoFlutuante';
import { CampoTexto } from '../components/CampoTexto';
import { EstadoErro } from '../components/EstadoErro';
import { EstadoCarregamentoEstudos } from '../components/EstadoCarregamentoEstudos';
import { EstadoVazio } from '../components/EstadoVazio';
import { FichaDisciplina } from '../components/disciplinas/FichaDisciplina';
import { LayoutInterno, TituloTela } from '../components/LayoutInterno';
import { useDadosEstudos } from '../hooks/useDadosEstudos';
import { useHorarioAtual } from '../hooks/useHorarioAtual';
import { cores } from '../theme/cores';
import { normalizarTexto } from '../utils/normalizarTexto';
import { situacaoAtividade } from '../utils/situacaoAtividade';

import type { ReactNode } from 'react';
import type { ResumoDisciplina } from '../components/disciplinas/FichaDisciplina';
import type { EstadoSincronizacao } from '../hooks/useSincronizacao';

type Props = {
  usuarioId: string;
  sincronizacao?: EstadoSincronizacao;
  sincronizar: () => void;
  acaoPerfil: ReactNode;
  novaDisciplina: () => void;
  abrirDisciplina: (disciplinaId: string) => void;
};

const resumoVazio: ResumoDisciplina = { atrasadas: 0, pendentes: 0, concluidas: 0 };

export function DisciplinasScreen({
  usuarioId,
  sincronizacao,
  sincronizar,
  acaoPerfil,
  novaDisciplina,
  abrirDisciplina,
}: Props) {
  const { dados, erro, aguardandoSincronizacao, recarregar } =
    useDadosEstudos(usuarioId, sincronizacao?.primeiraCargaConcluida);
  const [busca, setBusca] = useState('');

  const agora = useHorarioAtual();
  const disciplinas = dados?.disciplinas ?? [];
  const termo = normalizarTexto(busca);
  const lista = disciplinas.filter((disciplina) =>
    normalizarTexto(disciplina.nome).includes(termo),
  );

  const resumos = useMemo(() => {
    const porDisciplina = new Map<string, ResumoDisciplina>();
    if (!dados) return porDisciplina;

    for (const atividade of dados.atividades) {
      const resumo = { ...(porDisciplina.get(atividade.disciplina_id) ?? resumoVazio) };
      const situacao = situacaoAtividade(atividade, agora);
      if (situacao === 'concluida') resumo.concluidas++;
      else if (situacao === 'atrasada') resumo.atrasadas++;
      else resumo.pendentes++;
      porDisciplina.set(atividade.disciplina_id, resumo);
    }
    return porDisciplina;
  }, [dados, agora]);

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
        dados && !erro && !aguardandoSincronizacao && (
          <BotaoFlutuante texto="Nova disciplina" onPress={abrirFormulario} />
        )
      }
    >
      <TituloTela titulo="Disciplinas" subtitulo="Organize suas matérias e atividades." />
      {erro ? (
        <View style={styles.erro}>
          <EstadoErro
            mensagem="Não foi possível carregar as disciplinas."
            tentarDeNovo={recarregar}
          />
        </View>
      ) : !dados || aguardandoSincronizacao ? (
        <EstadoCarregamentoEstudos
          fase={aguardandoSincronizacao ? sincronizacao?.fase : undefined}
          sincronizar={sincronizar}
        />
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
  erro: { paddingTop: 14 },
  conteudo: { flexGrow: 1, paddingTop: 14 },
  lista: { gap: 12 },
  limpar: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
