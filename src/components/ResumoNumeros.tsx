import { CalendarXIcon, CheckCircleIcon } from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';

import { cores } from '../theme/cores';
import { IndicadorNumero } from './IndicadorNumero';

type Props = {
  atrasadas: number;
  concluidas: number;
  total: number;
};

export function ResumoNumeros({ atrasadas, concluidas, total }: Props) {
  return (
    <View style={styles.resumo}>
      <IndicadorNumero
        icone={CalendarXIcon}
        cor={cores.erro}
        valor={atrasadas}
        rotulo="Atrasadas"
      />
      <IndicadorNumero
        icone={CheckCircleIcon}
        cor={cores.sucesso}
        valor={concluidas}
        complemento={`de ${total}`}
        rotulo="Concluídas"
        progresso={total === 0 ? 0 : concluidas / total}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  resumo: { flexDirection: 'row', gap: 12 },
});
