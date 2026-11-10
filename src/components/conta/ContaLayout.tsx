import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cores } from '../../theme/cores';

import type { ReactNode } from 'react';

const logo = require('../../../assets/logo.png');
const ilustracao = require('../../../assets/ilustracao.png');

type Props = {
  titulo: string;
  subtitulo: string;
  compacto?: boolean;
  children: ReactNode;
};

export function ContaLayout({ titulo, subtitulo, compacto = false, children }: Props) {
  return (
    <SafeAreaView style={styles.tela}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.tela}
      >
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          <View style={styles.coluna}>
            <Image
              accessible
              accessibilityLabel="StudyRoutine"
              resizeMode="contain"
              source={logo}
              style={styles.logo}
            />
            <Image
              accessible={false}
              resizeMode="contain"
              source={ilustracao}
              style={[styles.ilustracao, compacto && styles.ilustracaoCompacta]}
            />

            <View style={[styles.apresentacao, compacto && styles.apresentacaoCompacta]}>
              <Text accessibilityRole="header" style={styles.titulo}>
                {titulo}
              </Text>
              <Text style={styles.subtitulo}>{subtitulo}</Text>
            </View>

            <View style={[styles.formulario, compacto && styles.formularioCompacto]}>
              {children}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.branco,
  },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 36,
  },
  coluna: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 392,
  },
  logo: {
    width: '72%',
    maxWidth: 264,
    height: 'auto',
    aspectRatio: 590 / 106,
  },
  ilustracao: {
    alignSelf: 'center',
    width: '94%',
    maxWidth: 344,
    height: 'auto',
    aspectRatio: 784 / 504,
    marginTop: 28,
    marginBottom: 16,
  },
  ilustracaoCompacta: {
    width: '74%',
    maxWidth: 252,
    marginTop: 16,
    marginBottom: 12,
  },
  apresentacao: {
    alignItems: 'center',
    gap: 5,
    marginBottom: 26,
  },
  apresentacaoCompacta: {
    marginBottom: 18,
  },
  titulo: {
    color: cores.texto,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.7,
    textAlign: 'center',
  },
  subtitulo: {
    color: cores.secundario,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  formulario: {
    gap: 15,
  },
  formularioCompacto: {
    gap: 12,
  },
});
