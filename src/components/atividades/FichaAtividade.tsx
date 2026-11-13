import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from '../../theme/cores';
import { formatarPrazoResumido } from '../../utils/datas';
import { CheckboxAtividade } from './CheckboxAtividade';
import { visualTipo } from './tiposAtividade';

import type { Atividade } from '../../database/atividades';

type Props = {
  atividade: Atividade;
  onPress: () => void;
  onAlterarConclusao: () => void;
  salvando: boolean;
  conclusaoDesativada: boolean;
};

export function FichaAtividade({
  atividade,
  onPress,
  onAlterarConclusao,
  salvando,
  conclusaoDesativada,
}: Props) {
  const tipo = visualTipo[atividade.tipo];
  const concluida = atividade.concluida === 1;

  return (
    <View style={[styles.ficha, concluida && styles.fichaConcluida]}>
      <Pressable
        accessibilityRole="button"
        accessibilityHint="Abre a edição da atividade"
        onPress={onPress}
        disabled={salvando}
        style={({ pressed }) => [
          styles.abrir,
          concluida && styles.abrirConcluida,
          pressed && styles.pressionada,
        ]}
      >
        <View style={[styles.icone, { backgroundColor: `${tipo.cor}18` }]}>
          <Feather name={tipo.icone} size={22} color={tipo.cor} aria-hidden />
        </View>
        <View style={styles.dados}>
          <Text style={[styles.titulo, concluida && styles.tituloConcluido]}>
            {atividade.titulo}
          </Text>
          <View style={styles.metadados}>
            <Text style={[styles.tipo, { color: concluida ? cores.secundario : tipo.cor }]}>
              {tipo.rotulo}
            </Text>
            <View style={styles.prazo}>
              <Feather name="calendar" size={13} color={cores.roxo} aria-hidden />
              <Text style={styles.data}>
                {formatarPrazoResumido(atividade.data, atividade.horario)}
              </Text>
            </View>
          </View>
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
  ficha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
    backgroundColor: cores.branco,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  fichaConcluida: { backgroundColor: cores.fundo },
  abrir: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 4,
    borderRadius: 15,
  },
  abrirConcluida: { opacity: 0.6 },
  pressionada: { backgroundColor: cores.fundoAviso },
  icone: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dados: { flex: 1, gap: 5 },
  titulo: { color: cores.texto, fontSize: 17, fontWeight: '700' },
  tituloConcluido: { color: cores.secundario, textDecorationLine: 'line-through' },
  metadados: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  tipo: { fontSize: 13, fontWeight: '600' },
  prazo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: cores.fundoAviso,
  },
  data: { flexShrink: 1, color: cores.roxo, fontSize: 12, fontVariant: ['tabular-nums'] },
});
