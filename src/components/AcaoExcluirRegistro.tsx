import Feather from '@expo/vector-icons/Feather';
import { useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text } from 'react-native';

import { cores } from '../theme/cores';
import { ConfirmDialog } from './ConfirmDialog';

type Props = {
  entidade: 'disciplina' | 'atividade';
  nome: string;
  desativada: boolean;
  excluir: () => Promise<void>;
  concluir: () => void;
};

export function AcaoExcluirRegistro({ entidade, nome, desativada, excluir, concluir }: Props) {
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
        disabled={desativada || excluindo}
        onPress={() => {
          Keyboard.dismiss();
          setConfirmando(true);
        }}
        style={({ pressed }) => [
          styles.excluir,
          (pressed || desativada || excluindo) && styles.ocupado,
        ]}
      >
        <Feather name="trash-2" size={17} color={cores.erro} aria-hidden />
        <Text style={styles.excluirTexto}>Excluir {entidade}</Text>
      </Pressable>

      <ConfirmDialog
        visivel={confirmando}
        titulo={`Excluir ${entidade}?`}
        mensagem={
          <>
            <Text style={styles.nome}>{nome}</Text> será excluída.
          </>
        }
        textoConfirmar="Excluir"
        textoProcessando="Excluindo…"
        ocupado={excluindo}
        confirmarDesativado={desativada}
        erro={erro ? `Não foi possível excluir a ${entidade}. Tente de novo.` : undefined}
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
  nome: { fontWeight: '700' },
  ocupado: { opacity: 0.6 },
});
