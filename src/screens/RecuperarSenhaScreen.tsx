import { useRef, useState } from 'react';
import { Keyboard, TextInput } from 'react-native';

import { MensagemErro } from '../components/MensagemErro';
import { BotaoConta } from '../components/conta/BotaoConta';
import { CampoConta } from '../components/conta/CampoConta';
import { ContaLayout } from '../components/conta/ContaLayout';
import { LinkConta } from '../components/conta/LinkConta';
import { encerrarRecuperacao, minimoSenha, salvarNovaSenha } from '../services/autenticacao';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ComponentRef } from 'react';
import type { ResultadoLinkConta } from '../services/autenticacao';

type Props = {
  client: SupabaseClient;
  estado: Exclude<ResultadoLinkConta, 'entrar'>;
  concluir: () => void;
  voltar: () => void;
  solicitarInstrucoes: () => void;
};

export function RecuperarSenhaScreen({ client, estado, concluir, voltar, solicitarInstrucoes }: Props) {
  const campoConfirmacao = useRef<ComponentRef<typeof TextInput>>(null);
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [validar, setValidar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [senhaSalva, setSenhaSalva] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const senhaValida = senha.length >= minimoSenha;
  const senhasIguais = Boolean(confirmacao) && senha === confirmacao;

  async function enviar() {
    if (enviando) return;

    setValidar(true);
    setErro(null);
    if (!senhaSalva && (!senhaValida || !senhasIguais)) return;

    Keyboard.dismiss();
    setEnviando(true);

    if (!senhaSalva) {
      const falha = await salvarNovaSenha(client, senha);
      if (falha) {
        setEnviando(false);
        setErro(falha);
        return;
      }

      setSenhaSalva(true);
      setSenha('');
      setConfirmacao('');
    }

    const falha = await encerrarRecuperacao(client);
    setEnviando(false);
    setErro(falha);
    if (!falha) concluir();
  }

  if (estado !== 'confirmado') {
    return (
      <ContaLayout
        titulo="Solicite novas instruções"
        subtitulo={estado === 'invalido'
          ? 'O acesso à recuperação expirou ou já foi usado. Solicite outro e-mail.'
          : 'Confira sua conexão e solicite novas instruções para recuperar a senha.'}
      >
        <BotaoConta texto="Enviar instruções" onPress={solicitarInstrucoes} />
        <LinkConta texto="Voltar" onPress={voltar} />
      </ContaLayout>
    );
  }

  return (
    <ContaLayout
      titulo="Recuperar senha"
      subtitulo={senhaSalva
        ? 'Sua senha foi alterada. Entre novamente.'
        : 'Escolha uma nova senha para sua conta.'}
      compacto
    >
      {!senhaSalva && (
        <>
          <CampoConta
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
        texto={enviando ? 'Salvando…' : senhaSalva ? 'Ir para login' : 'Salvar senha'}
        ocupado={enviando}
        onPress={enviar}
      />
      {!senhaSalva && (
        <LinkConta
          pergunta="Precisa recomeçar?"
          texto="Reenviar instruções"
          desativado={enviando}
          onPress={solicitarInstrucoes}
        />
      )}
    </ContaLayout>
  );
}
