import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { MensagemErro } from '../components/MensagemErro';
import { BotaoConta } from '../components/conta/BotaoConta';
import { LayoutDisciplinas } from '../components/disciplinas/LayoutDisciplinas';
import { listarDisciplinas } from '../database/disciplinas';
import { cores } from '../theme/cores';

import type { Disciplina } from '../database/disciplinas';

type Props = {
  usuarioId: string;
  novaDisciplina: () => void;
  voltar: () => void;
};

type EstadoLista = 'carregando' | 'erro' | Disciplina[];

export function DisciplinasScreen({ usuarioId, novaDisciplina, voltar }: Props) {
  const [disciplinas, setDisciplinas] = useState<EstadoLista>('carregando');
  const [tentativa, setTentativa] = useState(0);

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

  return (
    <LayoutDisciplinas titulo="Disciplinas" voltar={voltar}>
      {disciplinas === 'carregando' ? (
        <View style={styles.centro}>
          <ActivityIndicator color={cores.roxo} accessibilityLabel="Carregando disciplinas" />
        </View>
      ) : disciplinas === 'erro' ? (
        <View style={styles.centro}>
          <MensagemErro mensagem="Não foi possível carregar as disciplinas." />
          <BotaoConta texto="Tentar de novo" onPress={() => setTentativa(tentativa + 1)} />
        </View>
      ) : (
        <>
          <FlatList
            data={disciplinas}
            keyExtractor={(disciplina) => disciplina.id}
            contentContainerStyle={styles.lista}
            ListEmptyComponent={
              <View style={styles.vazio}>
                <View style={styles.iconeVazio}>
                  <Feather
                    accessible={false}
                    aria-hidden
                    name="book-open"
                    size={28}
                    color={cores.roxo}
                  />
                </View>
                <Text style={styles.nome}>Cadastre sua primeira disciplina</Text>
                <Text style={styles.descricao}>Escolha uma cor para encontrá-la na lista.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.ficha}>
                <View style={[styles.lombada, { backgroundColor: item.cor }]} />
                <View style={styles.dados}>
                  <Text style={styles.nome}>{item.nome}</Text>
                  {item.descricao ? (
                    <Text style={styles.descricao} numberOfLines={2}>
                      {item.descricao}
                    </Text>
                  ) : null}
                </View>
              </View>
            )}
          />
          <View style={styles.rodape}>
            <BotaoConta texto="Nova disciplina" onPress={novaDisciplina} />
          </View>
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
    paddingVertical: 8,
  },
  vazio: {
    alignItems: 'flex-start',
    backgroundColor: cores.fundoAviso,
    borderRadius: 20,
    gap: 8,
    padding: 22,
  },
  iconeVazio: {
    backgroundColor: cores.branco,
    borderRadius: 15,
    padding: 12,
    marginBottom: 6,
  },
  ficha: {
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: cores.branco,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 16,
  },
  lombada: {
    width: 7,
  },
  dados: {
    flex: 1,
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  nome: {
    color: cores.texto,
    fontSize: 18,
    fontWeight: '700',
  },
  descricao: {
    color: cores.secundario,
    fontSize: 14,
    lineHeight: 21,
  },
  rodape: {
    paddingTop: 12,
    paddingBottom: 16,
  },
});
