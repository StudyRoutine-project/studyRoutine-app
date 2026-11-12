import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CabecalhoMarca } from '../components/CabecalhoMarca';
import { MensagemErro } from '../components/MensagemErro';
import { cores } from '../theme/cores';

import type { SupabaseClient, User } from '@supabase/supabase-js';

type Props = {
  client: SupabaseClient;
  usuario: User;
};

export function InicioScreen({ client, usuario }: Props) {
  const [saindo, setSaindo] = useState(false);
  const [erro, setErro] = useState(false);
  const nome = usuario.user_metadata.nome;

  async function sair() {
    if (saindo) return;

    setSaindo(true);
    setErro(false);

    try {
      const { error } = await client.auth.signOut({ scope: 'local' });
      setErro(Boolean(error));
    } catch {
      setErro(true);
    } finally {
      setSaindo(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.tela}>
      <View style={styles.conteudo}>
        <CabecalhoMarca compacto />
        <Text accessibilityRole="header" style={styles.titulo}>Início</Text>
        <Text style={styles.conta}>
          {typeof nome === 'string' && nome.trim() ? `Olá, ${nome.trim()}!` : usuario.email}
        </Text>
        <Pressable accessibilityRole="button" disabled={saindo} onPress={sair} style={styles.botao}>
          <Text style={styles.textoBotao}>{saindo ? 'Saindo…' : 'Sair da conta'}</Text>
        </Pressable>
        {erro && <MensagemErro mensagem="Não foi possível sair. Tente de novo." />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 12,
  },
  titulo: {
    color: cores.texto,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1.1,
    marginTop: 12,
  },
  conta: {
    color: cores.secundario,
    fontSize: 16,
  },
  botao: {
    alignSelf: 'flex-start',
    minHeight: 48,
    justifyContent: 'center',
  },
  textoBotao: {
    color: cores.roxo,
    fontSize: 16,
    fontWeight: '600',
  },
});
