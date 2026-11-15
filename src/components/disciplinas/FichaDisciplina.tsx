import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from '../../theme/cores';
import { contar } from '../../utils/contar';
import { IconeDisciplina } from './IconeDisciplina';

export type ResumoDisciplina = { atrasadas: number; pendentes: number; concluidas: number };

type Props = {
  nome: string;
  cor: string;
  resumo: ResumoDisciplina;
  onPress: () => void;
};

function Situacao({ atrasadas, pendentes, concluidas }: ResumoDisciplina) {
  if (atrasadas + pendentes + concluidas === 0) {
    return <Text style={styles.situacao}>Nenhuma atividade</Text>;
  }
  if (atrasadas + pendentes === 0) {
    return <Text style={[styles.situacao, styles.concluida]}>Tudo concluído</Text>;
  }
  return (
    <Text numberOfLines={1} style={styles.situacao}>
      {pendentes > 0 && contar(pendentes, 'pendente', 'pendentes')}
      {pendentes > 0 && atrasadas > 0 && ', '}
      {atrasadas > 0 && (
        <Text style={styles.atrasada}>{contar(atrasadas, 'atrasada', 'atrasadas')}</Text>
      )}
    </Text>
  );
}

export function FichaDisciplina({ nome, cor, resumo, onPress }: Props) {
  const total = resumo.atrasadas + resumo.pendentes + resumo.concluidas;
  const percentual = total === 0 ? 0 : Math.round((resumo.concluidas / total) * 100);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={total === 0 ? nome : `${nome}, ${percentual}% concluído`}
      accessibilityHint="Abre os detalhes e as atividades da disciplina"
      onPress={onPress}
      style={({ pressed }) => [
        styles.ficha,
        { backgroundColor: `${cor}1A` },
        pressed && styles.pressionada,
      ]}
    >
      <View aria-hidden style={styles.selo}>
        <IconeDisciplina color={cor} size={26} />
      </View>

      <View style={styles.textos}>
        <Text numberOfLines={1} style={styles.nome}>
          {nome}
        </Text>
        <Situacao {...resumo} />
        {total > 0 && (
          <View aria-hidden style={styles.progresso}>
            <View style={styles.trilho}>
              <View
                style={[styles.preenchido, { width: `${percentual}%`, backgroundColor: cor }]}
              />
            </View>
            <Text style={styles.percentual}>{percentual}%</Text>
          </View>
        )}
      </View>

      <Feather aria-hidden name="chevron-right" size={22} color={`${cores.texto}80`} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ficha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 88,
    paddingVertical: 14,
    paddingLeft: 12,
    paddingRight: 10,
    borderRadius: 22,
  },
  pressionada: { opacity: 0.75 },
  selo: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: cores.branco,
  },
  textos: { flex: 1, gap: 3 },
  nome: { color: cores.texto, fontSize: 16, fontWeight: '600', lineHeight: 21 },
  situacao: { color: cores.secundario, fontSize: 13 },
  concluida: { color: cores.sucesso, fontWeight: '600' },
  atrasada: { color: cores.erro, fontWeight: '600' },
  progresso: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5 },
  trilho: {
    flex: 1,
    height: 6,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: cores.branco,
  },
  preenchido: { height: '100%', borderRadius: 3 },
  percentual: {
    minWidth: 34,
    color: cores.texto,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
