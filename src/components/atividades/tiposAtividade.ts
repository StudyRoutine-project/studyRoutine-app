import { BookOpenTextIcon, ExamIcon, FileTextIcon, NotePencilIcon } from 'phosphor-react-native';

import { tiposAtividade } from '../../database/atividades';
import { cores } from '../../theme/cores';

import type { TipoAtividade } from '../../database/atividades';
import type { OpcaoSelecao } from './ListaSelecao';

export const visualTipo = {
  tarefa: { rotulo: 'Tarefa', icone: NotePencilIcon, cor: '#0E7490' },
  trabalho: { rotulo: 'Trabalho', icone: FileTextIcon, cor: '#A6471C' },
  prova: { rotulo: 'Prova', icone: ExamIcon, cor: '#245F9E' },
  estudo: { rotulo: 'Estudo', icone: BookOpenTextIcon, cor: cores.roxo },
} satisfies Record<TipoAtividade, Omit<OpcaoSelecao<TipoAtividade>, 'valor'>>;

export const opcoesTipo = tiposAtividade.map((valor) => ({ valor, ...visualTipo[valor] }));
