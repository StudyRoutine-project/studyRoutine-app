import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AcaoExcluirRegistro } from '../components/AcaoExcluirRegistro';
import { Botao } from '../components/Botao';
import { EstadoVazio } from '../components/EstadoVazio';
import { LayoutInterno } from '../components/LayoutInterno';
import { MensagemErro } from '../components/MensagemErro';
import { FormularioAtividade } from '../components/atividades/FormularioAtividade';
import { buscarAtividade, editarAtividade, excluirAtividade } from '../database/atividades';
import { atualizarLembretes, observarAtividadesDosLembretes } from '../services/lembretes';
import { cores } from '../theme/cores';

import type { Atividade } from '../database/atividades';

type Props = {
  usuarioId: string;
  atividadeId: string;
  voltar: () => void;
  concluir: () => void;
};

export function EditarAtividadeScreen({
  usuarioId,
  atividadeId,
  voltar,
  concluir,
}: Props) {
  const [estado, setEstado] = useState<Atividade | 'carregando' | 'erro' | null>('carregando');
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let ativo = true;
    setEstado('carregando');
    void buscarAtividade(usuarioId, atividadeId).then(
      (atividade) => {
        if (ativo) setEstado(atividade);
      },
      () => {
        if (ativo) setEstado('erro');
      },
    );
    const pararObservacao = observarAtividadesDosLembretes((conta, atividade) => {
      if (conta !== usuarioId || atividade.id !== atividadeId) return;
      setEstado((atual) => (atual && typeof atual === 'object' ? { ...atual, ...atividade } : atual));
    });
    return () => {
      ativo = false;
      pararObservacao();
    };
  }, [usuarioId, atividadeId, tentativa]);

  if (!estado || typeof estado === 'string') {
    return (
      <LayoutInterno titulo="Editar atividade" voltar={voltar}>
        {estado === 'carregando' ? (
          <ActivityIndicator color={cores.roxo} accessibilityLabel="Carregando atividade" />
        ) : estado === 'erro' ? (
          <View style={styles.erro}>
            <MensagemErro mensagem="Não foi possível carregar a atividade." />
            <Botao texto="Tentar de novo" onPress={() => setTentativa((atual) => atual + 1)} />
          </View>
        ) : (
          <EstadoVazio mensagem="Atividade indisponível" />
        )}
      </LayoutInterno>
    );
  }

  return (
    <FormularioAtividade
      usuarioId={usuarioId}
      tituloTela="Editar atividade"
      valoresIniciais={estado}
      conclusaoInicial={estado.concluida === 1}
      salvarAtividade={async (dados, concluida) => {
        await editarAtividade(usuarioId, atividadeId, dados, concluida);
        atualizarLembretes(usuarioId);
      }}
      voltar={voltar}
      concluir={concluir}
      acaoSecundaria={(salvando) => (
        <AcaoExcluirRegistro
          entidade="atividade"
          nome={estado.titulo}
          desativada={salvando}
          excluir={async () => {
            await excluirAtividade(usuarioId, atividadeId);
            atualizarLembretes(usuarioId);
          }}
          concluir={concluir}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({ erro: { gap: 12 } });
