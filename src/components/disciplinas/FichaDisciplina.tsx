import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from '../../theme/cores';

type Props = {
  nome: string;
  descricao?: string | null;
  cor: string;
  onPress: () => void;
};

export function FichaDisciplina({ nome, descricao, cor, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={nome}
      accessibilityHint="Abre a edição da disciplina"
      onPress={onPress}
      style={({ pressed }) => [styles.ficha, pressed && styles.pressionada]}
    >
      <View style={[styles.livro, { backgroundColor: `${cor}18`, borderLeftColor: cor }]}>
        <Feather accessible={false} aria-hidden name="book-open" size={22} color={cor} />
      </View>
      <View style={styles.dados}>
        <Text style={styles.nome}>{nome}</Text>
        {descricao ? (
          <Text style={styles.descricao} numberOfLines={2}>
            {descricao}
          </Text>
        ) : null}
      </View>
      <Feather
        accessible={false}
        aria-hidden
        name="chevron-right"
        size={19}
        color={cores.secundario}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ficha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 74,
    padding: 12,
    backgroundColor: cores.branco,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 16,
  },
  pressionada: { backgroundColor: cores.fundoAviso },
  livro: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 3,
    borderRadius: 10,
  },
  dados: { flex: 1, gap: 3 },
  nome: { color: cores.texto, fontSize: 17, fontWeight: '700' },
  descricao: { color: cores.secundario, fontSize: 14, lineHeight: 20 },
});
