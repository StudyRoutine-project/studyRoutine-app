import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { cores } from '../../theme/cores';
import { Botao } from '../Botao';

import type { ComponentRef } from 'react';

const alturaItem = 36;
const horas = Array.from({ length: 24 }, (_, indice) => String(indice).padStart(2, '0'));
const minutos = Array.from({ length: 60 }, (_, indice) => String(indice).padStart(2, '0'));

function Coluna({
  rotulo,
  valores,
  valor,
  selecionar,
}: {
  rotulo: string;
  valores: string[];
  valor: string;
  selecionar: (valor: string) => void;
}) {
  const rolagem = useRef<ComponentRef<typeof ScrollView>>(null);

  return (
    <ScrollView
      ref={rolagem}
      accessibilityRole="radiogroup"
      accessibilityLabel={rotulo}
      style={styles.coluna}
      contentContainerStyle={styles.itens}
      showsVerticalScrollIndicator={false}
      onLayout={() =>
        rolagem.current?.scrollTo({
          y: Math.max(valores.indexOf(valor) - 1, 0) * alturaItem,
          animated: false,
        })
      }
    >
      {valores.map((item) => {
        const selecionado = item === valor;
        return (
          <Pressable
            key={item}
            accessibilityRole="radio"
            aria-checked={selecionado}
            onPress={() => selecionar(item)}
            style={[styles.item, selecionado && styles.itemSelecionado]}
          >
            <Text style={[styles.textoItem, selecionado && styles.textoSelecionado]}>{item}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function HorarioSelecao({
  valor,
  selecionar,
}: {
  valor?: string;
  selecionar: (horario: string) => void;
}) {
  const [inicialHora, inicialMinuto] = (valor || '23:59').split(':');
  const [hora, setHora] = useState(inicialHora);
  const [minuto, setMinuto] = useState(inicialMinuto);

  return (
    <View style={styles.seletor}>
      <View style={styles.colunas}>
        <Coluna rotulo="Hora" valores={horas} valor={hora} selecionar={setHora} />
        <Text aria-hidden style={styles.separador}>
          :
        </Text>
        <Coluna rotulo="Minuto" valores={minutos} valor={minuto} selecionar={setMinuto} />
      </View>

      <Botao texto="Confirmar" icone="check" onPress={() => selecionar(`${hora}:${minuto}`)} />
    </View>
  );
}

const styles = StyleSheet.create({
  seletor: { gap: 12 },
  colunas: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  coluna: {
    flex: 1,
    height: alturaItem * 3 + 8,
    borderRadius: 12,
    backgroundColor: cores.fundo,
  },
  itens: { padding: 4 },
  item: {
    height: alturaItem,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  itemSelecionado: { backgroundColor: cores.roxo },
  textoItem: {
    color: cores.texto,
    fontSize: 16,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  textoSelecionado: { color: cores.branco, fontWeight: '700' },
  separador: { color: cores.secundario, fontSize: 20, fontWeight: '700' },
});
