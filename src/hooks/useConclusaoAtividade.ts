import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutAnimation } from 'react-native';

import { definirConclusaoAtividade } from '../database/atividades';
import { atualizarLembretes } from '../services/lembretes';

import type { Atividade } from '../database/atividades';

type Conclusao = Atividade['concluida'];

const tempoConfirmacao = 650;

export function marcarConclusao(atividades: Atividade[], id: string, concluida: Conclusao) {
  return atividades.map((atividade) =>
    atividade.id === id ? { ...atividade, concluida } : atividade,
  );
}

function alterarMapa(mapa: ReadonlyMap<string, Conclusao>, id: string, valor?: Conclusao) {
  const proximo = new Map(mapa);
  if (valor === undefined) proximo.delete(id);
  else proximo.set(id, valor);
  return proximo;
}

export function useConclusaoAtividade(
  usuarioId: string,
  atualizar: (id: string, concluida: Conclusao) => void,
) {
  const [marcacoes, setMarcacoes] = useState<ReadonlyMap<string, Conclusao>>(new Map());
  const [gravando, setGravando] = useState<ReadonlySet<string>>(new Set());
  const [erroConclusao, setErroConclusao] = useState<string>();
  const marcacoesAtuais = useRef(marcacoes);
  const gravandoAtual = useRef(new Set<string>());
  const confirmacoes = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const atualizarAtual = useRef(atualizar);

  useEffect(() => {
    atualizarAtual.current = atualizar;
  });

  useEffect(() => {
    const pendentes = confirmacoes.current;
    return () => pendentes.forEach(clearTimeout);
  }, []);

  function marcar(id: string, valor?: Conclusao) {
    marcacoesAtuais.current = alterarMapa(marcacoesAtuais.current, id, valor);
    setMarcacoes(marcacoesAtuais.current);
  }

  function definirGravando(id: string, ativo: boolean) {
    if (ativo) gravandoAtual.current.add(id);
    else gravandoAtual.current.delete(id);
    setGravando(new Set(gravandoAtual.current));
  }

  function confirmar(id: string, concluida: Conclusao, atraso: number) {
    confirmacoes.current.set(
      id,
      setTimeout(
        () => {
          confirmacoes.current.delete(id);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          atualizarAtual.current(id, concluida);
          marcar(id);
        },
        Math.max(atraso, 0),
      ),
    );
  }

  async function alterarConclusao(atividade: Atividade) {
    const { id } = atividade;
    if (gravandoAtual.current.has(id)) return;

    const anterior = marcacoesAtuais.current.get(id) ?? atividade.concluida;
    const concluida: Conclusao = anterior === 1 ? 0 : 1;
    const confirmacaoPendente = confirmacoes.current.get(id);
    const inicio = Date.now();

    clearTimeout(confirmacaoPendente);
    confirmacoes.current.delete(id);
    definirGravando(id, true);
    marcar(id, concluida);
    setErroConclusao((atual) => (atual === id ? undefined : atual));

    try {
      await definirConclusaoAtividade(usuarioId, id, concluida === 1);
      atualizarLembretes(usuarioId);
      confirmar(id, concluida, tempoConfirmacao - (Date.now() - inicio));
    } catch {
      setErroConclusao(id);
      if (confirmacaoPendente === undefined) {
        marcar(id);
      } else {
        marcar(id, anterior);
        confirmar(id, anterior, 0);
      }
    } finally {
      definirGravando(id, false);
    }
  }

  const exibir = useCallback(
    (atividade: Atividade): Atividade => {
      const concluida = marcacoes.get(atividade.id);
      if (concluida === undefined || concluida === atividade.concluida) return atividade;
      return { ...atividade, concluida };
    },
    [marcacoes],
  );

  const aplicar = useCallback(
    (atividades: Atividade[]) => (marcacoes.size === 0 ? atividades : atividades.map(exibir)),
    [marcacoes, exibir],
  );

  const estaGravando = useCallback((id: string) => gravando.has(id), [gravando]);

  return { alterarConclusao, erroConclusao, exibir, aplicar, gravando: estaGravando };
}
