import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from '../theme/cores';
import { MensagemErro } from './MensagemErro';

import type { ReactNode } from 'react';

type Props = {
  visivel: boolean;
  titulo: string;
  mensagem: ReactNode;
  textoConfirmar: string;
  textoProcessando: string;
  ocupado: boolean;
  confirmarDesativado?: boolean;
  erro?: string;
  onCancelar: () => void;
  onConfirmar: () => void;
};

export function ConfirmDialog({
  visivel,
  titulo,
  mensagem,
  textoConfirmar,
  textoProcessando,
  ocupado,
  confirmarDesativado = false,
  erro,
  onCancelar,
  onConfirmar,
}: Props) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visivel}
      onRequestClose={() => {
        if (!ocupado) onCancelar();
      }}
    >
      <View style={styles.fundo}>
        <View style={styles.dialogo} accessibilityViewIsModal>
          <Text accessibilityRole="header" style={styles.titulo}>
            {titulo}
          </Text>
          <Text numberOfLines={4} style={styles.descricao}>
            {mensagem}
          </Text>
          {erro && <MensagemErro mensagem={erro} />}
          <View style={styles.botoes}>
            <Pressable
              accessibilityRole="button"
              disabled={ocupado}
              onPress={onCancelar}
              style={styles.cancelar}
            >
              <Text style={styles.cancelarTexto}>Cancelar</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ busy: ocupado }}
              disabled={confirmarDesativado || ocupado}
              onPress={onConfirmar}
              style={[styles.confirmar, ocupado && styles.ocupado]}
            >
              <Text style={styles.confirmarTexto}>
                {ocupado ? textoProcessando : textoConfirmar}
              </Text>
            </Pressable>
          </View>
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
    padding: 24,
    backgroundColor: `${cores.texto}66`,
  },
  dialogo: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: cores.branco,
    borderRadius: 20,
    padding: 22,
    gap: 12,
  },
  titulo: { color: cores.texto, fontSize: 22, fontWeight: '700' },
  descricao: { color: cores.secundario, fontSize: 15, lineHeight: 21 },
  botoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  cancelar: { minHeight: 48, paddingHorizontal: 14, justifyContent: 'center' },
  cancelarTexto: { color: cores.roxo, fontSize: 15, fontWeight: '600' },
  confirmar: {
    minHeight: 48,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: cores.erro,
  },
  confirmarTexto: { color: cores.branco, fontSize: 15, fontWeight: '700' },
  ocupado: { opacity: 0.6 },
});
