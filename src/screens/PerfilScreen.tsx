import Feather from '@expo/vector-icons/Feather';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvatarIniciais } from '../components/AvatarIniciais';
import { BotaoVoltar } from '../components/BotaoVoltar';
import { CabecalhoMarca } from '../components/CabecalhoMarca';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { cores } from '../theme/cores';

import type { SupabaseClient } from '@supabase/supabase-js';

type Props = {
  client: SupabaseClient;
  nome: string;
  email?: string;
  voltar: () => void;
};

export function PerfilScreen({ client, nome, email, voltar }: Props) {
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [erro, setErro] = useState(false);
  const saindoRef = useRef(false);

  function cancelarSaida() {
    if (saindoRef.current) return;
    setConfirmandoSaida(false);
    setErro(false);
  }

  async function sair() {
    if (saindoRef.current) return;

    saindoRef.current = true;
    setSaindo(true);
    setErro(false);
    try {
      const { error } = await client.auth.signOut({ scope: 'local' });
      setErro(Boolean(error));
      if (!error) setConfirmandoSaida(false);
    } catch {
      setErro(true);
    } finally {
      saindoRef.current = false;
      setSaindo(false);
    }
  }

  return (
    <SafeAreaView style={styles.tela}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.coluna}>
          <CabecalhoMarca compacto acao={<BotaoVoltar onPress={voltar} desativado={saindo} />} />
          <Text accessibilityRole="header" style={styles.titulo}>
            Perfil
          </Text>

          <View style={[styles.cartao, styles.identidade]}>
            <AvatarIniciais nome={nome} email={email} grande />
            <Text style={styles.nome}>{nome || 'Estudante'}</Text>
            {email && <Text style={[styles.descricao, styles.email]}>{email}</Text>}
          </View>

          <View style={styles.cartao}>
            <Text accessibilityRole="header" style={styles.subtitulo}>
              Lembretes
            </Text>
            <Text style={styles.descricao}>Receba avisos sobre as atividades agendadas.</Text>
            <View style={styles.lembretes}>
              <Feather name="bell" color={cores.roxo} size={22} aria-hidden />
              <Text style={styles.rotuloLembretes}>Ativar lembretes</Text>
              <Switch accessibilityLabel="Ativar lembretes" disabled value={false} />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: saindo, disabled: saindo }}
            disabled={saindo}
            onPress={() => setConfirmandoSaida(true)}
            style={({ pressed }) => [styles.sair, pressed && styles.pressionado]}
          >
            <Feather name="log-out" color={cores.erro} size={20} aria-hidden />
            <Text style={styles.textoSair}>Sair da conta</Text>
          </Pressable>
        </View>
      </ScrollView>
      <ConfirmDialog
        visivel={confirmandoSaida}
        titulo="Sair da conta?"
        mensagem="Para acessar sua conta novamente, entre com seu e-mail e senha."
        textoConfirmar="Sair"
        textoProcessando="Saindo…"
        ocupado={saindo}
        erro={erro ? 'Não foi possível sair. Tente de novo.' : undefined}
        onCancelar={cancelarSaida}
        onConfirmar={sair}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 24 },
  coluna: { alignSelf: 'center', width: '100%', maxWidth: 472, gap: 16 },
  titulo: {
    color: cores.texto,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1.1,
    marginTop: 8,
  },
  cartao: {
    backgroundColor: cores.branco,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  identidade: { alignItems: 'center', paddingVertical: 22 },
  nome: { color: cores.texto, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  email: { textAlign: 'center' },
  subtitulo: { color: cores.texto, fontSize: 20, fontWeight: '700' },
  descricao: { color: cores.secundario, fontSize: 15, lineHeight: 21 },
  lembretes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 52,
    backgroundColor: cores.fundoAviso,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rotuloLembretes: { flex: 1, color: cores.texto, fontSize: 15, fontWeight: '600' },
  sair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: cores.erro,
    borderRadius: 12,
    backgroundColor: cores.branco,
  },
  pressionado: { opacity: 0.75 },
  textoSair: { color: cores.erro, fontSize: 16, fontWeight: '700' },
});
