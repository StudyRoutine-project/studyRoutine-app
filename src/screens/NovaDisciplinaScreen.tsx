import { useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { CampoTexto } from '../components/CampoTexto';
import { MensagemErro } from '../components/MensagemErro';
import { Botao } from '../components/Botao';
import { LayoutDisciplinas } from '../components/disciplinas/LayoutDisciplinas';
import { SeletorCorDisciplina } from '../components/disciplinas/SeletorCorDisciplina';
import { cadastrarDisciplina, NomeDisciplinaDuplicadoError } from '../database/disciplinas';
import { cores } from '../theme/cores';

import type { ComponentRef } from 'react';
import type { TextInput } from 'react-native';

type Props = {
  usuarioId: string;
  voltar: () => void;
  concluir: () => void;
};

export function NovaDisciplinaScreen({ usuarioId, voltar, concluir }: Props) {
  const campoNome = useRef<ComponentRef<typeof TextInput>>(null);
  const salvandoRef = useRef(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cor, setCor] = useState(cores.roxo);
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
      await cadastrarDisciplina(usuarioId, { nome, descricao, cor });
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
      titulo="Nova disciplina"
      subtitulo="Adicione uma disciplina para organizar seus estudos."
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

          <SeletorCorDisciplina cor={cor} onChange={setCor} desativado={salvando} />

          {erro && <MensagemErro mensagem="Não foi possível salvar a disciplina. Tente de novo." />}
          <Botao
            texto={salvando ? 'Salvando…' : 'Salvar disciplina'}
            icone="save"
            onPress={salvar}
            ocupado={salvando}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </LayoutDisciplinas>
  );
}

const styles = StyleSheet.create({
  corpo: { flex: 1 },
  formulario: { gap: 18, paddingBottom: 24 },
});
