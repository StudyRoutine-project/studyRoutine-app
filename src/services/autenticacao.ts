import { isAuthPKCECodeVerifierMissingError, isAuthRetryableFetchError } from '@supabase/supabase-js';

import type { SupabaseClient } from '@supabase/supabase-js';

const erroLogin = 'Não foi possível entrar agora. Tente de novo.';
const erroCadastro = 'Não foi possível criar a conta. Tente de novo.';
const erroEnvio = 'Não foi possível enviar o e-mail. Tente de novo.';
const erroConexao = 'Sem conexão. Confira sua internet e tente de novo.';
const caminhoConfirmacao = '/auth/confirmar';
const retornoNativo = 'studyroutine://auth/confirmar';

export function retornoConfirmacaoWeb() {
  if (typeof window === 'undefined' || !window.history) return null;
  if (!/^https?:$/.test(window.location?.protocol)) return null;

  return `${window.location.origin}${caminhoConfirmacao}`;
}

export type ResultadoConfirmacao = 'confirmado' | 'entrar' | 'invalido' | 'indisponivel';

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
        emailRedirectTo: retornoConfirmacaoWeb() ?? retornoNativo,
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
      options: { emailRedirectTo: retornoConfirmacaoWeb() ?? retornoNativo },
    });

    if (!error) return null;
    if (isAuthRetryableFetchError(error)) return erroConexao;
    if (error.status === 429) return 'Aguarde um pouco antes de pedir outro e-mail.';

    return erroEnvio;
  } catch {
    return erroEnvio;
  }
}

export async function confirmarEmail(
  client: SupabaseClient,
  link: string,
): Promise<ResultadoConfirmacao | null> {
  let url: URL;

  try {
    url = new URL(link);
  } catch {
    return null;
  }

  const retorno = `${url.protocol}//${url.host}${url.pathname}`;
  if (retorno !== retornoNativo && retorno !== retornoConfirmacaoWeb()) return null;

  const codigo = url.searchParams.get('code');
  if (!codigo) return 'invalido';

  try {
    const { data: { session } } = await client.auth.getSession();
    if (session) return 'confirmado';

    const { error } = await client.auth.exchangeCodeForSession(codigo);
    if (!error) return 'confirmado';
    if (isAuthPKCECodeVerifierMissingError(error)) return 'entrar';
    if (isAuthRetryableFetchError(error)) return 'indisponivel';

    return 'invalido';
  } catch {
    return 'indisponivel';
  }
}
