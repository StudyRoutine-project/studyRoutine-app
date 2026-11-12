import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, Text, View } from 'react-native';

import { cores } from '../../theme/cores';

type Props = {
  nome: string;
  descricao?: string | null;
  cor: string;
};

export function FichaDisciplina({ nome, descricao, cor }: Props) {
  return (
    <View style={styles.ficha}>
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
    </View>
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
