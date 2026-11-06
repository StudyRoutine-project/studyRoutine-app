export type Entidade = 'disciplinas' | 'atividades';

type Registro = {
  id: string;
  usuario_id: string;
  criada_em: string;
  atualizada_em: string;
  excluida: boolean;
};

export type Disciplina = Registro & {
  nome: string;
  descricao: string | null;
  cor: string;
};

export type Atividade = Registro & {
  disciplina_id: string;
  titulo: string;
  tipo: 'tarefa' | 'trabalho' | 'prova' | 'estudo';
  data: string;
  horario: string | null;
  descricao: string | null;
  concluida: boolean;
};

export type Registros = {
  disciplinas: Disciplina;
  atividades: Atividade;
};

export type Operacao<E extends Entidade = Entidade> = {
  p_operacao_id: string;
  p_entidade: E;
  p_registro_id: string;
  p_dados: Record<string, unknown>;
};

export type RespostaSincronizacao<E extends Entidade> = {
  operacao_id: string;
  entidade: E;
  registro: Registros[E];
};

export type Sessao = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    user_metadata: { nome: string };
  };
};

export type ErroApi = {
  code: string;
  message?: string;
  msg?: string;
};

export type DadosConta = {
  disciplinas: Disciplina[];
  atividades: Atividade[];
};
