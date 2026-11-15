import { CaretLeftIcon, CaretRightIcon } from 'phosphor-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores } from '../../theme/cores';
import { superficie } from '../../theme/superficie';
import { formatarDiaAgenda, formatarMesAgenda, semanasDoMes } from '../../utils/calendario';

import type { MarcadorAgenda } from '../../utils/calendario';

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const situacoes = [
  { valor: 'atrasada', rotulo: 'Em atraso', cor: cores.erro },
  { valor: 'pendente', rotulo: 'Pendente', cor: cores.roxo },
  { valor: 'concluida', rotulo: 'Concluída', cor: cores.sucesso },
] as const;

type Props = {
  selecionado: string;
  hoje: string;
  marcadores: ReadonlyMap<string, ReadonlySet<MarcadorAgenda>>;
  selecionar: (dia: string) => void;
  mudarMes: (direcao: -1 | 1) => void;
};

export function CalendarioAgenda({
  selecionado,
  hoje,
  marcadores,
  selecionar,
  mudarMes,
}: Props) {
  const mes = selecionado.slice(0, 7);
  const semanas = useMemo(() => semanasDoMes(mes), [mes]);

  return (
    <View style={[superficie, styles.calendario]}>
      <View style={styles.cabecalho}>
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.mes}>
          {formatarMesAgenda(mes)}
        </Text>
        <View style={styles.navegacao}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mês anterior"
            disabled={mes === '0001-01'}
            onPress={() => mudarMes(-1)}
            style={({ pressed }) => [styles.seta, pressed && styles.pressionado]}
          >
            <CaretLeftIcon size={18} color={cores.roxo} aria-hidden />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Próximo mês"
            disabled={mes === '9999-12'}
            onPress={() => mudarMes(1)}
            style={({ pressed }) => [styles.seta, pressed && styles.pressionado]}
          >
            <CaretRightIcon size={18} color={cores.roxo} aria-hidden />
          </Pressable>
        </View>
      </View>

      <View style={styles.semana}>
        {diasSemana.map((dia) => (
          <Text key={dia} maxFontSizeMultiplier={1.3} style={styles.diaSemana} aria-hidden>
            {dia}
          </Text>
        ))}
      </View>

      {semanas.map((semana, indice) => (
        <View key={indice} style={styles.semana}>
          {semana.map((dia, coluna) => {
            if (!dia) return <View key={coluna} style={styles.celula} />;
            const ativo = dia.data === selecionado;
            const atual = dia.data === hoje;
            const estados = situacoes.filter(({ valor }) => marcadores.get(dia.data)?.has(valor));
            const label = [
              formatarDiaAgenda(dia.data),
              atual && 'hoje',
              ...estados.map(({ rotulo }) => rotulo),
            ].filter(Boolean).join(', ');

            return (
              <Pressable
                key={coluna}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected: ativo }}
                onPress={() => selecionar(dia.data)}
                style={styles.celula}
              >
                {({ pressed }) => (
                  <>
                    <View
                      style={[
                        styles.disco,
                        atual && styles.hoje,
                        ativo && styles.selecionado,
                        pressed && styles.pressionado,
                      ]}
                    >
                      <Text
                        style={[
                          styles.numero,
                          atual && styles.numeroHoje,
                          ativo && styles.numeroAtivo,
                        ]}
                        maxFontSizeMultiplier={1.4}
                      >
                        {dia.dia}
                      </Text>
                    </View>
                    <View style={styles.marcadores} aria-hidden>
                      {estados.map(({ valor, cor }) => (
                        <View key={valor} style={[styles.marcador, { backgroundColor: cor }]} />
                      ))}
                    </View>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}

      <View style={styles.legenda}>
        {situacoes.map(({ valor, rotulo, cor }) => (
          <View key={valor} style={styles.itemLegenda}>
            <View style={[styles.marcador, { backgroundColor: cor }]} aria-hidden />
            <Text style={styles.legendaTexto}>{rotulo}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendario: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 12 },
  cabecalho: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 8,
    marginBottom: 4,
  },
  mes: { flex: 1, color: cores.texto, fontSize: 17, fontWeight: '700', letterSpacing: -0.25 },
  navegacao: { flexDirection: 'row', alignItems: 'center' },
  seta: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  pressionado: { opacity: 0.65 },
  semana: { flexDirection: 'row' },
  diaSemana: {
    flex: 1,
    paddingVertical: 7,
    color: cores.secundario,
    fontSize: 12,
    textAlign: 'center',
  },
  celula: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'center' },
  disco: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoje: { borderWidth: 1, borderColor: cores.roxo, backgroundColor: cores.fundoAviso },
  selecionado: { backgroundColor: cores.roxo },
  numero: { color: cores.texto, fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'] },
  numeroHoje: { color: cores.roxo },
  numeroAtivo: { color: cores.branco },
  marcadores: {
    height: 8,
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  marcador: { width: 7, height: 7, borderRadius: 3.5 },
  legenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 18,
    rowGap: 6,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    marginTop: 8,
    marginHorizontal: 6,
    paddingTop: 12,
  },
  itemLegenda: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  legendaTexto: { color: cores.secundario, fontSize: 12, fontWeight: '500' },
});
