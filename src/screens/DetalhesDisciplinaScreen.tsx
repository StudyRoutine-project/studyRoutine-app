import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Botao } from '../components/Botao';
import { EstadoVazio } from '../components/EstadoVazio';
import { LayoutInterno, TituloTela } from '../components/LayoutInterno';
import { MensagemErro } from '../components/MensagemErro';
import { visualTipo } from '../components/atividades/tiposAtividade';
import { listarAtividadesDisciplina } from '../database/atividades';
import { buscarDisciplina } from '../database/disciplinas';
import { cores } from '../theme/cores';
import { formatarData } from '../utils/datas';

import type { Atividade } from '../database/atividades';
import type { Disciplina } from '../database/disciplinas';

type Props = {
  usuarioId: string;
  disciplinaId: string;
  voltar: () => void;
  editarDisciplina: () => void;
  novaAtividade: () => void;
};

type Estado = 'carregando' | 'erro' | null | { disciplina: Disciplina; atividades: Atividade[] };

export function DetalhesDisciplinaScreen({
  usuarioId,
  disciplinaId,
  voltar,
  editarDisciplina,
  novaAtividade,
}: Props) {
  const [estado, setEstado] = useState<Estado>('carregando');
  const [tentativa, setTentativa] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      setEstado('carregando');
      void Promise.all([
        buscarDisciplina(usuarioId, disciplinaId),
        listarAtividadesDisciplina(usuarioId, disciplinaId),
      ]).then(
        ([disciplina, atividades]) => {
          if (ativo) setEstado(disciplina ? { disciplina, atividades } : null);
        },
        () => {
          if (ativo) setEstado('erro');
        },
      );
      return () => {
        ativo = false;
      };
    }, [usuarioId, disciplinaId, tentativa]),
  );

  const lista = estado && typeof estado === 'object' ? estado : null;
  const temAtividades = Boolean(lista?.atividades.length);
  return (
    <LayoutInterno titulo={lista ? undefined : 'Disciplina'} voltar={voltar}>
      {lista ? (
        <FlatList
          data={lista.atividades}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          ListHeaderComponent={
            <>
              <TituloTela
                titulo={lista.disciplina.nome}
                subtitulo={lista.disciplina.descricao ?? undefined}
                acao={
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Editar disciplina"
                    onPress={editarDisciplina}
                    style={({ pressed }) => [styles.editar, pressed && styles.editarPressionado]}
                  >
                    <Feather name="edit-2" size={16} color={cores.roxo} aria-hidden />
                    <Text style={styles.editarTexto}>Editar</Text>
                  </Pressable>
                }
              />
              <View style={styles.cabecalhoAtividades}>
                <Text accessibilityRole="header" style={styles.subtitulo}>
                  Atividades
                </Text>
                {temAtividades && (
                  <Botao texto="Nova atividade" icone="plus" onPress={novaAtividade} compacto />
                )}
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.vazio}>
              <EstadoVazio mensagem="Nenhuma atividade nesta disciplina" />
              <View style={styles.acaoVazio}>
                <Botao texto="Nova atividade" icone="plus" onPress={novaAtividade} />
              </View>
            </View>
          }
          renderItem={({ item }) => <FichaAtividade atividade={item} />}
        />
      ) : estado === 'carregando' ? (
        <ActivityIndicator color={cores.roxo} accessibilityLabel="Carregando disciplina" />
      ) : estado === 'erro' ? (
        <View style={styles.erro}>
          <MensagemErro mensagem="Não foi possível carregar a disciplina." />
          <Botao texto="Tentar de novo" onPress={() => setTentativa((atual) => atual + 1)} />
        </View>
      ) : (
        <EstadoVazio mensagem="Disciplina indisponível" />
      )}
    </LayoutInterno>
  );
}

function FichaAtividade({ atividade }: { atividade: Atividade }) {
  const tipo = visualTipo[atividade.tipo];
  const prazo = formatarData(atividade.data);
  return (
    <View style={styles.ficha}>
      <View style={[styles.icone, { backgroundColor: `${tipo.cor}18` }]}>
        <Feather name={tipo.icone} size={22} color={tipo.cor} aria-hidden />
      </View>
      <View style={styles.dados}>
        <Text style={styles.titulo}>{atividade.titulo}</Text>
        <View style={styles.metadados}>
          <Text style={[styles.tipo, { color: tipo.cor }]}>{tipo.rotulo}</Text>
          <View style={styles.prazo}>
            <Feather name="calendar" size={14} color={cores.secundario} aria-hidden />
            <Text style={styles.data}>
              {prazo}
              {atividade.horario ? ` às ${atividade.horario.slice(0, 5)}` : ''}
            </Text>
          </View>
        </View>
        {atividade.descricao && <Text style={styles.resumoAtividade}>{atividade.descricao}</Text>}
        {atividade.concluida === 1 && <Text style={styles.concluida}>Concluída</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  editar: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
    minHeight: 44,
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  editarPressionado: { backgroundColor: cores.fundoAviso },
  editarTexto: { flexShrink: 1, color: cores.roxo, fontSize: 14, fontWeight: '600' },
  cabecalhoAtividades: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: cores.borda,
  },
  subtitulo: { flexShrink: 1, color: cores.texto, fontSize: 21, fontWeight: '700' },
  vazio: { gap: 16, paddingBottom: 8 },
  acaoVazio: { alignSelf: 'center', width: '100%', maxWidth: 280 },
  lista: { gap: 12, paddingBottom: 20 },
  erro: { gap: 12 },
  ficha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    backgroundColor: cores.branco,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  icone: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dados: { flex: 1, gap: 5 },
  titulo: { color: cores.texto, fontSize: 17, fontWeight: '700' },
  metadados: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  tipo: { fontSize: 13, fontWeight: '600' },
  prazo: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, gap: 5 },
  data: { flexShrink: 1, color: cores.secundario, fontSize: 13, fontVariant: ['tabular-nums'] },
  resumoAtividade: { color: cores.secundario, fontSize: 14, lineHeight: 20 },
  concluida: { color: cores.secundario, fontSize: 13, fontWeight: '600' },
});
