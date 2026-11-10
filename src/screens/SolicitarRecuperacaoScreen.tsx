import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

import { MensagemErro } from '../components/MensagemErro';
import { BotaoConta } from '../components/conta/BotaoConta';
import { CampoConta } from '../components/conta/CampoConta';
import { ContaLayout } from '../components/conta/ContaLayout';
import { LinkConta } from '../components/conta/LinkConta';
import { emailValido, encerrarRecuperacao, solicitarRecuperacao } from '../services/autenticacao';

import type { SupabaseClient } from '@supabase/supabase-js';

type Props = {
  client: SupabaseClient;
  voltar: () => void;
};

export function SolicitarRecuperacaoScreen({ client, voltar }: Props) {
  const [email, setEmail] = useState('');
  const [validar, setValidar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [abrindoLogin, setAbrindoLogin] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [reenviado, setReenviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const ocupado = enviando || abrindoLogin;

  useEffect(() => {
    if (!reenviado) return;

    const timer = setTimeout(() => setReenviado(false), 2500);
    return () => clearTimeout(timer);
  }, [reenviado]);

  async function enviar() {
    if (ocupado || reenviado) return;

    setValidar(true);
    setErro(null);
    if (!emailValido(email)) return;

    Keyboard.dismiss();
    setEnviando(true);
    const falha = await solicitarRecuperacao(client, email);
    setEnviando(false);
    setErro(falha);

    if (!falha) {
      setReenviado(enviado);
      setEnviado(true);
    }
  }

  async function entrar() {
    if (ocupado) return;

    setErro(null);
    setAbrindoLogin(true);
    const falha = await encerrarRecuperacao(client);
    setAbrindoLogin(false);
    setErro(falha);
    if (!falha) voltar();
  }

  return (
    <ContaLayout
      titulo={enviado ? 'Confira seu e-mail' : 'Recuperar senha'}
      subtitulo={enviado
        ? 'Se houver uma conta com esse e-mail, você receberá as instruções de recuperação.'
        : 'Informe seu e-mail.'}
    >
      {!enviado && (
        <CampoConta
          rotulo="E-mail"
          icone="mail"
          erro={validar && !emailValido(email) ? 'Digite um e-mail válido.' : undefined}
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          editable={!ocupado}
          keyboardType="email-address"
          onChangeText={(valor) => {
            setEmail(valor);
            setErro(null);
          }}
          onSubmitEditing={enviar}
          placeholder="Digite seu e-mail"
          returnKeyType="send"
          value={email}
        />
      )}

      {erro && <MensagemErro mensagem={erro} />}

      <BotaoConta
        texto={abrindoLogin
          ? 'Abrindo login…'
          : enviando ? 'Enviando…'
          : reenviado ? 'Instruções reenviadas' : enviado ? 'Reenviar instruções' : 'Enviar instruções'}
        ocupado={ocupado}
        concluido={reenviado}
        onPress={enviar}
      />
      <LinkConta
        pergunta="Já tem senha?"
        texto="Entrar"
        desativado={ocupado}
        onPress={entrar}
      />
    </ContaLayout>
  );
}
