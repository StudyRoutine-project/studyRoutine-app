import { useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { NomeDisciplinaDuplicadoError } from '../../database/disciplinas';
import { cores } from '../../theme/cores';
import { Botao } from '../Botao';
import { CampoTexto } from '../CampoTexto';
import { MensagemErro } from '../MensagemErro';
import { LayoutDisciplinas } from './LayoutDisciplinas';
import { SeletorCorDisciplina } from './SeletorCorDisciplina';

import type { ComponentRef, ReactNode } from 'react';
import type { TextInput } from 'react-native';
import type { DadosDisciplina } from '../../database/disciplinas';

type Props = {
  titulo: string;
  subtitulo?: string;
  valoresIniciais?: DadosDisciplina;
  salvarDisciplina: (dados: DadosDisciplina) => Promise<void>;
  acaoSecundaria?: (salvando: boolean) => ReactNode;
  voltar: () => void;
  concluir: () => void;
};

export function FormularioDisciplina({
  titulo,
  subtitulo,
  valoresIniciais,
  salvarDisciplina,
  acaoSecundaria,
  voltar,
  concluir,
}: Props) {
  const campoNome = useRef<ComponentRef<typeof TextInput>>(null);
  const salvandoRef = useRef(false);
  const [nome, setNome] = useState(valoresIniciais?.nome ?? '');
  const [descricao, setDescricao] = useState(valoresIniciais?.descricao ?? '');
  const [cor, setCor] = useState(valoresIniciais?.cor ?? cores.roxo);
  const [erroNome, setErroNome] = useState<string>();
  const [erro, setErro] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (salvandoRef.current) return;
    if (!nome.trim()) {
      setErroNome('Informe o nome da disciplina.');
      campoNome.current?.focus();
      return;
    }

    salvandoRef.current = true;
    Keyboard.dismiss();
    setErro(false);
    setSalvando(true);
    try {
      await salvarDisciplina({ nome, descricao, cor });
    } catch (falha) {
      if (falha instanceof NomeDisciplinaDuplicadoError) {
        setErroNome(falha.message);
      } else {
        setErro(true);
      }
      return;
    } finally {
      salvandoRef.current = false;
      setSalvando(false);
    }
    concluir();
  }

  return (
    <LayoutDisciplinas
      titulo={titulo}
      subtitulo={subtitulo}
      voltar={voltar}
      voltarDesativado={salvando}
    >
      <KeyboardAvoidingView
        style={styles.corpo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.formulario}>
          <CampoTexto
            ref={campoNome}
            rotulo="Nome da disciplina"
            icone="book-open"
            corIcone={cor}
            autoCapitalize="sentences"
            editable={!salvando}
            erro={erroNome}
            onChangeText={(valor) => {
              setNome(valor);
              setErroNome(undefined);
            }}
            placeholder="Ex.: Matemática"
            value={nome}
          />

          <CampoTexto
            rotulo="Descrição (opcional)"
            editable={!salvando}
            multiline
            onChangeText={setDescricao}
            placeholder="Ex.: Conteúdos do semestre"
            value={descricao}
          />

          <SeletorCorDisciplina
            cor={cor}
            corOriginal={valoresIniciais?.cor}
            onChange={setCor}
            desativado={salvando}
          />

          {erro && <MensagemErro mensagem="Não foi possível salvar a disciplina. Tente de novo." />}
          <Botao
            texto={salvando ? 'Salvando…' : 'Salvar disciplina'}
            icone="save"
            onPress={salvar}
            ocupado={salvando}
          />
          {acaoSecundaria?.(salvando)}
        </ScrollView>
      </KeyboardAvoidingView>
    </LayoutDisciplinas>
  );
}

const styles = StyleSheet.create({
  corpo: { flex: 1 },
  formulario: { gap: 18, paddingBottom: 24 },
});
