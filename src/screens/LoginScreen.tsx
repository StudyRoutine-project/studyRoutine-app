import Feather from '@expo/vector-icons/Feather';
import { useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MensagemErro } from '../components/MensagemErro';
import { BotaoConta } from '../components/conta/BotaoConta';
import { CampoConta } from '../components/conta/CampoConta';
import { ContaLayout } from '../components/conta/ContaLayout';
import { LinkConta } from '../components/conta/LinkConta';
import { emailValido, entrar } from '../services/autenticacao';
import { cores } from '../theme/cores';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ComponentRef } from 'react';
import type { ResultadoConfirmacao } from '../services/autenticacao';

type Props = {
  client: SupabaseClient;
  aviso: ResultadoConfirmacao | null;
  fecharAviso: () => void;
  abrirCadastro: () => void;
  pedirNovoLink: () => void;
};

const mensagens = {
  entrar: 'Entre com o e-mail e a senha que você cadastrou.',
  invalido: 'Este link de confirmação é inválido ou expirou.',
  indisponivel: 'Não foi possível abrir o link. Confira a conexão e tente de novo.',
};

export function LoginScreen({ client, aviso, fecharAviso, abrirCadastro, pedirNovoLink }: Props) {
  const campoSenha = useRef<ComponentRef<typeof TextInput>>(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [validar, setValidar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const erroEmail = validar && !emailValido(email) ? 'Digite um e-mail válido.' : undefined;
  const erroSenha = validar && !senha ? 'Digite sua senha.' : undefined;
  const mensagem = aviso && aviso !== 'confirmado' ? mensagens[aviso] : null;
  const avisoDeErro = aviso === 'invalido' || aviso === 'indisponivel';

  async function enviar() {
    if (enviando) return;

    setValidar(true);
    setErro(null);
    if (!emailValido(email) || !senha) return;

    Keyboard.dismiss();
    setEnviando(true);
    setErro(await entrar(client, email, senha));
    setEnviando(false);
  }

  return (
    <ContaLayout
      titulo="Bem-vindo de volta"
      subtitulo="Organize seus estudos em um só lugar."
    >
      {mensagem && (
        <View style={[styles.aviso, avisoDeErro && styles.avisoDeErro]}>
          <View style={styles.linhaAviso}>
            <Feather
              accessible={false}
              aria-hidden
              color={avisoDeErro ? cores.erro : cores.roxo}
              name={avisoDeErro ? 'alert-circle' : 'info'}
              size={20}
            />
            <Text accessibilityRole="alert" style={styles.mensagem}>
              {mensagem}
            </Text>
            <Pressable
              accessibilityLabel="Fechar aviso"
              accessibilityRole="button"
              onPress={fecharAviso}
              style={({ pressed }) => [styles.fecharAviso, pressed && styles.fecharAvisoPressionado]}
            >
              <Feather accessible={false} aria-hidden color={cores.texto} name="x" size={18} />
            </Pressable>
          </View>
          {aviso === 'invalido' && (
            <LinkConta texto="Pedir novo link" onPress={pedirNovoLink} />
          )}
        </View>
      )}

      <CampoConta
        rotulo="E-mail"
        icone="mail"
        erro={erroEmail}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        editable={!enviando}
        keyboardType="email-address"
        onChangeText={(valor) => {
          setEmail(valor);
          setErro(null);
        }}
        onSubmitEditing={() => campoSenha.current?.focus()}
        placeholder="Digite seu e-mail"
        returnKeyType="next"
        submitBehavior="submit"
        value={email}
      />

      <CampoConta
        ref={campoSenha}
        rotulo="Senha"
        icone="lock"
        senha
        erro={erroSenha}
        autoCapitalize="none"
        autoComplete="current-password"
        autoCorrect={false}
        editable={!enviando}
        onChangeText={(valor) => {
          setSenha(valor);
          setErro(null);
        }}
        onSubmitEditing={enviar}
        placeholder="Digite sua senha"
        returnKeyType="go"
        value={senha}
      />

      {erro && <MensagemErro mensagem={erro} />}

      <BotaoConta texto={enviando ? 'Entrando…' : 'Entrar'} ocupado={enviando} onPress={enviar} />
      <LinkConta
        pergunta="Ainda não tem conta?"
        texto="Criar conta"
        desativado={enviando}
        onPress={abrirCadastro}
      />
    </ContaLayout>
  );
}

const styles = StyleSheet.create({
  aviso: {
    backgroundColor: '#F2EEFF',
    borderColor: '#DCD2FF',
    borderWidth: 1,
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 5,
    paddingVertical: 5,
  },
  avisoDeErro: {
    backgroundColor: '#FFF2F4',
    borderColor: '#F2C8D2',
  },
  linhaAviso: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  fecharAviso: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  fecharAvisoPressionado: {
    backgroundColor: cores.branco,
  },
  mensagem: {
    flex: 1,
    color: cores.texto,
    fontSize: 14,
    lineHeight: 20,
  },
});
