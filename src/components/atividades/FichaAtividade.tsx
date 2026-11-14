import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from '../../theme/cores';
import { superficie } from '../../theme/superficie';
import { FiguraIcone } from '../FiguraIcone';
import { CheckboxAtividade } from './CheckboxAtividade';
import { PrazoAtividade } from './PrazoAtividade';
import { visualTipo } from './tiposAtividade';

import type { Atividade } from '../../database/atividades';

type Props = {
  atividade: Atividade;
  disciplina?: string;
  agora: number;
  onPress: () => void;
  onAlterarConclusao: () => void;
  salvando: boolean;
  conclusaoDesativada: boolean;
};

export function FichaAtividade({
  atividade,
  disciplina,
  agora,
  onPress,
  onAlterarConclusao,
  salvando,
  conclusaoDesativada,
}: Props) {
  const tipo = visualTipo[atividade.tipo];
  const concluida = atividade.concluida === 1;
  const corIcone = concluida ? cores.secundario : tipo.cor;

  return (
    <View style={[superficie, styles.ficha]}>
      <Pressable
        accessibilityRole="button"
        accessibilityHint="Abre a edição da atividade"
        onPress={onPress}
        disabled={salvando}
        style={({ pressed }) => [styles.abrir, pressed && styles.pressionada]}
      >
        <View aria-hidden style={[styles.icone, { backgroundColor: `${corIcone}14` }]}>
          <FiguraIcone icone={tipo.icone} cor={corIcone} tamanho={22} />
        </View>
        <View style={styles.textos}>
          <Text numberOfLines={1} style={[styles.titulo, concluida && styles.tituloConcluido]}>
            {atividade.titulo}
          </Text>
          <Text numberOfLines={1} style={styles.detalhes}>
            {disciplina ? `${disciplina} · ` : `${tipo.rotulo} · `}
            <PrazoAtividade atividade={atividade} agora={agora} />
          </Text>
        </View>
      </Pressable>
      <CheckboxAtividade
        rotulo={`Conclusão de ${atividade.titulo}`}
        marcada={concluida}
        desativada={conclusaoDesativada}
        onPress={onAlterarConclusao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ficha: { flexDirection: 'row', alignItems: 'center', paddingRight: 6, borderRadius: 18 },
  abrir: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 68,
    paddingVertical: 12,
    paddingLeft: 12,
  },
  pressionada: { opacity: 0.6 },
  icone: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  textos: { flex: 1, gap: 3 },
  titulo: { color: cores.texto, fontSize: 15, fontWeight: '600', lineHeight: 20 },
  tituloConcluido: { color: cores.secundario, textDecorationLine: 'line-through' },
  detalhes: { color: cores.secundario, fontSize: 13 },
});
