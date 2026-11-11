import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MensagemErro } from '../components/MensagemErro';
import { BotaoConta } from '../components/conta/BotaoConta';
import { cores } from '../theme/cores';

import type { SupabaseClient, User } from '@supabase/supabase-js';

type Props = {
  client: SupabaseClient;
  usuario: User;
  abrirDisciplinas: () => void;
};

export function InicioScreen({ client, usuario, abrirDisciplinas }: Props) {
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
    <SafeAreaView style={styles.tela}>
      <View style={styles.conteudo}>
        <Text accessibilityRole="header" style={styles.titulo}>Início</Text>
        <Text style={styles.conta}>
          {typeof nome === 'string' && nome.trim() ? `Olá, ${nome.trim()}!` : usuario.email}
        </Text>
        <BotaoConta texto="Disciplinas" onPress={abrirDisciplinas} />
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
    padding: 28,
    gap: 12,
  },
  titulo: {
    color: cores.texto,
    fontSize: 30,
    fontWeight: '700',
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
