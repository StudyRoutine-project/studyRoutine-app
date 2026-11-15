import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { tiposAtividade } from '../database/atividades';
import { marcarConclusao, useConclusaoAtividade } from './useConclusaoAtividade';
import { useDadosEstudos } from './useDadosEstudos';

import type { PreferenciasAgenda } from '../components/agenda/FiltrosAgenda';

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

export function useDadosAgenda(usuarioId: string, primeiraCargaConcluida?: boolean) {
  const { dados, erro, aguardandoSincronizacao, recarregar, atualizarDados } =
    useDadosEstudos(usuarioId, primeiraCargaConcluida);
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

  const conclusao = useConclusaoAtividade(usuarioId, (id, concluida) => {
    atualizarDados((atual) => ({
      ...atual,
      atividades: marcarConclusao(atual.atividades, id, concluida),
    }));
  });

  function alterarFiltros(valor: PreferenciasAgenda) {
    setFiltros(valor);
    void AsyncStorage.setItem(chaveFiltros, JSON.stringify(valor)).catch(() => {});
  }

  return {
    dados,
    erro,
    aguardandoSincronizacao,
    recarregar,
    filtros,
    alterarFiltros,
    conclusao,
  };
}
