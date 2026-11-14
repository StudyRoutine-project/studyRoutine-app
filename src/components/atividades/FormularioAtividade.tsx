import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { DisciplinaIndisponivelError } from '../../database/atividades';
import { listarDisciplinas } from '../../database/disciplinas';
import { cores } from '../../theme/cores';
import { formatarData, horarioValido } from '../../utils/datas';
import { Botao } from '../Botao';
import { CampoTexto } from '../CampoTexto';
import { EstadoVazio } from '../EstadoVazio';
import { LayoutInterno } from '../LayoutInterno';
import { MensagemErro } from '../MensagemErro';
import { IconeDisciplina } from '../disciplinas/IconeDisciplina';
import { CalendarioSelecao } from './CalendarioSelecao';
import { CampoSelecao } from './CampoSelecao';
import { CheckboxAtividade } from './CheckboxAtividade';
import { HorarioSelecao } from './HorarioSelecao';
import { ListaSelecao } from './ListaSelecao';
import { PainelSelecao } from './PainelSelecao';
import { opcoesTipo, visualTipo } from './tiposAtividade';

import type { ReactNode } from 'react';
import type { Atividade, DadosAtividade, TipoAtividade } from '../../database/atividades';
import type { Disciplina } from '../../database/disciplinas';

type Props = {
  usuarioId: string;
  tituloTela: string;
  subtitulo?: string;
  valoresIniciais: Partial<Atividade>;
  conclusaoInicial?: boolean;
  salvarAtividade: (dados: DadosAtividade, concluida?: boolean) => Promise<void>;
  acaoSecundaria?: (salvando: boolean) => ReactNode;
  voltar: () => void;
  concluir: (disciplinaId: string) => void;
};

type Seletor = 'tipo' | 'disciplina' | 'data' | 'horario';

const titulosSeletores = {
  tipo: 'Tipo de atividade',
  disciplina: 'Escolher disciplina',
  data: 'Escolher data',
  horario: 'Escolher horário',
};

