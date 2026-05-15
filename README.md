<p align="center">
  <a href="https://nestjs.com/" target="_blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# nest-estudo

API de demonstração em [NestJS](https://github.com/nestjs/nest): raiz pública, `POST /login` (JWT), rotas em `/users` protegidas por Bearer, validação com `class-validator` e documentação em **Swagger UI** (`/docs`).

## Requisitos

- [Node.js](https://nodejs.org/) (versão compatível com o `package.json` do repositório)
- [Docker](https://docs.docker.com/get-docker/) e Docker Compose (opcional, para subir a API em container)
- [k6](https://k6.io/docs/) (opcional, só para benchmark de carga descrito abaixo)

## Instalação

```bash
npm install
```

## Executar o projeto

Variáveis úteis (opcionais):

| Variável     | Descrição                          | Padrão (código)        |
| ------------ | ---------------------------------- | ---------------------- |
| `PORT`       | Porta HTTP                         | `3000`                 |
| `JWT_SECRET` | Segredo para assinatura do JWT     | valor só para desenvolvimento |

### Desenvolvimento (watch)

```bash
npm run start:dev
```

### Produção local (build + Node)

```bash
npm run build
npm run start:prod
```

### Outros scripts

| Comando              | Descrição        |
| -------------------- | ---------------- |
| `npm run start`      | Início sem watch |
| `npm run build`      | Compila para `dist/` |
| `npm run lint`       | ESLint           |

Com o servidor no ar, a API responde em `http://localhost:3000` (ou na porta definida em `PORT`). A documentação interativa fica em **`http://localhost:3000/docs`**.

## Docker

Na raiz do repositório:

```bash
# Imagem de produção (build + node dist/main.js)
docker compose up --build
```

Modo desenvolvimento com hot reload e código montado do host (profile `dev`):

```bash
docker compose --profile dev up --build api-dev
```

Variáveis podem ser passadas ao Compose, por exemplo:

```bash
JWT_SECRET='seu-segredo' PORT=3000 docker compose up --build
```

## Testes

```bash
npm run test        # unitários
npm run test:e2e    # e2e
npm run test:cov    # cobertura
```

## Benchmark de carga (k6)

O script [`benchmarks/k6/aluno-load-auth.js`](benchmarks/k6/aluno-load-auth.js) segue a mesma ideia do benchmark do repositório de estudos em Fastify ([`fastify-estudos` — `aluno-load-auth.js`](https://github.com/fernao-lara-gran/fastify-estudos/blob/master/benchmarks/k6/aluno-load-auth.js)): faz `POST` de login, guarda o JWT e dispara requisições autenticadas em `/`, `/users` e `/users/1`.

### Documentação e instalação do k6

- Documentação oficial: [k6.io/docs](https://k6.io/docs/)
- Conceitos de cenários e thresholds: [Using k6 / Options](https://k6.io/docs/using-k6/k6-options/reference/)

### Como rodar neste projeto

1. Suba a API (`npm run start:dev`, `npm run start:prod` ou Docker).
2. Na raiz do repositório:

```bash
npm run k6:load -- -e EMAIL=aluno@exemplo.com -e PASSWORD=segredo
```

O helper [`benchmarks/k6/run.sh`](benchmarks/k6/run.sh) grava métricas em JSON em `benchmarks/k6/results/<nome-do-repo>-<AAAA-MM-DD>.json` (se já existir arquivo no mesmo dia, acrescenta sufixo `-HHMMSS`). Pasta alternativa:

```bash
K6_RESULTS_DIR=out/k6-results npm run k6:load -- -e EMAIL=a@b.com -e PASSWORD=x
```

Variáveis extras do script (alinhadas ao Fastify de referência):

| Variável        | Descrição |
| --------------- | --------- |
| `BASE_URL`      | Origem com barra final (ex.: `http://localhost:3000/`) |
| `PORT`          | Se `BASE_URL` não for definida, monta `http://localhost:${PORT}/` |
| `LOGIN_PATH`    | Caminho do POST de login (padrão `/login`) |
| `EMAIL` / `PASSWORD` | Obrigatórios para o login (e-mail válido, senha não vazia) |
| `LOGIN_JSON`    | Se `0`, login como `application/x-www-form-urlencoded` |
| `EXTRA_HEADERS` | JSON opcional com headers adicionais |

Execução direta com o binário `k6` (sem gravar JSON pelo `run.sh`):

```bash
k6 run -e EMAIL=test@example.com -e PASSWORD=secret benchmarks/k6/aluno-load-auth.js
```

Os arquivos `benchmarks/k6/results/*.json` estão no `.gitignore`.

## Recursos NestJS

- [Documentação NestJS](https://docs.nestjs.com)
- [Discord NestJS](https://discord.gg/G7Qnnhy)

## Licença

Este repositório mantém a licença indicada no `package.json` do projeto. O framework Nest é [licenciado em MIT](https://github.com/nestjs/nest/blob/master/LICENSE).
