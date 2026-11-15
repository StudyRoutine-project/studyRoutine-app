import { StyleSheet, Text } from 'react-native';

import { cores } from '../../theme/cores';
import { descreverPrazo, formatarPrazoResumido } from '../../utils/datas';
import { situacaoAtividade } from '../../utils/situacaoAtividade';

import type { Atividade } from '../../database/atividades';
import type { Situacao } from '../../utils/situacaoAtividade';

type Props = {
  atividade: Pick<Atividade, 'concluida' | 'adiada' | 'data' | 'horario'>;
  agora: number;
  somenteHorario?: boolean;
};

const corSituacao = {
  atrasada: cores.erro,
  hoje: cores.roxo,
  pendente: cores.secundario,
  concluida: cores.secundario,
};

function descreverHorario(horario: string | null, situacao: Situacao) {
  const hora = horario?.slice(0, 5);
  if (!hora) return 'Sem horário';
  return situacao === 'atrasada' ? `Venceu às ${hora}` : `Às ${hora}`;
}

export function PrazoAtividade({ atividade, agora, somenteHorario = false }: Props) {
  const situacao = situacaoAtividade(atividade, agora);
  const adiada = atividade.adiada === 1 && (situacao === 'hoje' || situacao === 'pendente');
  const texto = somenteHorario
    ? descreverHorario(atividade.horario, situacao)
    : situacao === 'concluida'
      ? formatarPrazoResumido(atividade.data, atividade.horario)
      : descreverPrazo(atividade.data, atividade.horario, agora);

  if (situacao === 'concluida') return <Text>{texto}</Text>;

  return (
    <Text
      style={[
        { color: adiada ? cores.aviso : corSituacao[situacao] },
        situacao !== 'pendente' && styles.destaque,
      ]}
    >
      {texto}
      {adiada && ' (adiada)'}
    </Text>
  );
}

const styles = StyleSheet.create({
  destaque: { fontWeight: '600' },
});