export function FormularioAtividade({
  usuarioId,
  tituloTela,
  subtitulo,
  valoresIniciais,
  conclusaoInicial,
  salvarAtividade,
  acaoSecundaria,
  voltar,
  concluir,
}: Props) {
  const { width, fontScale } = useWindowDimensions();
  const [disciplinas, setDisciplinas] = useState<Disciplina[] | 'carregando' | 'erro'>(
    'carregando',
  );
  const [tentativa, setTentativa] = useState(0);
  const [titulo, setTitulo] = useState(valoresIniciais.titulo ?? '');
  const [tipo, setTipo] = useState<TipoAtividade | undefined>(valoresIniciais.tipo);
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(valoresIniciais.disciplina_id);
  const dataInicial = valoresIniciais.data;
  const horarioInicial = valoresIniciais.horario?.slice(0, 5) ?? '';
  const [data, setData] = useState(dataInicial);
  const [horario, setHorario] = useState(horarioInicial);
  const [descricao, setDescricao] = useState(valoresIniciais.descricao ?? '');
  const [concluida, setConcluida] = useState(conclusaoInicial);
  const [seletor, setSeletor] = useState<Seletor>();
  const [validar, setValidar] = useState(false);
  const [erroSalvar, setErroSalvar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const salvandoRef = useRef(false);

  useEffect(() => {
    setData(dataInicial);
    setHorario(horarioInicial);
  }, [dataInicial, horarioInicial]);

  useEffect(() => {
    setConcluida(conclusaoInicial);
  }, [conclusaoInicial]);

  useEffect(() => {
    let ativo = true;
    setDisciplinas('carregando');
    void listarDisciplinas(usuarioId).then(
      (lista) => {
        if (ativo) setDisciplinas(lista);
      },
      () => {
        if (ativo) setDisciplinas('erro');
      },
    );
    return () => {
      ativo = false;
    };
  }, [usuarioId, tentativa]);

  const opcoesDisciplina = Array.isArray(disciplinas)
    ? disciplinas.map((item) => ({
        valor: item.id,
        rotulo: item.nome,
        cor: item.cor,
        icone: IconeDisciplina,
      }))
    : [];
  const disciplina = opcoesDisciplina.find((item) => item.valor === disciplinaSelecionada);
  const tipoVisual = tipo ? visualTipo[tipo] : undefined;
  const horarioInvalido = !horarioValido(horario);

  function abrirSeletor(campo: Seletor) {
    Keyboard.dismiss();
    setSeletor(campo);
  }

  function fecharSeletor() {
    setSeletor(undefined);
  }

  async function salvar() {
    if (salvandoRef.current) return;
    setValidar(true);
    setErroSalvar(false);
    if (!titulo.trim() || !disciplina || !tipo || !data || horarioInvalido) return;

    salvandoRef.current = true;
    setSalvando(true);
    Keyboard.dismiss();
    try {
      await salvarAtividade(
        { disciplina_id: disciplina.valor, titulo, tipo, data, horario, descricao },
        concluida === conclusaoInicial ? undefined : concluida,
      );
    } catch (erro) {
      if (erro instanceof DisciplinaIndisponivelError) {
        setDisciplinaSelecionada(undefined);
        setTentativa((atual) => atual + 1);
      } else {
        setErroSalvar(true);
      }
      return;
    } finally {
      salvandoRef.current = false;
      setSalvando(false);
    }
    concluir(disciplina.valor);
  }

  return (
    <LayoutInterno
      titulo={tituloTela}
      subtitulo={subtitulo}
      voltar={voltar}
      voltarDesativado={salvando}
    >
      {disciplinas === 'carregando' ? (
        <ActivityIndicator color={cores.roxo} accessibilityLabel="Carregando disciplinas" />
      ) : disciplinas === 'erro' ? (
        <View style={styles.erro}>
          <MensagemErro mensagem="Não foi possível carregar as disciplinas." />
          <Botao texto="Tentar de novo" onPress={() => setTentativa((atual) => atual + 1)} />
        </View>
      ) : disciplinas.length === 0 ? (
        <EstadoVazio
          ilustracao="disciplinas"
          titulo="Nenhuma disciplina cadastrada"
          descricao="Cadastre uma disciplina para adicionar atividades."
        />
      ) : (
        <KeyboardAvoidingView
          style={styles.corpo}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.formulario}>
            {concluida !== undefined && (
              <CheckboxAtividade
                rotulo="Atividade concluída"
                texto="Atividade concluída"
                marcada={concluida}
                desativada={salvando}
                onPress={() => setConcluida(!concluida)}
              />
            )}
            <CampoTexto
              rotulo="Título"
              icone="edit-3"
              value={titulo}
              onChangeText={setTitulo}
              autoCapitalize="sentences"
              placeholder="Ex.: Lista de exercícios"
              editable={!salvando}
              erro={validar && !titulo.trim() ? 'Informe o título.' : undefined}
            />
            <CampoSelecao
              rotulo="Tipo"
              placeholder="Selecione o tipo"
              valor={tipoVisual?.rotulo}
              icone={tipoVisual?.icone ?? 'layers'}
              cor={tipoVisual?.cor}
              desativado={salvando}
              erro={validar && !tipo ? 'Selecione o tipo.' : undefined}
              onPress={() => abrirSeletor('tipo')}
            />
            <CampoSelecao
              rotulo="Disciplina"
              placeholder="Selecione a disciplina"
              valor={disciplina?.rotulo}
              icone={IconeDisciplina}
              cor={disciplina?.cor}
              desativado={salvando}
              erro={validar && !disciplina ? 'Selecione uma disciplina.' : undefined}
              onPress={() => abrirSeletor('disciplina')}
            />
            <View style={[styles.prazo, width >= 380 && fontScale <= 1.15 && styles.prazoEmLinha]}>
              <View style={styles.campoPrazo}>
                <CampoSelecao
                  rotulo="Data"
                  placeholder="Escolher data"
                  valor={data ? formatarData(data) : undefined}
                  icone="calendar"
                  iconeComFundo={false}
                  mostrarSeta={false}
                  desativado={salvando}
                  erro={validar && !data ? 'Escolha uma data.' : undefined}
                  onPress={() => abrirSeletor('data')}
                />
              </View>
              <View style={styles.campoPrazo}>
                <CampoSelecao
                  rotulo="Horário"
                  placeholder="Escolher hora"
                  valor={horario || undefined}
                  icone="clock"
                  iconeComFundo={false}
                  mostrarSeta={false}
                  desativado={salvando}
                  erro={validar && horarioInvalido ? 'Escolha um horário.' : undefined}
                  onPress={() => abrirSeletor('horario')}
                />
              </View>
            </View>
            <CampoTexto
              rotulo="Descrição (opcional)"
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Ex.: Resolver os exercícios do capítulo 2"
              editable={!salvando}
              multiline
            />
          </ScrollView>
          <View style={styles.rodape}>
            {erroSalvar && (
              <MensagemErro mensagem="Não foi possível salvar a atividade. Tente de novo." />
            )}
            <Botao
              texto={
                salvando
                  ? 'Salvando…'
                  : conclusaoInicial === undefined
                    ? 'Salvar atividade'
                    : 'Salvar alterações'
              }
              icone="save"
              ocupado={salvando}
              onPress={salvar}
            />
            {acaoSecundaria?.(salvando)}
          </View>
        </KeyboardAvoidingView>
      )}
      {seletor && (
        <PainelSelecao titulo={titulosSeletores[seletor]} fechar={fecharSeletor}>
          {seletor === 'tipo' && (
            <ListaSelecao
              opcoes={opcoesTipo}
              valor={tipo}
              selecionar={(valor) => {
                setTipo(valor);
                fecharSeletor();
              }}
            />
          )}
          {seletor === 'disciplina' && (
            <ListaSelecao
              opcoes={opcoesDisciplina}
              valor={disciplinaSelecionada}
              selecionar={(valor) => {
                setDisciplinaSelecionada(valor);
                fecharSeletor();
              }}
            />
          )}
          {seletor === 'horario' && (
            <HorarioSelecao
              valor={horario}
              selecionar={(valor) => {
                setHorario(valor);
                fecharSeletor();
              }}
            />
          )}
          {seletor === 'data' && (
            <CalendarioSelecao
              valor={data}
              selecionar={(valor) => {
                setData(valor);
                fecharSeletor();
              }}
            />
          )}
        </PainelSelecao>
      )}
    </LayoutInterno>
  );
}

const styles = StyleSheet.create({
  corpo: { flex: 1 },
  formulario: { gap: 16, paddingBottom: 12 },
  rodape: { gap: 8, paddingTop: 8, paddingBottom: 12 },
  erro: { gap: 12 },
  prazo: { gap: 12 },
  prazoEmLinha: { flexDirection: 'row' },
  campoPrazo: { flex: 1, minWidth: 0 },
});
