import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { AppState } from 'react-native';

export function useHorarioAtual() {
  const [agora, setAgora] = useState(Date.now);

  useFocusEffect(
    useCallback(() => {
      const atualizar = () => setAgora(Date.now());
      atualizar();
      const timer = setInterval(atualizar, 30_000);
      const assinatura = AppState.addEventListener('change', (estado) => {
        if (estado === 'active') atualizar();
      });

      return () => {
        clearInterval(timer);
        assinatura.remove();
      };
    }, []),
  );

  return agora;
}
