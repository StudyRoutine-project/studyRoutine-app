import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { setTimeout } from 'node:timers/promises';
import test from 'node:test';
import { abrirLink, entrar, lerLink, requisitar } from './client.ts';

import type { Sessao } from './types.ts';

type Conta = {
  id: string;
  email: string;
  token: string;
};

type Cadastro = {
  id: string;
  access_token?: string;
};

const senha = 'Estudo!2026-Abc';

test('API StudyRoutine', async (t) => {
  const contas: Conta[] = [];

  t.after(async () => {
    for (const conta of contas) {
      await requisitar(`/auth/v1/admin/users/${conta.id}`, { metodo: 'DELETE', admin: true });
    }
  });

  await t.test('cadastro, reenvio e confirmação de e-mail', async () => {
    for (const nome of ['Ana', 'Bruno']) {
      const email = `teste-${randomUUID()}@example.com`;
      const cadastro = await requisitar<Cadastro>('/auth/v1/signup', {
        metodo: 'POST',
        dados: { email, password: senha, data: { nome } },
      });
      const conta: Conta = { id: cadastro.id, email, token: '' };
      contas.push(conta);
      assert.equal(cadastro.access_token, undefined);
      await entrar(email, senha, 400);
      await lerLink(email);

      await setTimeout(1100);
      await requisitar('/auth/v1/resend', { metodo: 'POST', dados: { type: 'signup', email } });
      const destino = await abrirLink(await lerLink(email));
      assert.equal(
        `${destino.protocol}//${destino.host}${destino.pathname}`,
        'studyroutine://auth/confirmar',
      );
      assert.ok(new URLSearchParams(destino.hash.slice(1)).get('access_token'));
      const sessao = await entrar(email, senha);
      assert.equal(sessao.user.user_metadata.nome, nome);
      conta.token = sessao.access_token;
    }
  });

  const [ana] = contas;

  await t.test(
    'recupera senha, bloqueia o link já usado, renova a sessão e sai da conta',
    async () => {
      await requisitar('/auth/v1/recover?redirect_to=studyroutine%3A%2F%2Fauth%2Fnova-senha', {
        metodo: 'POST',
        dados: { email: ana.email },
      });
      const link = await lerLink(ana.email);
      const destino = await abrirLink(link);
      assert.equal(destino.pathname, '/nova-senha');
      const token = new URLSearchParams(destino.hash.slice(1)).get('access_token');
      assert.ok(token);
      const novaSenha = 'Nova!Senha2026-Abc';
      await requisitar('/auth/v1/user', { metodo: 'PUT', token, dados: { password: novaSenha } });
      const reutilizado = await abrirLink(link);
      assert.equal(new URLSearchParams(reutilizado.hash.slice(1)).get('error_code'), 'otp_expired');
      await entrar(ana.email, senha, 400);
      const sessao = await entrar(ana.email, novaSenha);
      const renovada = await requisitar<Sessao>('/auth/v1/token?grant_type=refresh_token', {
        metodo: 'POST',
        dados: { refresh_token: sessao.refresh_token },
      });
      assert.equal(renovada.user.id, ana.id);
      await requisitar('/auth/v1/logout?scope=global', {
        metodo: 'POST',
        token: renovada.access_token,
        status: 204,
      });
      await requisitar('/auth/v1/token?grant_type=refresh_token', {
        metodo: 'POST',
        dados: { refresh_token: renovada.refresh_token },
        status: 400,
      });
    },
  );
});
