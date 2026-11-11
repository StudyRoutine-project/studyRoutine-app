import { useState } from 'react';
import { Keyboard } from 'react-native';

import { MensagemErro } from '../components/MensagemErro';
import { BotaoConta } from '../components/conta/BotaoConta';
import { CampoConta } from '../components/conta/CampoConta';
import { ContaLayout } from '../components/conta/ContaLayout';
import { LinkConta } from '../components/conta/LinkConta';
import { emailValido, solicitarRecuperacao } from '../services/autenticacao';

import type { SupabaseClient } from '@supabase/supabase-js';

type Props = {
  client: SupabaseClient;
  verificarCodigo: (email: string) => void;
  voltar: () => void;
};

export function SolicitarRecuperacaoScreen({ client, verificarCodigo, voltar }: Props) {
  const [email, setEmail] = useState('');
  const [validar, setValidar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar() {
    if (enviando) return;

    setValidar(true);
    setErro(null);
    if (!emailValido(email)) return;

    Keyboard.dismiss();
    setEnviando(true);
    const falha = await solicitarRecuperacao(client, email);
    setEnviando(false);
    setErro(falha);

    if (!falha) verificarCodigo(email.trim().toLowerCase());
  }

  return (
    <ContaLayout titulo="Recuperar senha" subtitulo="Informe o e-mail da sua conta.">
      <CampoConta
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
        onSubmitEditing={enviar}
        placeholder="Digite seu e-mail"
        returnKeyType="send"
        value={email}
      />
      {erro && <MensagemErro mensagem={erro} />}
      <BotaoConta
        texto={enviando ? 'Enviando…' : 'Enviar código'}
        ocupado={enviando}
        onPress={enviar}
      />
      <LinkConta texto="Voltar ao login" desativado={enviando} onPress={voltar} />
    </ContaLayout>
  );
}
