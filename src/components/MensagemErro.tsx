import { StyleSheet, Text } from 'react-native';

import { cores } from '../theme/cores';

type Props = {
  mensagem: string;
};

export function MensagemErro({ mensagem }: Props) {
  return (
    <Text accessibilityRole="alert" style={styles.erro}>
      {mensagem}
    </Text>
  );
}

const styles = StyleSheet.create({
  erro: {
    color: cores.erro,
    fontSize: 14,
  },
});
