import { StyleSheet, Text, View } from 'react-native';

import { cores } from '../theme/cores';

type Props = {
  nome: string;
  email?: string;
  grande?: boolean;
};

export function AvatarIniciais({ nome, email, grande = false }: Props) {
  const palavras = nome.trim().split(/\s+/u);
  const primeira = palavras[0] || email?.trim() || '?';
  const ultima = palavras.length > 1 ? palavras[palavras.length - 1] : '';
  const iniciais = `${Array.from(primeira)[0]}${Array.from(ultima)[0] ?? ''}`.toUpperCase();

  return (
    <View aria-hidden style={[styles.avatar, grande && styles.avatarGrande]}>
      <Text maxFontSizeMultiplier={1.3} style={[styles.iniciais, grande && styles.iniciaisGrandes]}>
        {iniciais}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.roxoClaro,
  },
  avatarGrande: { width: 88, height: 88, borderRadius: 44 },
  iniciais: { color: cores.branco, fontSize: 15, fontWeight: '700' },
  iniciaisGrandes: { fontSize: 30 },
});
