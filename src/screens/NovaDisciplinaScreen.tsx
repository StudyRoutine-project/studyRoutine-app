import { FormularioDisciplina } from '../components/disciplinas/FormularioDisciplina';
import { cadastrarDisciplina } from '../database/disciplinas';

type Props = {
  usuarioId: string;
  voltar: () => void;
  concluir: () => void;
};

export function NovaDisciplinaScreen({ usuarioId, voltar, concluir }: Props) {
  return (
    <FormularioDisciplina
      titulo="Nova disciplina"
      subtitulo="Adicione uma disciplina para organizar seus estudos."
      salvarDisciplina={async (dados) => {
        await cadastrarDisciplina(usuarioId, dados);
      }}
      voltar={voltar}
      concluir={concluir}
    />
  );
}
