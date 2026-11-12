import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CabecalhoMarca } from '../components/CabecalhoMarca';
import { cores } from '../theme/cores';

import type { ReactNode } from 'react';

type Props = {
  nome: string;
  email?: string;
  acaoPerfil: ReactNode;
};

export function InicioScreen({ nome, email, acaoPerfil }: Props) {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.tela}>
      <View style={styles.conteudo}>
        <CabecalhoMarca compacto acaoDireita={acaoPerfil} />
        <Text accessibilityRole="header" style={styles.titulo}>
          Início
        </Text>
        {(nome || email) && <Text style={styles.conta}>{nome ? `Olá, ${nome}!` : email}</Text>}
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
    alignSelf: 'center',
    width: '100%',
    maxWidth: 520,
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
});
