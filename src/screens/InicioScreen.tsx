import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BotaoFlutuante } from '../components/BotaoFlutuante';
import { CabecalhoSecao } from '../components/CabecalhoSecao';
import { EstadoErro } from '../components/EstadoErro';
import { EstadoCarregamentoEstudos } from '../components/EstadoCarregamentoEstudos';
import { EstadoSincronizacao } from '../components/EstadoSincronizacao';
import { EstadoVazio } from '../components/EstadoVazio';
import { LayoutInterno } from '../components/LayoutInterno';
import { ResumoNumeros } from '../components/ResumoNumeros';
import { ListaAtividades } from '../components/atividades/ListaAtividades';
import { BannerInicio } from '../components/inicio/BannerInicio';
import { marcarConclusao, useConclusaoAtividade } from '../hooks/useConclusaoAtividade';
import { useDadosEstudos } from '../hooks/useDadosEstudos';
import { useHorarioAtual } from '../hooks/useHorarioAtual';
import { cores } from '../theme/cores';
import { contar } from '../utils/contar';
import { formatarPrazoResumido } from '../utils/datas';
import { agruparPorSituacao } from '../utils/situacaoAtividade';

import type { ReactNode } from 'react';
import type { EstadoSincronizacao as Estado } from '../hooks/useSincronizacao';

type Props = {
  usuarioId: string;
  nome: string;
  acaoPerfil: ReactNode;
  sincronizacao?: Estado;
  sincronizar: () => void;
  novaDisciplina: () => void;
  novaAtividade: () => void;
  abrirAtividade: (id: string) => void;
};

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
  sincronizacao,
  sincronizar,
  novaDisciplina,
  novaAtividade,
  abrirAtividade,
}: Props) {
  const { dados, erro, aguardandoSincronizacao, recarregar, atualizarDados } =
    useDadosEstudos(usuarioId, sincronizacao?.primeiraCargaConcluida);
  const agora = useHorarioAtual();

  const conclusao = useConclusaoAtividade(usuarioId, (id, concluida) => {
    atualizarDados((atual) => ({
      ...atual,
      atividades: marcarConclusao(atual.atividades, id, concluida),
    }));
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
      secoes,
      total: dados.atividades.length,
      depois: grupos.pendente.slice(limiteProximas),
    };
  }, [dados, agora]);

  const { aplicar } = conclusao;
  const contagem = useMemo(
    () => dados && agruparPorSituacao(aplicar(dados.atividades), agora),
    [aplicar, dados, agora],
  );

  const temDisciplinas = Boolean(resumo?.disciplinas.size);
  const primeiroNome = nome.trim().split(/\s+/)[0];
  const data = formatoData.format(agora);

  return (
    <LayoutInterno
      rolavel
      acaoDireita={acaoPerfil}
      edges={['top', 'left', 'right']}
      flutuante={
        resumo && !erro && !aguardandoSincronizacao && (
          <BotaoFlutuante
            texto={temDisciplinas ? 'Nova atividade' : 'Nova disciplina'}
            onPress={temDisciplinas ? novaAtividade : novaDisciplina}
          />
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

        <BannerInicio
          titulo="Organize sua rotina de estudos"
          descricao="Cadastre suas provas, trabalhos e tarefas em um só lugar."
        />

        {!aguardandoSincronizacao && <EstadoSincronizacao estado={sincronizacao} compacto />}

        {erro ? (
          <EstadoErro
            mensagem="Não foi possível carregar seus estudos."
            tentarDeNovo={recarregar}
          />
        ) : !resumo || aguardandoSincronizacao ? (
          <EstadoCarregamentoEstudos
            fase={aguardandoSincronizacao ? sincronizacao?.fase : undefined}
            sincronizar={sincronizar}
          />
        ) : resumo.disciplinas.size === 0 ? (
          <EstadoVazio
            ilustracao="disciplinas"
            titulo="Nenhuma disciplina cadastrada"
            descricao="Cadastre sua primeira disciplina para começar."
          />
        ) : (
          <>
            {resumo.total === 0 ? (
              <EstadoVazio
                ilustracao="atividades"
                titulo="Nenhuma atividade cadastrada"
                descricao="Suas próximas entregas aparecem aqui."
              />
            ) : (
              <ResumoNumeros
                atrasadas={contagem?.atrasada.length ?? 0}
                concluidas={contagem?.concluida.length ?? 0}
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
