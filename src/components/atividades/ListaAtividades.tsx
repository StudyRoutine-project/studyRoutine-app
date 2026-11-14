import { StyleSheet, View } from 'react-native';

import { MensagemErro } from '../MensagemErro';
import { FichaAtividade } from './FichaAtividade';

import type { Atividade } from '../../database/atividades';
import type { Disciplina } from '../../database/disciplinas';
import type { useConclusaoAtividade } from '../../hooks/useConclusaoAtividade';

type Props = {
  atividades: Atividade[];
  agora: number;
  disciplinas?: Map<string, Pick<Disciplina, 'nome'>>;
  conclusao: ReturnType<typeof useConclusaoAtividade>;
  abrirAtividade: (id: string) => void;
};

export function ListaAtividades({
  atividades,
  agora,
  disciplinas,
  conclusao,
  abrirAtividade,
}: Props) {
  const { alterarConclusao, atividadeSalvando, erroConclusao, exibir } = conclusao;

  return (
    <View style={styles.lista}>
      {atividades.map((atividade) => (
        <View key={atividade.id} style={styles.item}>
          <FichaAtividade
            atividade={exibir(atividade)}
            disciplina={disciplinas?.get(atividade.disciplina_id)?.nome}
            agora={agora}
            onPress={() => abrirAtividade(atividade.id)}
            onAlterarConclusao={() => void alterarConclusao(atividade)}
            salvando={atividadeSalvando === atividade.id}
            conclusaoDesativada={atividadeSalvando !== undefined}
          />
          {erroConclusao === atividade.id && (
            <MensagemErro mensagem="Não foi possível atualizar a atividade. Tente de novo." />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: { gap: 10 },
  item: { gap: 6 },
});
