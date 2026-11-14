import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Botao } from '../components/Botao';
import { BotaoFlutuante } from '../components/BotaoFlutuante';
import { CabecalhoSecao } from '../components/CabecalhoSecao';
import { EstadoErro } from '../components/EstadoErro';
import { EstadoVazio } from '../components/EstadoVazio';
import { LayoutInterno } from '../components/LayoutInterno';
import { ResumoNumeros } from '../components/ResumoNumeros';
import { ListaAtividades } from '../components/atividades/ListaAtividades';
import { agruparPorSituacao } from '../components/atividades/situacaoAtividade';
import { BannerInicio } from '../components/inicio/BannerInicio';
import { listarAtividades } from '../database/atividades';
import { listarDisciplinas } from '../database/disciplinas';
import { useConclusaoAtividade } from '../hooks/useConclusaoAtividade';
import { useHorarioAtual } from '../hooks/useHorarioAtual';
import { observarAtividadesDosLembretes } from '../services/lembretes';
import { cores } from '../theme/cores';
import { contar } from '../utils/contar';
import { formatarPrazoResumido } from '../utils/datas';

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

const limiteProximas = 5;

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

  const conclusao = useConclusaoAtividade(usuarioId, (id, concluida) => {
    setDados((atual) => {
      if (!atual) return atual;

      return {
        ...atual,
        atividades: atual.atividades.map((atividade) =>
          atividade.id === id ? { ...atividade, concluida } : atividade,
        ),
      };
    });
  });

  const resumo = useMemo(() => {
    if (!dados) return;

    const disciplinas = new Map(dados.disciplinas.map((disciplina) => [disciplina.id, disciplina]));
    const grupos = agruparPorSituacao(dados.atividades, agora);
    const secoes = [
      { titulo: 'Em atraso', atividades: grupos.atrasada },
      { titulo: 'Hoje', atividades: grupos.hoje },
      { titulo: 'Próximos prazos', atividades: grupos.pendente.slice(0, limiteProximas) },
    ].filter((secao) => secao.atividades.length > 0);

    return {
      disciplinas,
      grupos,
      secoes,
      total: dados.atividades.length,
      depois: grupos.pendente.slice(limiteProximas),
    };
  }, [dados, agora]);

  const primeiroNome = nome.trim().split(/\s+/)[0];
  const data = formatoData.format(agora);

  return (
    <LayoutInterno
      rolavel
      acaoDireita={acaoPerfil}
      edges={['top', 'left', 'right']}
      flutuante={
        !!resumo?.disciplinas.size && (
          <BotaoFlutuante texto="Nova atividade" onPress={novaAtividade} />
        )
      }
    >
      <View style={styles.conteudo}>
        <View style={styles.saudacao}>
          <Text accessibilityRole="header" numberOfLines={1} style={styles.titulo}>
            {primeiroNome ? (
              <>
                Olá, <Text style={styles.nome}>{primeiroNome}</Text>
              </>
            ) : (
              'Início'
            )}
          </Text>
          <Text style={styles.data}>{data.charAt(0).toUpperCase() + data.slice(1)}</Text>
        </View>

        {erro ? (
          <EstadoErro
            mensagem="Não foi possível carregar seus estudos."
            tentarDeNovo={() => setTentativa((n) => n + 1)}
          />
        ) : !resumo ? (
          <ActivityIndicator accessibilityLabel="Carregando o início" color={cores.roxo} />
        ) : resumo.disciplinas.size === 0 ? (
          <EstadoVazio
            ilustracao="disciplinas"
            titulo="Nenhuma disciplina cadastrada"
            descricao="Cadastre sua primeira disciplina para começar."
            acao={<Botao texto="Nova disciplina" icone="plus" compacto onPress={novaDisciplina} />}
          />
        ) : (
          <>
            <BannerInicio
              titulo="Organize sua rotina de estudos"
              descricao="Cadastre suas provas, trabalhos e tarefas em um só lugar."
            />

            {resumo.total === 0 ? (
              <EstadoVazio
                ilustracao="atividades"
                titulo="Nenhuma atividade cadastrada"
                descricao="Suas próximas entregas aparecem aqui."
              />
            ) : (
              <ResumoNumeros
                atrasadas={resumo.grupos.atrasada.length}
                concluidas={resumo.grupos.concluida.length}
                total={resumo.total}
              />
            )}

            {resumo.secoes.map(({ titulo, atividades }) => (
              <View key={titulo} style={styles.secao}>
                <CabecalhoSecao titulo={titulo} total={atividades.length} />
                <ListaAtividades
                  atividades={atividades}
                  agora={agora}
                  disciplinas={resumo.disciplinas}
                  conclusao={conclusao}
                  abrirAtividade={abrirAtividade}
                />
              </View>
            ))}

            {resumo.depois.length > 0 && (
              <Text style={styles.depois}>
                Mais {contar(resumo.depois.length, 'atividade', 'atividades')} com prazo a partir
                de {formatarPrazoResumido(resumo.depois[0].data, null)}.
              </Text>
            )}

            {resumo.total > 0 && resumo.secoes.length === 0 && (
              <EstadoVazio
                ilustracao="emDia"
                titulo="Você está em dia"
                descricao="Nenhuma atividade pendente no momento."
              />
            )}
          </>
        )}
      </View>
    </LayoutInterno>
  );
}

const styles = StyleSheet.create({
  conteudo: { flexGrow: 1, gap: 22, paddingTop: 22 },
  saudacao: { gap: 2 },
  titulo: { color: cores.texto, fontSize: 28, fontWeight: '400', letterSpacing: -0.8 },
  nome: { fontWeight: '700' },
  data: { color: cores.secundario, fontSize: 14 },
  secao: { gap: 10 },
  depois: { marginTop: -10, color: cores.secundario, fontSize: 13, lineHeight: 19 },
});
