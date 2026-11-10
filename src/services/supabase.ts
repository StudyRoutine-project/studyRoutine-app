import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

import type { Session } from '@supabase/supabase-js';

function lerConfiguracao() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const chave = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !chave) return null;

  try {
    const endereco = new URL(url);
    if (endereco.protocol !== 'http:' && endereco.protocol !== 'https:') return null;

    const host = endereco.host.replace(/[^a-zA-Z0-9._-]/g, '-');
    return { url, chave, storageKey: `studyroutine-${host}` };
  } catch {
    return null;
  }
}

const configuracao = lerConfiguracao();

const storage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

export const supabase = configuracao
  ? createClient(configuracao.url, configuracao.chave, {
      auth: {
        storage,
        storageKey: configuracao.storageKey,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export function criarClienteTemporario() {
  if (!configuracao) return null;

  return createClient(configuracao.url, configuracao.chave, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
      storageKey: `${configuracao.storageKey}-codigo`,
    },
  });
}

export async function lerUsuarioSalvo() {
  if (!configuracao) return null;

  const valor = await storage.getItem(configuracao.storageKey);
  if (!valor) return null;

  const sessao: Session = JSON.parse(valor);
  return sessao?.user?.id ? sessao.user : null;
}
