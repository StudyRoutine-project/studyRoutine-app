import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { EstadoVazio } from '../components/EstadoVazio';
import { AcaoExcluirRegistro } from '../components/AcaoExcluirRegistro';
import { FormularioDisciplina } from '../components/disciplinas/FormularioDisciplina';
import { EstadoErro } from '../components/EstadoErro';
import { LayoutInterno } from '../components/LayoutInterno';
import { buscarDisciplina, editarDisciplina, excluirDisciplina } from '../database/disciplinas';
import { atualizarLembretes } from '../services/lembretes';
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
        salvarDisciplina={async (dados) => {
          await editarDisciplina(usuarioId, disciplinaId, dados);
          if (dados.nome.trim() !== estado.nome) atualizarLembretes(usuarioId);
        }}
        voltar={voltar}
        concluir={concluir}
        acaoSecundaria={(salvando) => (
          <AcaoExcluirRegistro
            entidade="disciplina"
            nome={estado.nome}
            desativada={salvando}
            excluir={async () => {
              await excluirDisciplina(usuarioId, disciplinaId);
              atualizarLembretes(usuarioId);
            }}
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
          <EstadoErro
            mensagem="Não foi possível carregar a disciplina."
            tentarDeNovo={() => setTentativa((atual) => atual + 1)}
          />
        ) : (
          <EstadoVazio ilustracao="busca" titulo="Disciplina indisponível" />
        )}
      </View>
    </LayoutInterno>
  );
}

const styles = StyleSheet.create({
  estado: { gap: 16, paddingVertical: 16 },
});
