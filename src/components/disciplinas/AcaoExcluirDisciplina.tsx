import Feather from '@expo/vector-icons/Feather';
import { useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text } from 'react-native';

import { cores } from '../../theme/cores';
import { ConfirmarExclusao } from '../ConfirmarExclusao';

type Props = {
  nome: string;
  desativada: boolean;
  excluir: () => Promise<void>;
  concluir: () => void;
};

export function AcaoExcluirDisciplina({ nome, desativada, excluir, concluir }: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState(false);
  const excluindoRef = useRef(false);

  function fecharConfirmacao() {
    if (excluindoRef.current) return;
    setConfirmando(false);
    setErro(false);
  }

  async function confirmarExclusao() {
    if (desativada || excluindoRef.current) return;
    excluindoRef.current = true;
    setExcluindo(true);
    setErro(false);
    try {
      await excluir();
    } catch {
      setErro(true);
      return;
    } finally {
      excluindoRef.current = false;
      setExcluindo(false);
    }
    setConfirmando(false);
    concluir();
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        disabled={desativada}
        onPress={() => {
          Keyboard.dismiss();
          setConfirmando(true);
        }}
        style={[styles.excluir, desativada && styles.ocupado]}
      >
        <Feather name="trash-2" size={17} color={cores.erro} aria-hidden />
        <Text style={styles.excluirTexto}>Excluir disciplina</Text>
      </Pressable>

      <ConfirmarExclusao
        visivel={confirmando}
        titulo="Excluir disciplina?"
        nome={nome}
        excluindo={excluindo}
        confirmarDesativado={desativada}
        erro={erro ? 'Não foi possível excluir a disciplina. Tente de novo.' : undefined}
        onCancelar={fecharConfirmacao}
        onConfirmar={confirmarExclusao}
      />
    </>
  );
}

const styles = StyleSheet.create({
  excluir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
  },
  excluirTexto: { color: cores.erro, fontSize: 15, fontWeight: '600' },
  ocupado: { opacity: 0.6 },
});
