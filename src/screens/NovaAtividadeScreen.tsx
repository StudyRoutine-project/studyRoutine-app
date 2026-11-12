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

import { Botao } from '../components/Botao';
import { CampoTexto } from '../components/CampoTexto';
import { EstadoVazio } from '../components/EstadoVazio';
import { LayoutInterno } from '../components/LayoutInterno';
import { MensagemErro } from '../components/MensagemErro';
import { CalendarioSelecao } from '../components/atividades/CalendarioSelecao';
import { CampoSelecao } from '../components/atividades/CampoSelecao';
import { ListaSelecao } from '../components/atividades/ListaSelecao';
import { PainelSelecao } from '../components/atividades/PainelSelecao';
import { opcoesTipo, visualTipo } from '../components/atividades/tiposAtividade';
import { cadastrarAtividade, DisciplinaIndisponivelError } from '../database/atividades';
import { listarDisciplinas } from '../database/disciplinas';
import { cores } from '../theme/cores';
import { formatarData, horarioValido } from '../utils/datas';

import type { TipoAtividade } from '../database/atividades';
import type { Disciplina } from '../database/disciplinas';

type Props = {
  usuarioId: string;
  disciplinaId: string;
  voltar: () => void;
  concluir: (disciplinaId: string) => void;
};

type Seletor = 'tipo' | 'disciplina' | 'data';

const titulosSeletores = {
  tipo: 'Tipo de atividade',
  disciplina: 'Escolher disciplina',
  data: 'Escolher data',
};

export function NovaAtividadeScreen({ usuarioId, disciplinaId, voltar, concluir }: Props) {
  const { width, fontScale } = useWindowDimensions();
  const [disciplinas, setDisciplinas] = useState<Disciplina[] | 'carregando' | 'erro'>(
    'carregando',
  );
  const [tentativa, setTentativa] = useState(0);
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState<TipoAtividade>();
  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(disciplinaId);
  const [data, setData] = useState<string>();
  const [horario, setHorario] = useState('');
  const [descricao, setDescricao] = useState('');
  const [seletor, setSeletor] = useState<Seletor>();
  const [validar, setValidar] = useState(false);
  const [erroSalvar, setErroSalvar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const salvandoRef = useRef(false);

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
        icone: 'book-open' as const,
      }))
    : [];
  const disciplina = opcoesDisciplina.find((item) => item.valor === disciplinaSelecionada);
  const tipoVisual = tipo ? visualTipo[tipo] : undefined;
  const horarioInvalido = horario !== '' && !horarioValido(horario);

  function alterarHorario(texto: string) {
    const digitos = texto.replace(/\D/g, '').slice(0, 4);
    setHorario(digitos.length > 2 ? `${digitos.slice(0, 2)}:${digitos.slice(2)}` : digitos);
  }

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
      await cadastrarAtividade(usuarioId, {
        disciplina_id: disciplina.valor,
        titulo,
        tipo,
        data,
        horario,
        descricao,
      });
    } catch (erro) {
      if (erro instanceof DisciplinaIndisponivelError) {
        setDisciplinaSelecionada('');
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
      titulo="Nova atividade"
      subtitulo="Organize o que você precisa fazer."
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
        <EstadoVazio mensagem="Cadastre uma disciplina para adicionar atividades" />
      ) : (
        <KeyboardAvoidingView
          style={styles.corpo}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.formulario}>
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
              icone="book-open"
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
                <CampoTexto
                  rotulo="Horário (opcional)"
                  placeholder="HH:MM"
                  icone="clock"
                  corIcone={cores.roxo}
                  accessibilityHint="Use dois dígitos para a hora e dois para os minutos."
                  inputMode="numeric"
                  value={horario}
                  onChangeText={alterarHorario}
                  editable={!salvando}
                  erro={validar && horarioInvalido ? 'Informe um horário válido.' : undefined}
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
              texto={salvando ? 'Salvando…' : 'Salvar atividade'}
              icone="save"
              ocupado={salvando}
              onPress={salvar}
            />
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
