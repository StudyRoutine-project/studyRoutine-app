import { FormularioAtividade } from '../components/atividades/FormularioAtividade';
import { cadastrarAtividade } from '../database/atividades';

type Props = {
  usuarioId: string;
  disciplinaId: string;
  voltar: () => void;
  concluir: (disciplinaId: string) => void;
};

export function NovaAtividadeScreen({ usuarioId, disciplinaId, voltar, concluir }: Props) {
  return (
    <FormularioAtividade
      usuarioId={usuarioId}
      tituloTela="Nova atividade"
      subtitulo="Organize o que você precisa fazer."
      valoresIniciais={{ disciplina_id: disciplinaId }}
      salvarAtividade={(dados) => cadastrarAtividade(usuarioId, dados)}
      voltar={voltar}
      concluir={concluir}
    />
  );
}
