import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { cores } from '../theme/cores';
import { EstadoErro } from './EstadoErro';

import type { EstadoSincronizacao } from '../hooks/useSincronizacao';

type Props = {
  fase?: EstadoSincronizacao['fase'];
  sincronizar: () => void;
};

export function EstadoCarregamentoEstudos({ fase, sincronizar }: Props) {
  if (fase === 'offline' || fase === 'erro') {
    return (
      <EstadoErro
        mensagem={fase === 'offline'
          ? 'Conecte-se à internet para carregar seus estudos.'
          : 'Não foi possível carregar os dados da sua conta.'}
        tentarDeNovo={sincronizar}
      />
    );
  }

  return (
    <View accessibilityLiveRegion="polite" style={styles.conteudo}>
      <ActivityIndicator color={cores.roxo} accessible={false} />
      <Text style={styles.texto}>Carregando seus estudos…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 112,
    padding: 16,
    gap: 10,
  },
  texto: {
    color: cores.secundario,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
