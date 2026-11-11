import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { setTimeout } from 'node:timers/promises';
import test from 'node:test';
import { createClient } from '@supabase/supabase-js';

import {
  encerrarSessaoTemporaria,
  entrar,
  reenviarConfirmacao,
  salvarNovaSenha,
  solicitarRecuperacao,
  validarCodigo,
} from '../../../src/services/autenticacao.ts';
import { lerCodigo, requisitar, urlApi } from './client.ts';

import type { Sessao } from './types.ts';

test('confirma o cadastro e recupera a senha com códigos por e-mail', async (t) => {
  const email = `teste-${randomUUID()}@example.com`;
  const senha = 'Estudo!2026-Abc';
  const novaSenha = 'Nova!Senha2026-Abc';
  const cliente = () =>
    createClient(urlApi, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  const app = cliente();
  const confirmacao = cliente();
  const recuperacao = cliente();
  const cadastro = await app.auth.signUp({
    email,
    password: senha,
    options: { data: { nome: 'Ana' } },
  });
  assert.equal(cadastro.error, null);
  const contaId = cadastro.data.user?.id;
  assert.ok(contaId);
  t.after(async () => {
    await requisitar(`/auth/v1/admin/users/${contaId}`, { metodo: 'DELETE', admin: true });
  });

  await t.test('reenvia e confirma o cadastro antes do primeiro login', async () => {
    assert.equal((await entrar(app, email, senha))?.confirmarEmail, true);
    await lerCodigo(email);
    await setTimeout(1100);

    assert.equal(await reenviarConfirmacao(app, email), null);
    const codigo = await lerCodigo(email);
    const errado = `${codigo[0] === '0' ? '1' : '0'}${codigo.slice(1)}`;
    assert.match(
      (await validarCodigo(confirmacao, email, errado, 'cadastro')) ?? '',
      /incorreto|expirado/,
    );
    assert.equal(await validarCodigo(confirmacao, email, codigo, 'cadastro'), null);
    assert.equal((await app.auth.getSession()).data.session, null);
    assert.equal((await confirmacao.auth.getSession()).data.session?.user.id, contaId);
    assert.equal(await encerrarSessaoTemporaria(confirmacao), null);
    assert.equal(await entrar(app, email, senha), null);
    assert.equal((await app.auth.getSession()).data.session?.user.user_metadata.nome, 'Ana');
    assert.equal((await app.auth.signOut({ scope: 'local' })).error, null);
  });

  await t.test('troca a senha, rejeita código usado e permite entrar novamente', async () => {
    assert.equal(await solicitarRecuperacao(app, email), null);
    const codigo = await lerCodigo(email);

    assert.equal(await validarCodigo(recuperacao, email, codigo, 'recuperacao'), null);
    assert.equal((await app.auth.getSession()).data.session, null);
    assert.equal(await salvarNovaSenha(recuperacao, novaSenha), null);
    assert.equal(await encerrarSessaoTemporaria(recuperacao), null);
    assert.equal((await recuperacao.auth.getSession()).data.session, null);
    assert.match(
      (await validarCodigo(recuperacao, email, codigo, 'recuperacao')) ?? '',
      /expirado/,
    );
    assert.equal((await entrar(app, email, senha))?.mensagem, 'E-mail ou senha inválidos.');
    assert.equal(await entrar(app, email, novaSenha), null);

    const sessao = (await app.auth.getSession()).data.session;
    assert.ok(sessao);
    const renovada = await requisitar<Sessao>('/auth/v1/token?grant_type=refresh_token', {
      metodo: 'POST',
      dados: { refresh_token: sessao.refresh_token },
    });
    assert.equal(renovada.user.id, contaId);
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
  });
});
