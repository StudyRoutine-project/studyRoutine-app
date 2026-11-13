import { tiposAtividade } from '../../database/atividades';
import { cores } from '../../theme/cores';

import type { TipoAtividade } from '../../database/atividades';
import type { OpcaoSelecao } from './ListaSelecao';

export const visualTipo = {
  tarefa: { rotulo: 'Tarefa', icone: 'check-square', cor: '#207151' },
  trabalho: { rotulo: 'Trabalho', icone: 'file-text', cor: '#A6471C' },
  prova: { rotulo: 'Prova', icone: 'clipboard', cor: '#245F9E' },
  estudo: { rotulo: 'Estudo', icone: 'book-open', cor: cores.roxo },
} satisfies Record<TipoAtividade, Omit<OpcaoSelecao<TipoAtividade>, 'valor'>>;

export const opcoesTipo = tiposAtividade.map((valor) => ({ valor, ...visualTipo[valor] }));
