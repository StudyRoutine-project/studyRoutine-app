import assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';
import type {
  DadosConta,
  Entidade,
  ErroApi,
  Operacao,
  RespostaSincronizacao,
  Sessao,
} from './types.ts';

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
assert.ok(process.env.SUPABASE_LOCAL_SMTP_PORT, 'falta a porta da caixa de e-mail no .env');
const chavePublica = process.env.SUPABASE_PUBLISHABLE_KEY;
const chaveSecreta = process.env.SUPABASE_SECRET_KEY;
assert.ok(chavePublica, 'falta a chave pública no .env');
assert.ok(chaveSecreta, 'falta a chave secreta no .env');
const chaves = { publica: chavePublica, secreta: chaveSecreta };

const url = new URL(`http://localhost:${process.env.SUPABASE_API_PORT}`).origin;
const urlCaixaEmail = new URL(`http://localhost:${process.env.SUPABASE_LOCAL_SMTP_PORT}`).origin;

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

export async function lerCodigo(email: string) {
  for (let tentativa = 0; tentativa < 30; tentativa++) {
    const resposta = await fetch(
      `${urlCaixaEmail}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
      {
        signal: AbortSignal.timeout(5000),
      },
    );
    const caixa: CaixaEmail = await resposta.json();
    const mensagem = caixa.messages.find((item) => !lidos.has(item.ID));
    if (mensagem) {
      lidos.add(mensagem.ID);
      const detalhe: MensagemEmail = await fetch(`${urlCaixaEmail}/api/v1/message/${mensagem.ID}`, {
        signal: AbortSignal.timeout(5000),
      }).then((r) => r.json());
      const codigo = detalhe.HTML.match(/<strong class="codigo">\s*(\d{6,10})\s*<\/strong>/);
      assert.ok(codigo, 'código não encontrado no e-mail');
      return codigo[1];
    }
    await setTimeout(100);
  }
  assert.fail('o e-mail não chegou à caixa de entrada');
}

export function sincronizar<E extends Entidade>(
  token: string,
  operacao: Operacao<E>,
): Promise<RespostaSincronizacao<E>>;
export function sincronizar(token: string, operacao: Operacao, status: number): Promise<ErroApi>;
export function sincronizar(token: string, operacao: Operacao, status = 200) {
  return requisitar('/rest/v1/rpc/sincronizar_operacao', {
    metodo: 'POST',
    token,
    dados: operacao,
    status,
  });
}

export function baixar(token: string) {
  return requisitar<DadosConta>('/rest/v1/rpc/baixar_dados', { metodo: 'POST', token, dados: {} });
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
