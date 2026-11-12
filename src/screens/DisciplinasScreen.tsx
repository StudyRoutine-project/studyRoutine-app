import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Botao } from '../components/Botao';
import { CampoTexto } from '../components/CampoTexto';
import { EstadoVazio } from '../components/EstadoVazio';
import { MensagemErro } from '../components/MensagemErro';
import { FichaDisciplina } from '../components/disciplinas/FichaDisciplina';
import { LayoutDisciplinas } from '../components/disciplinas/LayoutDisciplinas';
import { listarDisciplinas } from '../database/disciplinas';
import { cores } from '../theme/cores';
import { normalizarTexto } from '../utils/normalizarTexto';

import type { Disciplina } from '../database/disciplinas';

type Props = {
  usuarioId: string;
  novaDisciplina: () => void;
  abrirDisciplina: (disciplinaId: string) => void;
  voltar?: () => void;
};

type EstadoLista = 'carregando' | 'erro' | Disciplina[];

export function DisciplinasScreen({ usuarioId, novaDisciplina, abrirDisciplina, voltar }: Props) {
  const [disciplinas, setDisciplinas] = useState<EstadoLista>('carregando');
  const [tentativa, setTentativa] = useState(0);
  const [busca, setBusca] = useState('');

  useFocusEffect(
    useCallback(() => {
      let ativa = true;
      setDisciplinas('carregando');
      void listarDisciplinas(usuarioId).then(
        (lista) => {
          if (ativa) setDisciplinas(lista);
        },
        () => {
          if (ativa) setDisciplinas('erro');
        },
      );
      return () => {
        ativa = false;
      };
    }, [tentativa, usuarioId]),
  );

  const termo = normalizarTexto(busca);
  const lista = Array.isArray(disciplinas)
    ? disciplinas.filter((disciplina) => normalizarTexto(disciplina.nome).includes(termo))
    : [];

  function abrirFormulario() {
    setBusca('');
    novaDisciplina();
  }

  return (
    <LayoutDisciplinas
      titulo="Disciplinas"
      subtitulo="Organize suas matérias e atividades."
      voltar={voltar}
    >
      {disciplinas === 'carregando' ? (
        <View style={styles.centro}>
          <ActivityIndicator color={cores.roxo} accessibilityLabel="Carregando disciplinas" />
        </View>
      ) : disciplinas === 'erro' ? (
        <View style={styles.centro}>
          <MensagemErro mensagem="Não foi possível carregar as disciplinas." />
          <Botao texto="Tentar de novo" onPress={() => setTentativa(tentativa + 1)} />
        </View>
      ) : (
        <>
          <View style={styles.acoes}>
            {disciplinas.length > 0 && (
              <CampoTexto
                accessibilityLabel="Buscar disciplina"
                icone="search"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setBusca}
                placeholder="Buscar disciplina"
                returnKeyType="search"
                value={busca}
                acao={
                  busca !== '' && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Limpar busca"
                      onPress={() => setBusca('')}
                      style={styles.limpar}
                    >
                      <Feather aria-hidden name="x" size={19} color={cores.secundario} />
                    </Pressable>
                  )
                }
              />
            )}
            <Botao texto="Nova disciplina" icone="plus-circle" onPress={abrirFormulario} />
          </View>
          <FlatList
            data={lista}
            keyExtractor={(disciplina) => disciplina.id}
            contentContainerStyle={styles.lista}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <EstadoVazio
                mensagem={
                  disciplinas.length === 0
                    ? 'Nenhuma disciplina cadastrada'
                    : 'Nenhuma disciplina encontrada'
                }
              />
            }
            renderItem={({ item }) => (
              <FichaDisciplina
                nome={item.nome}
                descricao={item.descricao}
                cor={item.cor}
                onPress={() => abrirDisciplina(item.id)}
              />
            )}
          />
        </>
      )}
    </LayoutDisciplinas>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  lista: {
    gap: 12,
    paddingTop: 14,
    paddingBottom: 24,
  },
  acoes: { gap: 12 },
  limpar: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
