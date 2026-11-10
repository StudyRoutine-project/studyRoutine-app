import { useState } from 'react';
import { Keyboard, Text } from 'react-native';

import { MensagemErro } from '../components/MensagemErro';
import { BotaoConta } from '../components/conta/BotaoConta';
import { CampoConta } from '../components/conta/CampoConta';
import { ContaLayout } from '../components/conta/ContaLayout';
import { LinkConta } from '../components/conta/LinkConta';
import {
  encerrarSessaoTemporaria,
  reenviarConfirmacao,
  solicitarRecuperacao,
  validarCodigo,
} from '../services/autenticacao';
import { criarClienteTemporario } from '../services/supabase';
import { cores } from '../theme/cores';
import { RecuperarSenhaScreen } from './RecuperarSenhaScreen';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { AvisoConta, FinalidadeCodigo } from '../services/autenticacao';

type Props = {
  client: SupabaseClient;
  email: string;
  finalidade: FinalidadeCodigo;
  voltar: () => void;
  concluir: (aviso: AvisoConta) => void;
};

export function VerificarCodigoScreen({ client, email, finalidade, voltar, concluir }: Props) {
  const [codigo, setCodigo] = useState('');
  const [acao, setAcao] = useState<'validar' | 'reenviar' | null>(null);
  const [reenviado, setReenviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [clienteRecuperacao, setClienteRecuperacao] = useState<SupabaseClient | null>(null);
  const recuperando = finalidade === 'recuperacao';

  async function confirmar() {
    if (acao) return;
    if (codigo.length < 6) {
      setErro('Digite o código completo.');
      return;
    }

    const clienteTemporario = criarClienteTemporario();
    if (!clienteTemporario) {
      setErro('Não foi possível validar o código. Tente de novo.');
      return;
    }

    Keyboard.dismiss();
    setAcao('validar');
    setErro(null);
    const falha = await validarCodigo(clienteTemporario, email, codigo, finalidade);
    setAcao(null);
    if (falha) {
      setErro(falha);
      return;
    }

    if (recuperando) {
      setClienteRecuperacao(clienteTemporario);
    } else {
      void encerrarSessaoTemporaria(clienteTemporario);
      concluir('email-confirmado');
    }
  }

  async function reenviar() {
    if (acao) return;

    setAcao('reenviar');
    setErro(null);
    setReenviado(false);
    const falha = recuperando
      ? await solicitarRecuperacao(client, email)
      : await reenviarConfirmacao(client, email);
    setAcao(null);
    setErro(falha);
    if (!falha) {
      setCodigo('');
      setReenviado(true);
    }
  }

  if (clienteRecuperacao) {
    return (
      <RecuperarSenhaScreen
        client={clienteRecuperacao}
        concluir={() => concluir('senha-alterada')}
        pedirNovoCodigo={() => {
          void encerrarSessaoTemporaria(clienteRecuperacao);
          setClienteRecuperacao(null);
          setCodigo('');
          void reenviar();
        }}
      />
    );
  }

  return (
    <ContaLayout
      titulo={recuperando ? 'Recuperar senha' : 'Confirme seu e-mail'}
      subtitulo={
        recuperando
          ? 'Se houver uma conta com esse e-mail, você receberá um código de recuperação.'
          : `Digite o código enviado para ${email}.`
      }
    >
      <CampoConta
        rotulo="Código do e-mail"
        icone="mail"
        autoComplete="one-time-code"
        editable={!acao}
        inputMode="numeric"
        maxLength={10}
        onChangeText={(valor) => {
          setCodigo(valor.replace(/\D/g, ''));
          setErro(null);
          setReenviado(false);
        }}
        onSubmitEditing={confirmar}
        placeholder="Digite o código"
        returnKeyType="go"
        value={codigo}
      />
      {erro && <MensagemErro mensagem={erro} />}
      {reenviado && (
        <Text accessibilityLiveRegion="polite" style={{ color: cores.texto }}>
          {recuperando ? 'Se houver uma conta, um novo código foi enviado.' : 'Código reenviado.'}
        </Text>
      )}
      <BotaoConta
        texto={acao === 'validar' ? 'Validando…' : 'Confirmar código'}
        ocupado={!!acao}
        onPress={confirmar}
      />
      <LinkConta
        texto={acao === 'reenviar' ? 'Enviando…' : 'Reenviar código'}
        desativado={!!acao}
        onPress={reenviar}
      />
      <LinkConta texto="Voltar" desativado={!!acao} onPress={voltar} />
    </ContaLayout>
  );
}
