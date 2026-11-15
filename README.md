# StudyRoutine

O StudyRoutine é um app que ajuda a organizar a rotina de estudos. Você pode cadastrar provas, trabalhos e tarefas por disciplina, acompanhar os prazos e receber lembretes no celular.

Mesmo sem internet, dá para consultar e editar os dados que já estão no aparelho. Quando a conexão volta, o app envia as alterações e busca os dados da conta.

## Funcionalidades

- Resumo de atividades pendentes, atrasadas e concluídas no Início.
- Agenda para consultar as atividades de cada dia.
- Cadastro com confirmação por e-mail e recuperação de senha por código.
- Recuperação dos dados sincronizados ao entrar com a mesma conta em outro aparelho.

## Tecnologias

- React Native, Expo e TypeScript no aplicativo.
- O SQLite guarda disciplinas, atividades e a fila de sincronização no aparelho.
- O AsyncStorage salva os filtros da Agenda e a preferência de lembretes. 
- O SecureStore guarda os tokens da sessão no celular.
- O Supabase Auth gerencia o acesso à conta. A API do Supabase sincroniza os dados com o PostgreSQL.
- O Docker roda o Supabase local, e o Mailpit recebe os e-mails de teste.
- O Resend envia os códigos de confirmação e recuperação de senha no ambiente hospedado.

## Como rodar

Use uma versão atualizada do Node.js 22 e instale as dependências na raiz do repositório.

```sh
npm ci
```

Copie o [`.env.example`](.env.example) para `.env` e siga as instruções do ambiente que você vai usar.

### Supabase local

Com o Docker aberto, inicie o Supabase local e consulte o endereço da API e as chaves. Na primeira vez, a CLI cria os contêineres e aplica as migrações do repositório.

```sh
npm run supabase:start
npx supabase status -o env
```

No `.env`, use o valor de `API_URL` em `EXPO_PUBLIC_SUPABASE_URL` e o de `PUBLISHABLE_KEY` em `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Para rodar no celular físico, substitua o host da URL pelo IP do computador na rede local e mantenha a porta `54321`.

Os e-mails de confirmação e recuperação chegam ao [Mailpit](http://localhost:54324).

### Testes locais

Com o Supabase local ativo, preencha também `SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SECRET_KEY` no `.env` com os valores de `PUBLISHABLE_KEY` e `SECRET_KEY` retornados pelo comando de status.

```sh
npm run test:db
npm run test:api
```

`test:db` verifica as regras de acesso e as operações no banco. `test:api` cobre a autenticação e a sincronização, incluindo a leitura dos códigos no Mailpit.

### Supabase hospedado

Para usar um projeto já configurado, abra **Connect** no painel do Supabase. No `.env`, preencha `EXPO_PUBLIC_SUPABASE_URL` com a URL do projeto e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` com a chave publicável.

No StudyRoutine, a integração com o GitHub aplica as [migrações do banco](supabase/migrations) a partir da branch `main`. O Supabase Auth usa o SMTP do Resend para enviar os códigos de confirmação e recuperação de senha com os [modelos de e-mail do projeto](supabase/templates).

Para hospedar sua própria instância, conecte o repositório ao projeto no Supabase, configure o envio pelo Resend com um domínio verificado e adicione os modelos no Supabase Auth.

### Abrir no celular

```sh
npm start
```

Conecte o computador e o celular à mesma rede e escaneie o QR Code com o Expo Go.
