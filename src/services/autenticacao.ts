import { isAuthPKCECodeVerifierMissingError, isAuthRetryableFetchError } from '@supabase/supabase-js';

import type { SupabaseClient } from '@supabase/supabase-js';

const erroLogin = 'Não foi possível entrar agora. Tente de novo.';
const erroCadastro = 'Não foi possível criar a conta. Tente de novo.';
const erroEnvio = 'Não foi possível enviar o e-mail. Tente de novo.';
const erroConexao = 'Sem conexão. Confira sua internet e tente de novo.';
const caminhos = {
  confirmacao: 'confirmar',
  recuperacao: 'nova-senha',
};

export const minimoSenha = 8;

export type ResultadoLinkConta = 'confirmado' | 'entrar' | 'invalido' | 'indisponivel';
export type AvisoConta = ResultadoLinkConta | 'senha-alterada';
export type TipoLinkConta = keyof typeof caminhos;
export type LinkConta = {
  tipo: TipoLinkConta;
  codigo: string | null;
  flowId: string | null;
};

export function retornoContaWeb(tipo: TipoLinkConta) {
  if (typeof window === 'undefined' || !window.history) return null;
  if (!/^https?:$/.test(window.location?.protocol)) return null;

  return `${window.location.origin}/auth/${caminhos[tipo]}`;
}

function retornoConta(tipo: TipoLinkConta) {
  return retornoContaWeb(tipo) ?? `studyroutine://auth/${caminhos[tipo]}`;
}

export function lerLinkConta(link: string): LinkConta | null {
  let url: URL;

  try {
    url = new URL(link);
  } catch {
    return null;
  }

  const retorno = `${url.protocol}//${url.host}${url.pathname}`;
  const tipo = (Object.keys(caminhos) as TipoLinkConta[]).find((item) => (
    retorno === `studyroutine://auth/${caminhos[item]}` || retorno === retornoContaWeb(item)
  ));
  if (!tipo) return null;

  return {
    tipo,
    codigo: url.searchParams.get('code'),
    flowId: url.searchParams.get('sb_flow_id'),
  };
}

export function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function entrar(client: SupabaseClient, email: string, senha: string) {
  try {
    const { error } = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });

    if (!error) return null;
    if (isAuthRetryableFetchError(error)) return erroConexao;
    if (error.code === 'invalid_credentials') return 'E-mail ou senha inválidos.';
    if (error.code === 'email_not_confirmed') return 'Confirme seu e-mail antes de entrar.';
    if (error.status === 429) return 'Muitas tentativas. Aguarde um pouco e tente de novo.';

    return erroLogin;
  } catch {
    return erroLogin;
  }
}

export async function cadastrar(
  client: SupabaseClient,
  nome: string,
  email: string,
  senha: string,
) {
  try {
    const { error } = await client.auth.signUp({
      email: email.trim().toLowerCase(),
      password: senha,
      options: {
        data: { nome: nome.trim() },
        emailRedirectTo: retornoConta('confirmacao'),
      },
    });

    if (!error) return null;
    if (isAuthRetryableFetchError(error)) return erroConexao;
    if (error.status === 429) return 'Aguarde um pouco antes de tentar de novo.';
    if (error.code === 'weak_password') return 'Escolha uma senha mais forte.';

    return erroCadastro;
  } catch {
    return erroCadastro;
  }
}

export async function reenviarConfirmacao(client: SupabaseClient, email: string) {
  try {
    const { error } = await client.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: retornoConta('confirmacao') },
    });

    if (!error) return null;
    if (isAuthRetryableFetchError(error)) return erroConexao;
    if (error.status === 429) return 'Aguarde um pouco antes de pedir outro e-mail.';

    return erroEnvio;
  } catch {
    return erroEnvio;
  }
}

export async function solicitarRecuperacao(client: SupabaseClient, email: string) {
  try {
    const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: retornoConta('recuperacao'),
    });

    if (!error) return null;
    if (isAuthRetryableFetchError(error)) return erroConexao;
    if (error.status === 429) return 'Aguarde um pouco antes de pedir outro e-mail.';

    return erroEnvio;
  } catch {
    return erroEnvio;
  }
}

export async function validarLinkConta(
  client: SupabaseClient,
  { tipo, codigo, flowId }: LinkConta,
): Promise<ResultadoLinkConta> {
  if (!codigo) return 'invalido';

  try {
    if (tipo === 'confirmacao') {
      const { data: { session } } = await client.auth.getSession();
      if (session) return 'confirmado';
    }

    const { error } = await client.auth.exchangeCodeForSession(
      codigo,
      flowId ? { flowId } : undefined,
    );
    if (!error) return 'confirmado';
    if (tipo === 'confirmacao' && isAuthPKCECodeVerifierMissingError(error)) return 'entrar';
    if (isAuthRetryableFetchError(error)) return 'indisponivel';

    return 'invalido';
  } catch {
    return 'indisponivel';
  }
}

export async function salvarNovaSenha(client: SupabaseClient, senha: string) {
  try {
    const { error } = await client.auth.updateUser({ password: senha });

    if (!error) return null;
    if (isAuthRetryableFetchError(error)) return erroConexao;
    if (error.code === 'same_password') return 'Escolha uma senha diferente da atual.';
    if (error.code === 'weak_password') return 'Escolha uma senha mais forte.';
    if (error.status === 401 || error.code === 'session_not_found') {
      return 'Sua sessão expirou. Solicite novas instruções para alterar a senha.';
    }
    if (error.status === 429) return 'Muitas tentativas. Aguarde um pouco e tente de novo.';

    return 'Não foi possível alterar a senha. Tente de novo.';
  } catch {
    return 'Não foi possível alterar a senha. Tente de novo.';
  }
}

export async function encerrarRecuperacao(client: SupabaseClient) {
  try {
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (!error || isAuthRetryableFetchError(error)) return null;
  } catch {
    return 'Não foi possível abrir o login. Tente novamente.';
  }

  return 'Não foi possível abrir o login. Tente novamente.';
}
