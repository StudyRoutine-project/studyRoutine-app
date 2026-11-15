import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

import { listarAtividades, tiposAtividade } from '../database/atividades';
import { listarDisciplinas } from '../database/disciplinas';
import { observarAtividadesDosLembretes } from '../services/lembretes';
import { marcarConclusao, useConclusaoAtividade } from './useConclusaoAtividade';

import type { PreferenciasAgenda } from '../components/agenda/FiltrosAgenda';
import type { Atividade } from '../database/atividades';
import type { Disciplina } from '../database/disciplinas';

type Dados = { atividades: Atividade[]; disciplinas: Disciplina[] };
const semFiltros: PreferenciasAgenda = { disciplinaId: null, tipo: null };

function lerFiltros(salvo: string | null): PreferenciasAgenda {
  if (!salvo) return semFiltros;
  try {
    const valor: Partial<PreferenciasAgenda> | null = JSON.parse(salvo);
    return {
      disciplinaId: typeof valor?.disciplinaId === 'string' ? valor.disciplinaId : null,
      tipo: valor?.tipo && tiposAtividade.includes(valor.tipo) ? valor.tipo : null,
    };
  } catch {
    return semFiltros;
  }
}

export function useDadosAgenda(usuarioId: string) {
  const [dados, setDados] = useState<Dados>();
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [filtros, setFiltros] = useState<PreferenciasAgenda>();
  const chaveFiltros = '@studyroutine/agenda/' + usuarioId;

  useEffect(() => {
    let ativo = true;
    void AsyncStorage.getItem(chaveFiltros)
      .then(lerFiltros, () => semFiltros)
      .then((valor) => {
        if (ativo) setFiltros(valor);
      });
    return () => {
      ativo = false;
    };
  }, [chaveFiltros]);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      let versao = 0;

      function carregar() {
        const leitura = ++versao;
        setErro(false);
        void Promise.all([listarAtividades(usuarioId), listarDisciplinas(usuarioId)]).then(
          ([atividades, disciplinas]) => {
            if (ativo && leitura === versao) setDados({ atividades, disciplinas });
          },
          () => {
            if (ativo && leitura === versao) setErro(true);
          },
        );
      }

      carregar();
      const pararObservacao = observarAtividadesDosLembretes((conta) => {
        if (conta === usuarioId) carregar();
      });

      return () => {
        ativo = false;
        pararObservacao();
      };
    }, [usuarioId, tentativa]),
  );

  const conclusao = useConclusaoAtividade(usuarioId, (id, concluida) => {
    setDados((atual) =>
      atual ? { ...atual, atividades: marcarConclusao(atual.atividades, id, concluida) } : atual,
    );
  });

  function alterarFiltros(valor: PreferenciasAgenda) {
    setFiltros(valor);
    void AsyncStorage.setItem(chaveFiltros, JSON.stringify(valor)).catch(() => {});
  }

  return {
    dados,
    erro,
    recarregar: () => setTentativa((n) => n + 1),
    filtros,
    alterarFiltros,
    conclusao,
  };
}
