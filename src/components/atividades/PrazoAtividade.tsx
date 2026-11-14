import { StyleSheet, Text } from 'react-native';

import { cores } from '../../theme/cores';
import { descreverPrazo, formatarPrazoResumido } from '../../utils/datas';
import { situacaoAtividade } from './situacaoAtividade';

import type { Atividade } from '../../database/atividades';

type Props = {
  atividade: Pick<Atividade, 'concluida' | 'adiada' | 'data' | 'horario'>;
  agora: number;
};

const corSituacao = {
  atrasada: cores.erro,
  hoje: cores.roxo,
  pendente: cores.secundario,
  concluida: cores.secundario,
};

export function PrazoAtividade({ atividade, agora }: Props) {
  const situacao = situacaoAtividade(atividade, agora);
  const adiada = atividade.adiada === 1 && (situacao === 'hoje' || situacao === 'pendente');

  if (situacao === 'concluida') {
    return <Text>{formatarPrazoResumido(atividade.data, atividade.horario)}</Text>;
  }

  return (
    <Text
      style={[
        { color: adiada ? cores.aviso : corSituacao[situacao] },
        situacao !== 'pendente' && styles.destaque,
      ]}
    >
      {descreverPrazo(atividade.data, atividade.horario, agora)}
      {adiada && ' (adiada)'}
    </Text>
  );
}

const styles = StyleSheet.create({
  destaque: { fontWeight: '600' },
});
