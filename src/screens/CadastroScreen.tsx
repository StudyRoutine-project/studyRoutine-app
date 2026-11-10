import { useEffect, useRef, useState } from 'react';
import { Keyboard, TextInput } from 'react-native';

import { MensagemErro } from '../components/MensagemErro';
import { BotaoConta } from '../components/conta/BotaoConta';
import { CampoConta } from '../components/conta/CampoConta';
import { ContaLayout } from '../components/conta/ContaLayout';
import { LinkConta } from '../components/conta/LinkConta';
import { cadastrar, emailValido, reenviarConfirmacao } from '../services/autenticacao';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ComponentRef } from 'react';

type Props = {
  client: SupabaseClient;
  somenteReenvio: boolean;
  voltar: () => void;
};

const minimoSenha = 8;

export function CadastroScreen({ client, somenteReenvio, voltar }: Props) {

  const campoEmail = useRef<ComponentRef<typeof TextInput>>(null);
  const campoSenha = useRef<ComponentRef<typeof TextInput>>(null);
  const campoConfirmacao = useRef<ComponentRef<typeof TextInput>>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [validar, setValidar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [reenviado, setReenviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const nomeValido = Boolean(nome.trim());
  const senhaValida = senha.length >= minimoSenha;
  const senhasIguais = Boolean(confirmacao) && senha === confirmacao;
  const titulo = somenteReenvio ? 'Pedir novo link' : 'Criar conta';
  const subtitulo = somenteReenvio
    ? 'Informe seu e-mail.'
    : 'Comece a organizar seus estudos.';

  useEffect(() => {
    if (!reenviado) return;

    const timer = setTimeout(() => setReenviado(false), 2500);
    return () => clearTimeout(timer);
  }, [reenviado]);

  async function enviar() {
    if (enviando) return;

    setValidar(true);
    setErro(null);
    if (!emailValido(email)) return;
    if (!somenteReenvio && (!nomeValido || !senhaValida || !senhasIguais)) return;

    Keyboard.dismiss();
    setEnviando(true);
    const falha = somenteReenvio
      ? await reenviarConfirmacao(client, email)
      : await cadastrar(client, nome, email, senha);
    setEnviando(false);
    setErro(falha);

    if (!falha) {
      setSenha('');
      setConfirmacao('');
      setEnviado(true);
    }
  }

  async function reenviar() {
    if (enviando) return;

    setEnviando(true);
    setErro(null);
    setReenviado(false);
    const falha = await reenviarConfirmacao(client, email);
    setEnviando(false);
    setErro(falha);
    setReenviado(!falha);
  }

  if (enviado) {
    return (
      <ContaLayout
        titulo="Confira seu e-mail"
        subtitulo={`Abra o link enviado para ${email.trim().toLowerCase()} para confirmar a conta.`}
      >
        {erro && <MensagemErro mensagem={erro} />}
        <BotaoConta
          texto={enviando ? 'Reenviando…' : reenviado ? 'E-mail reenviado' : 'Reenviar e-mail'}
          ocupado={enviando}
          concluido={reenviado}
          onPress={reenviar}
        />
        <LinkConta texto="Voltar ao login" onPress={voltar} />
      </ContaLayout>
    );
  }

  return (
    <ContaLayout titulo={titulo} subtitulo={subtitulo} compacto>
      {!somenteReenvio && (
        <CampoConta
          rotulo="Nome completo"
          icone="user"
          erro={validar && !nomeValido ? 'Digite seu nome.' : undefined}
          autoCapitalize="words"
          autoComplete="name"
          editable={!enviando}
          onChangeText={(valor) => {
            setNome(valor);
            setErro(null);
          }}
          onSubmitEditing={() => campoEmail.current?.focus()}
          placeholder="Digite seu nome"
          returnKeyType="next"
          submitBehavior="submit"
          value={nome}
        />
      )}

      <CampoConta
        ref={campoEmail}
        rotulo="E-mail"
        icone="mail"
        erro={validar && !emailValido(email) ? 'Digite um e-mail válido.' : undefined}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        editable={!enviando}
        keyboardType="email-address"
        onChangeText={(valor) => {
          setEmail(valor);
          setErro(null);
        }}
        onSubmitEditing={somenteReenvio ? enviar : () => campoSenha.current?.focus()}
        placeholder="Digite seu e-mail"
        returnKeyType={somenteReenvio ? 'go' : 'next'}
        submitBehavior={somenteReenvio ? 'blurAndSubmit' : 'submit'}
        value={email}
      />

      {!somenteReenvio && (
        <>
          <CampoConta
            ref={campoSenha}
            rotulo="Senha"
            icone="lock"
            senha
            erro={validar && !senhaValida ? `Use pelo menos ${minimoSenha} caracteres.` : undefined}
            autoCapitalize="none"
            autoComplete="new-password"
            autoCorrect={false}
            editable={!enviando}
            onChangeText={(valor) => {
              setSenha(valor);
              setErro(null);
            }}
            onSubmitEditing={() => campoConfirmacao.current?.focus()}
            placeholder="Crie uma senha"
            returnKeyType="next"
            submitBehavior="submit"
            value={senha}
          />
          <CampoConta
            ref={campoConfirmacao}
            rotulo="Confirmar senha"
            icone="lock"
            senha
            erro={validar && !senhasIguais ? 'As senhas precisam ser iguais.' : undefined}
            autoCapitalize="none"
            autoComplete="new-password"
            autoCorrect={false}
            editable={!enviando}
            onChangeText={(valor) => {
              setConfirmacao(valor);
              setErro(null);
            }}
            onSubmitEditing={enviar}
            placeholder="Digite a senha de novo"
            returnKeyType="go"
            value={confirmacao}
          />
        </>
      )}

      {erro && <MensagemErro mensagem={erro} />}

      <BotaoConta
        texto={enviando ? 'Enviando…' : somenteReenvio ? 'Enviar link' : 'Criar conta'}
        ocupado={enviando}
        onPress={enviar}
      />
      <LinkConta
        pergunta={somenteReenvio ? undefined : 'Já tem conta?'}
        texto={somenteReenvio ? 'Voltar ao login' : 'Entrar'}
        onPress={voltar}
      />
    </ContaLayout>
  );
}
