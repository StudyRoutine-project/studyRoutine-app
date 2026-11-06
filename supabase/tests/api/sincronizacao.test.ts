import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { baixar, entrar, requisitar, sincronizar } from './client.ts';

import type { Entidade, Operacao } from './types.ts';

type Conta = {
  id: string;
  email: string;
  token: string;
};

const senha = 'Estudo!2026-Abc';
const disciplina = { nome: 'Matemática', cor: '#7C5CFF', descricao: 'Primeiro semestre' };

function operacao<E extends Entidade>(
  entidade: E,
  registroId: string,
  dados: Record<string, unknown>,
): Operacao<E> {
  return {
    p_operacao_id: randomUUID(),
    p_entidade: entidade,
    p_registro_id: registroId,
    p_dados: dados,
  };
}

test('sincronização do StudyRoutine', async (t) => {
  const contas: Conta[] = [];

  t.after(async () => {
    for (const conta of contas) {
      await requisitar(`/auth/v1/admin/users/${conta.id}`, { metodo: 'DELETE', admin: true });
    }
  });

  for (const nome of ['Ana', 'Bruno']) {
    const email = `teste-${randomUUID()}@example.com`;
    const cadastro = await requisitar<{ id: string }>('/auth/v1/admin/users', {
      metodo: 'POST',
      dados: { email, password: senha, email_confirm: true, user_metadata: { nome } },
      admin: true,
    });
    const conta: Conta = { id: cadastro.id, email, token: '' };
    contas.push(conta);
    const sessao = await entrar(email, senha);
    conta.token = sessao.access_token;
  }

  const [ana, bruno] = contas;
  const disciplinaId = randomUUID();
  const atividadeId = randomUUID();
  const envioDisciplina = operacao('disciplinas', disciplinaId, disciplina);
  const atividade = {
    disciplina_id: disciplinaId,
    titulo: 'Lista de exercícios',
    tipo: 'tarefa',
    data: '2026-11-17',
    horario: '18:30',
    descricao: 'Capítulo 2',
  };

  await t.test(
    'reenvia a atividade após salvar a disciplina',
    async () => {
      const envio = operacao('atividades', atividadeId, atividade);
      assert.equal((await sincronizar(ana.token, envio, 409)).code, '23503');
      const salva = await sincronizar(ana.token, envioDisciplina);
      assert.equal(salva.registro.usuario_id, ana.id);
      assert.ok(salva.registro.criada_em);
      const salvaAtividade = await sincronizar(ana.token, envio);
      assert.equal(salvaAtividade.registro.disciplina_id, disciplinaId);
      assert.equal(salvaAtividade.registro.concluida, false);
      await sincronizar(
        ana.token,
        operacao('atividades', randomUUID(), { ...atividade, tipo: 'outro' }),
        400,
      );
    },
  );

  await t.test(
    'reenvios não duplicam dados nem desfazem a última edição',
    async () => {
      const envio = operacao('atividades', atividadeId, { ...atividade, titulo: 'Lista revisada' });
      const [primeira, repetida] = await Promise.all([
        sincronizar(ana.token, envio),
        sincronizar(ana.token, envio),
      ]);
      assert.deepEqual(primeira, repetida);
      await sincronizar(ana.token, { ...envio, p_dados: atividade }, 400);
      const conclusao = await sincronizar(
        ana.token,
        operacao('atividades', atividadeId, {
          ...atividade,
          titulo: 'Lista final',
          concluida: true,
        }),
      );

      assert.deepEqual(await sincronizar(ana.token, envio), primeira);
      const dados = await baixar(ana.token);
      assert.equal(dados.atividades.length, 1);
      assert.deepEqual(dados.atividades[0], conclusao.registro);
      assert.ok(conclusao.registro.atualizada_em > primeira.registro.atualizada_em);
    },
  );

  await t.test('bloqueia o acesso aos dados de outra conta', async () => {
    assert.deepEqual(await baixar(bruno.token), { disciplinas: [], atividades: [] });
    assert.deepEqual(
      await requisitar(`/rest/v1/atividades?id=eq.${atividadeId}`, { token: bruno.token }),
      [],
    );
    await sincronizar(bruno.token, operacao('disciplinas', disciplinaId, disciplina), 403);
    await sincronizar(bruno.token, operacao('atividades', randomUUID(), atividade), 409);
    const disciplinaBruno = randomUUID();
    const salvaBruno = await sincronizar(bruno.token, {
      ...envioDisciplina,
      p_registro_id: disciplinaBruno,
    });
    assert.equal(salvaBruno.registro.usuario_id, bruno.id);
    await sincronizar(
      bruno.token,
      operacao('atividades', atividadeId, {
        ...atividade,
        disciplina_id: disciplinaBruno,
      }),
      403,
    );
    await sincronizar(
      ana.token,
      operacao('disciplinas', disciplinaId, {
        ...disciplina,
        usuario_id: bruno.id,
      }),
      400,
    );
    await requisitar(`/rest/v1/atividades?id=eq.${atividadeId}`, {
      metodo: 'PATCH',
      token: ana.token,
      dados: { concluida: false },
      status: 403,
    });
    await requisitar(`/rest/v1/disciplinas?id=eq.${disciplinaId}`, {
      metodo: 'DELETE',
      token: ana.token,
      status: 403,
    });
    await requisitar('/rest/v1/rpc/baixar_dados', { metodo: 'POST', dados: {}, status: 401 });
    await sincronizar('', operacao('disciplinas', randomUUID(), disciplina), 401);
  });

  await t.test('outro acesso recebe os dados e exclusões', async () => {
    const outroAparelho = await entrar(ana.email, senha);
    assert.deepEqual(await baixar(outroAparelho.access_token), await baixar(ana.token));
    await sincronizar(
      ana.token,
      operacao('atividades', atividadeId, { ...atividade, excluida: true }),
    );
    assert.equal((await baixar(outroAparelho.access_token)).atividades[0].excluida, true);
    await sincronizar(ana.token, operacao('atividades', atividadeId, atividade));
    await sincronizar(
      ana.token,
      operacao('disciplinas', disciplinaId, { ...disciplina, excluida: true }),
    );
    const dados = await baixar(outroAparelho.access_token);
    assert.equal(dados.disciplinas[0].excluida, true);
    assert.equal(dados.atividades[0].excluida, true);
    await sincronizar(ana.token, operacao('atividades', randomUUID(), atividade), 409);
  });
});
