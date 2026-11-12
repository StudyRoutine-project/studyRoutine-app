import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Botao } from '../components/Botao';
import { EstadoVazio } from '../components/EstadoVazio';
import { MensagemErro } from '../components/MensagemErro';
import { AcaoExcluirDisciplina } from '../components/disciplinas/AcaoExcluirDisciplina';
import { FormularioDisciplina } from '../components/disciplinas/FormularioDisciplina';
import { LayoutInterno } from '../components/LayoutInterno';
import { buscarDisciplina, editarDisciplina, excluirDisciplina } from '../database/disciplinas';
import { cores } from '../theme/cores';

import type { Disciplina } from '../database/disciplinas';

type Props = {
  usuarioId: string;
  disciplinaId: string;
  voltar: () => void;
  concluir: () => void;
  concluirExclusao: () => void;
};

export function EditarDisciplinaScreen({
  usuarioId,
  disciplinaId,
  voltar,
  concluir,
  concluirExclusao,
}: Props) {
  const [estado, setEstado] = useState<Disciplina | null | 'carregando' | 'erro'>('carregando');
  const [tentativa, setTentativa] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let ativa = true;
      setEstado('carregando');
      void buscarDisciplina(usuarioId, disciplinaId).then(
        (disciplina) => {
          if (ativa) setEstado(disciplina);
        },
        () => {
          if (ativa) setEstado('erro');
        },
      );
      return () => {
        ativa = false;
      };
    }, [disciplinaId, tentativa, usuarioId]),
  );

  if (estado && typeof estado === 'object') {
    return (
      <FormularioDisciplina
        titulo="Editar disciplina"
        valoresIniciais={estado}
        salvarDisciplina={(dados) => editarDisciplina(usuarioId, disciplinaId, dados)}
        voltar={voltar}
        concluir={concluir}
        acaoSecundaria={(salvando) => (
          <AcaoExcluirDisciplina
            nome={estado.nome}
            desativada={salvando}
            excluir={() => excluirDisciplina(usuarioId, disciplinaId)}
            concluir={concluirExclusao}
          />
        )}
      />
    );
  }

  return (
    <LayoutInterno titulo="Editar disciplina" voltar={voltar}>
      <View style={styles.estado}>
        {estado === 'carregando' ? (
          <ActivityIndicator color={cores.roxo} accessibilityLabel="Carregando disciplina" />
        ) : estado === 'erro' ? (
          <>
            <MensagemErro mensagem="Não foi possível carregar a disciplina." />
            <Botao texto="Tentar de novo" onPress={() => setTentativa((atual) => atual + 1)} />
          </>
        ) : (
          <EstadoVazio mensagem="Disciplina indisponível" />
        )}
      </View>
    </LayoutInterno>
  );
}

const styles = StyleSheet.create({
  estado: { gap: 16, paddingVertical: 16 },
});
