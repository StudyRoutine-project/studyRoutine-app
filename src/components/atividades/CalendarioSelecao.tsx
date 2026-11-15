import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { cores } from '../../theme/cores';
import { formatarData } from '../../utils/datas';

const semana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const formatoMes = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

function diaUTC(ano: number, mes: number, dia: number) {
  const data = new Date(0);
  data.setUTCFullYear(ano, mes, dia);
  return data;
}

function dataISO(data: Date) {
  return data.toISOString().slice(0, 10);
}

export function CalendarioSelecao({
  valor,
  selecionar,
}: {
  valor?: string;
  selecionar: (data: string) => void;
}) {
  const [hoje] = useState(() => {
    const agora = new Date();
    return diaUTC(agora.getFullYear(), agora.getMonth(), agora.getDate());
  });
  const [mes, setMes] = useState(() =>
    valor
      ? new Date(`${valor.slice(0, 7)}-01T00:00:00Z`)
      : diaUTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), 1),
  );
  const ano = mes.getUTCFullYear();
  const indiceMes = mes.getUTCMonth();
  const totalDias = diaUTC(ano, indiceMes + 1, 0).getUTCDate();
  const primeiroDia = mes.getUTCDay();
  const hojeISO = dataISO(hoje);
  const mesFormatado = formatoMes.format(mes);
  const dias = Array.from(
    { length: primeiroDia + totalDias },
    (_, indice) => indice - primeiroDia + 1,
  );

  return (
    <ScrollView style={styles.rolagem} contentContainerStyle={styles.calendario}>
      <View style={styles.cabecalho}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mês anterior"
          disabled={ano === 1 && indiceMes === 0}
          onPress={() => setMes(diaUTC(ano, indiceMes - 1, 1))}
          style={styles.seta}
        >
          <Feather name="chevron-left" size={22} color={cores.roxo} aria-hidden />
        </Pressable>
        <Text accessibilityLiveRegion="polite" style={styles.mes}>
          {mesFormatado[0].toUpperCase() + mesFormatado.slice(1)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Próximo mês"
          disabled={ano === 9999 && indiceMes === 11}
          onPress={() => setMes(diaUTC(ano, indiceMes + 1, 1))}
          style={styles.seta}
        >
          <Feather name="chevron-right" size={22} color={cores.roxo} aria-hidden />
        </Pressable>
      </View>
      <View style={styles.grade}>
        {semana.map((dia, indice) => (
          <View key={indice} style={styles.celula}>
            <Text aria-hidden style={styles.semana}>
              {dia}
            </Text>
          </View>
        ))}
        {dias.map((dia) => {
          if (dia < 1) return <View key={dia} style={styles.celula} />;
          const data = dataISO(diaUTC(ano, indiceMes, dia));
          const selecionado = data === valor;
          return (
            <View key={dia} style={styles.celula}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={formatarData(data)}
                accessibilityState={{ selected: selecionado }}
                onPress={() => selecionar(data)}
                style={[
                  styles.dia,
                  data === hojeISO && styles.hoje,
                  selecionado && styles.selecionado,
                ]}
              >
                <Text style={[styles.numero, selecionado && styles.numeroSelecionado]}>{dia}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => selecionar(hojeISO)}
        style={styles.atalho}
      >
        <Text style={styles.atalhoTexto}>Hoje</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rolagem: { flexGrow: 0, flexShrink: 1 },
  calendario: { gap: 8 },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  seta: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: cores.fundoAviso,
  },
  mes: {
    flex: 1,
    textAlign: 'center',
    color: cores.texto,
    fontSize: 16,
    fontWeight: '700',
  },
  grade: { flexDirection: 'row', flexWrap: 'wrap' },
  celula: { width: '14.28%', height: 44, alignItems: 'center', justifyContent: 'center' },
  semana: { color: cores.secundario, fontSize: 13, fontWeight: '600' },
  dia: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoje: { backgroundColor: cores.fundoAviso },
  selecionado: { backgroundColor: cores.roxo },
  numero: { color: cores.texto, fontSize: 15, fontWeight: '600' },
  numeroSelecionado: { color: cores.branco },
  atalho: { minHeight: 44, alignSelf: 'center', paddingHorizontal: 18, justifyContent: 'center' },
  atalhoTexto: { color: cores.roxo, fontWeight: '700' },
});
