import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { cores } from '../../theme/cores';

import type { ComponentRef, Ref } from 'react';
import type { TextInputProps } from 'react-native';

type Props = Omit<TextInputProps, 'onBlur' | 'onFocus' | 'secureTextEntry' | 'style'> & {
  rotulo: string;
  icone: 'mail' | 'lock' | 'user';
  erro?: string;
  senha?: boolean;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

export function CampoConta({ rotulo, icone, erro, senha = false, ref, ...props }: Props) {
  const [focado, setFocado] = useState(false);
  const [sobCursor, setSobCursor] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  return (
    <View style={styles.campo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View
        onPointerEnter={(event) => {
          if (event.nativeEvent.pointerType === 'mouse') setSobCursor(true);
        }}
        onPointerLeave={() => setSobCursor(false)}
        style={[
          styles.contorno,
          sobCursor && styles.contornoHover,
          focado && styles.contornoFocado,
          erro && styles.contornoErro,
        ]}
      >
        <Feather accessible={false} aria-hidden color={cores.secundario} name={icone} size={19} />
        <TextInput
          {...props}
          ref={ref}
          accessibilityLabel={rotulo}
          onBlur={() => setFocado(false)}
          onFocus={() => setFocado(true)}
          placeholderTextColor={cores.secundario}
          secureTextEntry={senha && !senhaVisivel}
          style={styles.entrada}
        />
        {senha && (
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
        )}
      </View>
      {erro && (
        <Text accessibilityLiveRegion="polite" style={styles.erro}>{erro}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
