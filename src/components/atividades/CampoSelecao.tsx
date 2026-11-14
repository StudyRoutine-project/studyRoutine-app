import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from '../../theme/cores';
import { FiguraIcone } from '../FiguraIcone';

import type { Icone } from '../FiguraIcone';

type Props = {
  rotulo: string;
  valor?: string;
  placeholder: string;
  icone: Icone;
  cor?: string;
  iconeComFundo?: boolean;
  erro?: string;
  mostrarSeta?: boolean;
  desativado: boolean;
  onPress: () => void;
};

export function CampoSelecao({
  rotulo,
  valor,
  placeholder,
  icone,
  cor = cores.roxo,
  iconeComFundo = true,
  erro,
  mostrarSeta = true,
  desativado,
  onPress,
}: Props) {
  const figura = <FiguraIcone icone={icone} cor={cor} tamanho={iconeComFundo ? 20 : 19} />;

  return (
    <View style={styles.campo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={rotulo}
        accessibilityValue={{ text: valor ?? placeholder }}
        disabled={desativado}
        onPress={onPress}
        style={({ pressed }) => [
          styles.botao,
          !iconeComFundo && styles.botaoIconeSimples,
          erro && styles.invalido,
          pressed && styles.pressionado,
        ]}
      >
        {iconeComFundo ? (
          <View style={[styles.icone, { backgroundColor: `${cor}18` }]}>{figura}</View>
        ) : (
          figura
        )}
        <Text style={[styles.valor, !valor && styles.placeholder]} numberOfLines={1}>
          {valor ?? placeholder}
        </Text>
        {mostrarSeta && (
          <Feather name="chevron-down" color={cores.secundario} size={16} aria-hidden />
        )}
      </Pressable>
      {erro && (
        <Text accessibilityLiveRegion="polite" style={styles.erro}>
          {erro}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  campo: { gap: 7, minWidth: 0 },
  rotulo: { color: cores.texto, fontSize: 14, fontWeight: '600' },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    minHeight: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.branco,
  },
  botaoIconeSimples: { gap: 12, paddingHorizontal: 15, minHeight: 56 },
  icone: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  valor: { flex: 1, color: cores.texto, fontSize: 15 },
  placeholder: { color: cores.secundario },
  invalido: { borderColor: cores.erro },
  pressionado: { backgroundColor: cores.fundoAviso },
  erro: { color: cores.erro, fontSize: 14 },
});
