import Feather from '@expo/vector-icons/Feather';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cores } from '../../theme/cores';

import type { ReactNode } from 'react';

export function PainelSelecao({
  titulo,
  fechar,
  children,
}: {
  titulo: string;
  fechar: () => void;
  children: ReactNode;
}) {
  const { top, bottom } = useSafeAreaInsets();

  return (
    <Modal transparent animationType="fade" onRequestClose={fechar}>
      <View style={[styles.fundo, { paddingTop: top + 16, paddingBottom: bottom + 16 }]}>
        <View accessibilityViewIsModal style={styles.painel}>
          <View style={styles.cabecalho}>
            <Text accessibilityRole="header" style={styles.titulo}>
              {titulo}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar seletor"
              onPress={fechar}
              style={styles.fechar}
            >
              <Feather name="x" size={22} color={cores.secundario} aria-hidden />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: `${cores.texto}66`,
  },
  painel: {
    width: '100%',
    maxWidth: 410,
    maxHeight: '100%',
    padding: 16,
    gap: 12,
    backgroundColor: cores.branco,
    borderRadius: 20,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titulo: { flexShrink: 1, fontSize: 21, fontWeight: '700', color: cores.texto },
  fechar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: cores.fundoAviso,
  },
});
