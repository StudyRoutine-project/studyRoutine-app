import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { listarAtividades } from '../database/atividades';
import { observarDadosSincronizados } from '../database/dadosSincronizados';
import { listarDisciplinas } from '../database/disciplinas';
import { observarAtividadesDosLembretes } from '../services/lembretes';

import type { Atividade } from '../database/atividades';
import type { Disciplina } from '../database/disciplinas';

type Dados = { disciplinas: Disciplina[]; atividades: Atividade[] };
type Leitura = { dados: Dados; aposPrimeiraCarga: boolean };

export function useDadosEstudos(usuarioId: string, primeiraCargaConcluida = false) {
  const [leitura, setLeitura] = useState<Leitura>();
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      let versao = 0;

      function carregar() {
        const versaoAtual = ++versao;
        setErro(false);
        void Promise.all([listarDisciplinas(usuarioId), listarAtividades(usuarioId)]).then(
          ([disciplinas, atividades]) => {
            if (ativo && versaoAtual === versao) {
              setLeitura({
                dados: { disciplinas, atividades },
                aposPrimeiraCarga: primeiraCargaConcluida,
              });
            }
          },
          () => {
            if (ativo && versaoAtual === versao) setErro(true);
          },
        );
      }

      carregar();
      const pararSincronizacao = observarDadosSincronizados(usuarioId, carregar);
      const pararLembretes = observarAtividadesDosLembretes((conta) => {
        if (conta === usuarioId) carregar();
      });

      return () => {
        ativo = false;
        pararSincronizacao();
        pararLembretes();
      };
    }, [usuarioId, tentativa, primeiraCargaConcluida]),
  );

  function atualizarDados(atualizar: (dados: Dados) => Dados) {
    setLeitura((atual) => atual && { ...atual, dados: atualizar(atual.dados) });
  }

  const leituraVaziaAnterior =
    primeiraCargaConcluida && leitura?.aposPrimeiraCarga === false && leitura.dados.disciplinas.length === 0;
  const dados = leituraVaziaAnterior ? undefined : leitura?.dados;

  return {
    dados,
    erro,
    aguardandoSincronizacao: dados?.disciplinas.length === 0 && !primeiraCargaConcluida,
    recarregar: () => setTentativa((atual) => atual + 1),
    atualizarDados,
  };
}
