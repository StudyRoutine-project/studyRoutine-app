import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { cores } from '../theme/cores';

import type { ComponentProps, ComponentRef, ReactNode, Ref } from 'react';
import type { TextInputProps } from 'react-native';

export type CampoTextoProps = Omit<TextInputProps, 'onBlur' | 'onFocus' | 'style'> & {
  rotulo?: string;
  icone?: ComponentProps<typeof Feather>['name'];
  corIcone?: string;
  erro?: string;
  acao?: ReactNode;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

export function CampoTexto({
  rotulo,
  icone,
  corIcone = cores.secundario,
  erro,
  acao,
  ref,
  ...props
}: CampoTextoProps) {
  const [focado, setFocado] = useState(false);
  const [sobCursor, setSobCursor] = useState(false);

  return (
    <View style={styles.campo}>
      {rotulo && <Text style={styles.rotulo}>{rotulo}</Text>}
      <View
        onPointerEnter={(event) => {
          if (event.nativeEvent.pointerType === 'mouse') setSobCursor(true);
        }}
        onPointerLeave={() => setSobCursor(false)}
        style={[
          styles.contorno,
          icone && styles.comIcone,
          sobCursor && styles.contornoHover,
          focado && styles.contornoFocado,
          erro && styles.contornoErro,
        ]}
      >
        {icone && (
          <Feather accessible={false} aria-hidden color={corIcone} name={icone} size={19} />
        )}
        <TextInput
          accessibilityLabel={rotulo}
          {...props}
          ref={ref}
          onBlur={() => setFocado(false)}
          onFocus={() => setFocado(true)}
          placeholderTextColor={cores.secundario}
          style={[styles.entrada, props.multiline && styles.multilinha]}
        />
        {acao}
      </View>
      {erro && (
        <Text accessibilityLiveRegion="polite" style={styles.erro}>
          {erro}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  campo: { gap: 7 },
  rotulo: { color: cores.texto, fontSize: 14, fontWeight: '600' },
  contorno: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.branco,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 12,
  },
  comIcone: { paddingLeft: 15 },
  contornoHover: { borderColor: cores.secundario },
  contornoFocado: { backgroundColor: cores.fundo, borderColor: cores.roxo },
  contornoErro: { borderColor: cores.erro },
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
  multilinha: { minHeight: 88, textAlignVertical: 'top' },
  erro: { color: cores.erro, fontSize: 14 },
});
