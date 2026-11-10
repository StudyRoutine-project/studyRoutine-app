import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { entrar } from '../services/autenticacao';
import { cores } from '../theme/cores';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ComponentRef } from 'react';

const logo = require('../../assets/logo.png');
const ilustracao = require('../../assets/ilustracao.png');

type Campo = 'email' | 'senha';

export function LoginScreen({ client }: { client: SupabaseClient }) {
  const campoSenha = useRef<ComponentRef<typeof TextInput>>(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [campoFocado, setCampoFocado] = useState<Campo | null>(null);
  const [campoSobCursor, setCampoSobCursor] = useState<Campo | null>(null);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [validar, setValidar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const erroEmail = validar && !emailValido;
  const erroSenha = validar && !senha;

  async function enviar() {
    if (enviando) return;

    setValidar(true);
    setErro(null);
    if (!emailValido || !senha) return;

    Keyboard.dismiss();
    setEnviando(true);
    setErro(await entrar(client, email, senha));
    setEnviando(false);
  }

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
              style={styles.ilustracao}
            />

            <View style={styles.apresentacao}>
              <Text accessibilityRole="header" style={styles.titulo}>
                Bem-vindo de volta
              </Text>
              <Text style={styles.subtitulo}>Organize seus estudos em um só lugar.</Text>
            </View>

            <View style={styles.formulario}>
              <View style={styles.campo}>
                <Text style={styles.rotulo}>E-mail</Text>
                <View
                  onPointerEnter={(event) => {
                    if (event.nativeEvent.pointerType === 'mouse') setCampoSobCursor('email');
                  }}
                  onPointerLeave={() => setCampoSobCursor(null)}
                  style={[
                    styles.contorno,
                    campoSobCursor === 'email' && styles.contornoHover,
                    campoFocado === 'email' && styles.contornoFocado,
                    erroEmail && styles.contornoErro,
                  ]}
                >
                  <Feather accessible={false} aria-hidden color={cores.secundario} name="mail" size={19} />
                  <TextInput
                    accessibilityLabel="E-mail"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    editable={!enviando}
                    keyboardType="email-address"
                    onBlur={() => setCampoFocado(null)}
                    onChangeText={(valor) => {
                      setEmail(valor);
                      setErro(null);
                    }}
                    onFocus={() => setCampoFocado('email')}
                    onSubmitEditing={() => campoSenha.current?.focus()}
                    placeholder="Digite seu e-mail"
                    placeholderTextColor={cores.secundario}
                    returnKeyType="next"
                    style={styles.entrada}
                    submitBehavior="submit"
                    value={email}
                  />
                </View>
                {erroEmail && (
                  <Text accessibilityLiveRegion="polite" style={styles.erro}>
                    Digite um e-mail válido.
                  </Text>
                )}
              </View>

              <View style={styles.campo}>
                <Text style={styles.rotulo}>Senha</Text>
                <View
                  onPointerEnter={(event) => {
                    if (event.nativeEvent.pointerType === 'mouse') setCampoSobCursor('senha');
                  }}
                  onPointerLeave={() => setCampoSobCursor(null)}
                  style={[
                    styles.contorno,
                    campoSobCursor === 'senha' && styles.contornoHover,
                    campoFocado === 'senha' && styles.contornoFocado,
                    erroSenha && styles.contornoErro,
                  ]}
                >
                  <Feather accessible={false} aria-hidden color={cores.secundario} name="lock" size={19} />
                  <TextInput
                    ref={campoSenha}
                    accessibilityLabel="Senha"
                    autoCapitalize="none"
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    placeholderTextColor={cores.secundario}
                    autoCorrect={false}
                    editable={!enviando}
                    onBlur={() => setCampoFocado(null)}
                    onChangeText={(valor) => {
                      setSenha(valor);
                      setErro(null);
                    }}
                    onFocus={() => setCampoFocado('senha')}
                    onSubmitEditing={enviar}
                    returnKeyType="go"
                    secureTextEntry={!senhaVisivel}
                    style={styles.entrada}
                    value={senha}
                  />
                  <Pressable
                    accessibilityLabel={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
                    accessibilityRole="button"
                    onPress={() => setSenhaVisivel((visivel) => !visivel)}
                    style={styles.visibilidade}
                  >
                    <Feather
                      accessible={false}
                      aria-hidden
                      color={cores.secundario}
                      name={senhaVisivel ? 'eye' : 'eye-off'}
                      size={20}
                    />
                  </Pressable>
                </View>
                {erroSenha && (
                  <Text accessibilityLiveRegion="polite" style={styles.erro}>
                    Digite sua senha.
                  </Text>
                )}
              </View>

              {erro && (
                <Text accessibilityRole="alert" style={styles.erro}>
                  {erro}
                </Text>
              )}

              <Pressable
                accessibilityLabel={enviando ? 'Entrando…' : 'Entrar'}
                accessibilityRole="button"
                accessibilityState={{ busy: enviando, disabled: enviando }}
                disabled={enviando}
                onPress={enviar}
                style={({ pressed }) => [
                  styles.botao,
                  (pressed || enviando) && styles.botaoPressionado,
                ]}
              >
                <LinearGradient
                  colors={['#6849EB', cores.roxo, '#2E1B88']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradiente}
                >
                  <Text style={styles.textoBotao}>{enviando ? 'Entrando…' : 'Entrar'}</Text>
                  <Feather
                    accessible={false}
                    aria-hidden
                    color={cores.branco}
                    name="arrow-right"
                    size={21}
                    style={styles.setaBotao}
                  />
                </LinearGradient>
              </Pressable>
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
  apresentacao: {
    alignItems: 'center',
    gap: 5,
    marginBottom: 26,
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
  campo: {
    gap: 7,
  },
  rotulo: {
    color: cores.texto,
    fontSize: 14,
    fontWeight: '600',
  },
  contorno: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.branco,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 15,
  },
  contornoHover: {
    borderColor: cores.secundario,
  },
  contornoFocado: {
    backgroundColor: cores.fundo,
    borderColor: cores.roxo,
  },
  contornoErro: {
    borderColor: cores.erro,
  },
  entrada: {
    flex: 1,
    color: cores.texto,
    fontSize: 16,
    minHeight: 54,
    outlineStyle: 'solid',
    outlineWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  visibilidade: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  erro: {
    color: cores.erro,
    fontSize: 14,
  },
  botao: {
    borderRadius: 27,
    overflow: 'hidden',
    marginTop: 7,
  },
  botaoPressionado: {
    opacity: 0.82,
  },
  gradiente: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 52,
    paddingVertical: 12,
  },
  textoBotao: {
    color: cores.branco,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  setaBotao: {
    position: 'absolute',
    right: 18,
  },
});
