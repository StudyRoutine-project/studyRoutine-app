import assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';
import type { ErroApi, Sessao } from './types.ts';

type OpcoesRequisicao = {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  dados?: unknown;
  token?: string;
  status?: number;
  admin?: boolean;
};

type CaixaEmail = {
  messages: { ID: string }[];
};

type MensagemEmail = {
  HTML: string;
};

assert.ok(process.env.SUPABASE_API_PORT, 'falta a porta da API no .env');
assert.ok(process.env.SUPABASE_LOCAL_SMTP_PORT, 'falta a porta do Mailpit no .env');
const chavePublica = process.env.SUPABASE_PUBLISHABLE_KEY;
const chaveSecreta = process.env.SUPABASE_SECRET_KEY;
assert.ok(chavePublica, 'falta a chave pública no .env');
assert.ok(chaveSecreta, 'falta a chave secreta no .env');
const chaves = { publica: chavePublica, secreta: chaveSecreta };

const url = new URL(`http://localhost:${process.env.SUPABASE_API_PORT}`).origin;
const mailpit = new URL(`http://localhost:${process.env.SUPABASE_LOCAL_SMTP_PORT}`).origin;

export async function requisitar<T = unknown>(
  caminho: string,
  { metodo = 'GET', dados, token, status = 200, admin = false }: OpcoesRequisicao = {},
): Promise<T> {
  const resposta = await fetch(`${url}${caminho}`, {
    method: metodo,
    headers: {
      apikey: admin ? chaves.secreta : chaves.publica,
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: dados === undefined ? undefined : JSON.stringify(dados),
    signal: AbortSignal.timeout(10_000),
  });
  const texto = await resposta.text();
  const corpo: T = texto ? JSON.parse(texto) : null;
  const erro = corpo as ErroApi | null;
  assert.equal(
    resposta.status,
    status,
    `${metodo} ${caminho}: ${erro?.message ?? erro?.msg ?? ''}`,
  );
  return corpo;
}

const lidos = new Set<string>();

export async function lerLink(email: string) {
  for (let tentativa = 0; tentativa < 30; tentativa++) {
    const resposta = await fetch(
      `${mailpit}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
      {
        signal: AbortSignal.timeout(5000),
      },
    );
    const caixa: CaixaEmail = await resposta.json();
    const mensagem = caixa.messages.find((item) => !lidos.has(item.ID));
    if (mensagem) {
      lidos.add(mensagem.ID);
      const detalhe: MensagemEmail = await fetch(`${mailpit}/api/v1/message/${mensagem.ID}`, {
        signal: AbortSignal.timeout(5000),
      }).then((r) => r.json());
      const link = detalhe.HTML.match(/href="([^"]+\/verify\?[^"]+)"/);
      assert.ok(link, 'link não encontrado no e-mail');
      return link[1].replaceAll('&amp;', '&');
    }
    await setTimeout(100);
  }
  assert.fail('o e-mail não chegou ao Mailpit');
}

export async function abrirLink(link: string) {
  const resposta = await fetch(link, { redirect: 'manual', signal: AbortSignal.timeout(10_000) });
  assert.equal(resposta.status, 303);
  const destino = resposta.headers.get('location');
  assert.ok(destino, 'redirecionamento não informado');
  return new URL(destino);
}

export function entrar(email: string, password: string): Promise<Sessao>;
export function entrar(email: string, password: string, status: number): Promise<ErroApi>;
export function entrar(email: string, password: string, status = 200) {
  return requisitar('/auth/v1/token?grant_type=password', {
    metodo: 'POST',
    dados: { email, password },
    status,
  });
}
