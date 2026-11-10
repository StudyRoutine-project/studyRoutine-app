import { isAuthRetryableFetchError } from '@supabase/supabase-js';

import type { SupabaseClient } from '@supabase/supabase-js';

const erroLogin = 'Não foi possível entrar agora. Tente de novo.';
const erroCadastro = 'Não foi possível criar a conta. Tente de novo.';
const erroEnvio = 'Não foi possível enviar o e-mail. Tente de novo.';
const erroConexao = 'Sem conexão. Confira sua internet e tente de novo.';

export const minimoSenha = 8;

export type AvisoConta = 'email-confirmado' | 'senha-alterada';
export type FinalidadeCodigo = 'cadastro' | 'recuperacao';
export type FalhaLogin = {
  mensagem: string;
  confirmarEmail?: true;
};

export function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function entrar(
  client: SupabaseClient,
  email: string,
  senha: string,
): Promise<FalhaLogin | null> {
  try {
    const { error } = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });

    if (!error) return null;
    if (isAuthRetryableFetchError(error)) return { mensagem: erroConexao };
    if (error.code === 'invalid_credentials') return { mensagem: 'E-mail ou senha inválidos.' };
    if (error.code === 'email_not_confirmed') {
      return { mensagem: 'Confirme seu e-mail antes de entrar.', confirmarEmail: true };
    }
    if (error.status === 429) {
      return { mensagem: 'Muitas tentativas. Aguarde um pouco e tente de novo.' };
    }

    return { mensagem: erroLogin };
  } catch {
    return { mensagem: erroLogin };
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
    const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase());

    if (!error) return null;
    if (isAuthRetryableFetchError(error)) return erroConexao;
    if (error.status === 429) return 'Aguarde um pouco antes de pedir outro e-mail.';

    return erroEnvio;
  } catch {
    return erroEnvio;
  }
}

export async function validarCodigo(
  client: SupabaseClient,
  email: string,
  codigo: string,
  finalidade: FinalidadeCodigo,
) {
  const erroCodigo = 'Não foi possível validar o código. Tente de novo.';

  try {
    const { data, error } = await client.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: codigo,
      type: finalidade === 'recuperacao' ? 'recovery' : 'email',
    });

    if (!error && data.session) return null;
    if (error && isAuthRetryableFetchError(error)) return erroConexao;
    if (error?.code === 'otp_expired' || error?.code === 'invalid_otp') {
      return 'Código incorreto ou expirado. Confira o código ou peça outro.';
    }
    if (error?.status === 429) return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
    return erroCodigo;
  } catch {
    return erroCodigo;
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

export async function encerrarSessaoTemporaria(client: SupabaseClient) {
  try {
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (!error || isAuthRetryableFetchError(error)) return null;
  } catch {
    return 'Não foi possível abrir o login. Tente novamente.';
  }

  return 'Não foi possível abrir o login. Tente novamente.';
}
