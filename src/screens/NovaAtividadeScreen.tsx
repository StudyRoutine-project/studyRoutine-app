import { FormularioAtividade } from '../components/atividades/FormularioAtividade';
import { cadastrarAtividade } from '../database/atividades';
import { atualizarLembretes } from '../services/lembretes';

type Props = {
  usuarioId: string;
  disciplinaId?: string;
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
      salvarAtividade={async (dados) => {
        await cadastrarAtividade(usuarioId, dados);
        atualizarLembretes(usuarioId);
      }}
      voltar={voltar}
      concluir={concluir}
    />
  );
}
