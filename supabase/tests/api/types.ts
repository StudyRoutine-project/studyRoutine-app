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
