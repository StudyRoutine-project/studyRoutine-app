import Feather from '@expo/vector-icons/Feather';
import { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MensagemErro } from '../components/MensagemErro';
import { BotaoConta } from '../components/conta/BotaoConta';
import { LayoutDisciplinas } from '../components/disciplinas/LayoutDisciplinas';
import { cadastrarDisciplina } from '../database/disciplinas';
import { cores } from '../theme/cores';

import type { ComponentRef } from 'react';

type Props = {
  usuarioId: string;
  voltar: () => void;
  concluir: () => void;
};

const coresDisciplina = [
  { nome: 'Roxo', valor: cores.roxo },
  { nome: 'Azul', valor: '#245F9E' },
  { nome: 'Verde', valor: '#207151' },
  { nome: 'Laranja', valor: '#A6471C' },
  { nome: 'Rosa', valor: '#9A3D66' },
  { nome: 'Cinza', valor: '#4D5873' },
];

export function NovaDisciplinaScreen({ usuarioId, voltar, concluir }: Props) {
  const campoNome = useRef<ComponentRef<typeof TextInput>>(null);
  const salvandoRef = useRef(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cor, setCor] = useState(coresDisciplina[0]);
  const [erroNome, setErroNome] = useState(false);
  const [erro, setErro] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (salvandoRef.current) return;
    if (!nome.trim()) {
      setErroNome(true);
      campoNome.current?.focus();
      return;
    }

    salvandoRef.current = true;
    Keyboard.dismiss();
    setErro(false);
    setSalvando(true);
    try {
      await cadastrarDisciplina(usuarioId, { nome, descricao, cor: cor.valor });
    } catch {
      setErro(true);
      return;
    } finally {
      salvandoRef.current = false;
      setSalvando(false);
    }
    concluir();
  }

  return (
    <LayoutDisciplinas titulo="Nova disciplina" voltar={voltar} voltarDesativado={salvando}>
      <KeyboardAvoidingView
        style={styles.corpo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.formulario}>
          <View style={styles.campo}>
            <Text style={styles.rotulo}>Nome</Text>
            <TextInput
              ref={campoNome}
              accessibilityLabel="Nome da disciplina"
              autoCapitalize="sentences"
              editable={!salvando}
              onChangeText={(valor) => {
                setNome(valor);
                setErroNome(false);
              }}
              placeholder="Ex.: Matemática"
              placeholderTextColor={cores.secundario}
              style={[styles.entrada, erroNome && styles.entradaErro]}
              value={nome}
            />
            {erroNome && <MensagemErro mensagem="Informe o nome da disciplina." />}
          </View>

          <View style={styles.campo}>
            <Text style={styles.rotulo}>
              Descrição <Text style={styles.secundario}>(opcional)</Text>
            </Text>
            <TextInput
              accessibilityLabel="Descrição da disciplina"
              editable={!salvando}
              multiline
              onChangeText={setDescricao}
              placeholder="Ex.: Conteúdos do semestre"
              placeholderTextColor={cores.secundario}
              style={[styles.entrada, styles.descricao]}
              value={descricao}
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.rotulo}>
              Cor <Text style={styles.secundario}>· {cor.nome}</Text>
            </Text>
            <View
              style={styles.paleta}
              accessibilityRole="radiogroup"
              accessibilityLabel="Cor da disciplina"
            >
              {coresDisciplina.map((opcao) => {
                const selecionada = opcao.valor === cor.valor;
                return (
                  <Pressable
                    key={opcao.valor}
                    accessibilityRole="radio"
                    accessibilityLabel={opcao.nome}
                    accessibilityState={{ checked: selecionada, disabled: salvando }}
                    disabled={salvando}
                    onPress={() => setCor(opcao)}
                    style={({ pressed }) => [
                      styles.opcao,
                      selecionada && styles.selecionada,
                      pressed && styles.pressionada,
                    ]}
                  >
                    <View style={[styles.amostra, { backgroundColor: opcao.valor }]}>
                      {selecionada && (
                        <Feather
                          accessible={false}
                          aria-hidden
                          name="check"
                          size={17}
                          color={cores.branco}
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {erro && <MensagemErro mensagem="Não foi possível salvar a disciplina. Tente de novo." />}
          <BotaoConta
            texto={salvando ? 'Salvando…' : 'Salvar disciplina'}
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
  formulario: { gap: 20, paddingTop: 8, paddingBottom: 24 },
  campo: { gap: 8 },
  rotulo: { color: cores.texto, fontSize: 15, fontWeight: '600' },
  secundario: { color: cores.secundario, fontWeight: '400' },
  entrada: {
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
    color: cores.texto,
    fontSize: 16,
  },
  entradaErro: { borderColor: cores.erro },
  descricao: { minHeight: 104, textAlignVertical: 'top' },
  paleta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  opcao: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
  },
  selecionada: { backgroundColor: cores.fundoAviso, borderColor: cores.roxo },
  pressionada: { opacity: 0.8 },
  amostra: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
