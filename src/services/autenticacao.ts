import { isAuthRetryableFetchError } from '@supabase/supabase-js';

import type { SupabaseClient } from '@supabase/supabase-js';

const erroPadrao = 'Não foi possível entrar agora. Tente de novo.';

export async function entrar(client: SupabaseClient, email: string, senha: string) {
  try {
    const { error } = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });

    if (!error) return null;
    if (isAuthRetryableFetchError(error)) {
      return 'Sem conexão. Confira sua internet e tente de novo.';
    }
    if (error.code === 'invalid_credentials') return 'E-mail ou senha inválidos.';
    if (error.code === 'email_not_confirmed') return 'Confirme seu e-mail antes de entrar.';
    if (error.status === 429) return 'Muitas tentativas. Aguarde um pouco e tente de novo.';

    return erroPadrao;
  } catch {
    return erroPadrao;
  }
}
