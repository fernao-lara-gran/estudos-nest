/**
 * Carga autenticada (k6) — API Nest deste repositório.
 *
 * Baseado em benchmarks/k6/aluno-load-auth.js de fastify-estudos:
 * https://github.com/fernao-lara-gran/fastify-estudos
 *
 * Variáveis de ambiente (ex.: k6 run -e EMAIL=a@b.com -e PASSWORD=x benchmarks/k6/aluno-load-auth.js):
 * BASE_URL — base com barra final (default: http://localhost:3000/ — porta do Nest / docker-compose local)
 * PORT — se definida e BASE_URL omitida, usa http://localhost:${PORT}/
 * LOGIN_PATH — POST login relativo à BASE_URL (default: /login)
 * EMAIL, PASSWORD — corpo JSON do login (email válido, senha não vazia; ver LoginDto)
 * LOGIN_JSON — se "0", envia login como application/x-www-form-urlencoded (default: JSON)
 * EXTRA_HEADERS — JSON opcional de headers extras
 *
 * Resposta de login: JSON com `token` (JWT). Rotas em `urls` usam Authorization: Bearer quando houver token.
 *
 * Saída JSON com nome do repo e data: npm run k6:load (veja benchmarks/k6/run.sh).
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = (
  __ENV.BASE_URL ||
  (__ENV.PORT ? `http://localhost:${__ENV.PORT}/` : 'http://localhost:3000/')
).replace(/\/?$/, '/');
const loginPath = __ENV.LOGIN_PATH || '/login';
const email = __ENV.EMAIL;
const password = __ENV.PASSWORD;
const useJsonLogin = __ENV.LOGIN_JSON !== '0';

function parseExtraHeaders() {
  if (!__ENV.EXTRA_HEADERS) return {};
  try {
    return JSON.parse(__ENV.EXTRA_HEADERS);
  } catch {
    return {};
  }
}

const extraHeaders = parseExtraHeaders();

export const options = {
  stages: [
    { duration: '5s', target: 10 },
    { duration: '10s', target: 50 },
    { duration: '5s', target: 10 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
  },
  maxRedirects: 0,
};

/** Rotas deste projeto (após login): raiz pública; /users exige JWT. */
const urls = ['/', '/users', '/users/1'];

/**
 * @param {import('k6/http').RefinedResponse} res
 * @returns {string | null}
 */
function extractBearerToken(res) {
  if (res.status < 200 || res.status >= 300) return null;
  try {
    const body = res.json();
    if (!body || typeof body !== 'object') return null;
    if (body.token && typeof body.token === 'string') return body.token;
    if (body.access_token && typeof body.access_token === 'string')
      return body.access_token;
    if (
      body.data &&
      body.data.token &&
      typeof body.data.token === 'string'
    )
      return body.data.token;
  } catch {
    return null;
  }
  return null;
}

/**
 * @param {string | null} bearer
 * @returns {Record}
 */
function authHeaders(bearer) {
  const h = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (bearer) {
    h.Authorization = `Bearer ${bearer}`;
  }
  return h;
}

let loggedIn = false;
/** @type {string | null} */
let bearerToken = null;

function ensureCredentials() {
  if (!email || !password) {
    throw new Error(
      'Defina EMAIL e PASSWORD (ex.: k6 run -e EMAIL=a@b.com -e PASSWORD=secret benchmarks/k6/aluno-load-auth.js)',
    );
  }
}

function doLogin() {
  ensureCredentials();
  const loginUrl = `${baseUrl.replace(/\/+$/, '')}${loginPath.startsWith('/') ? '' : '/'}${loginPath}`;

  if (useJsonLogin) {
    return http.post(
      loginUrl,
      JSON.stringify({ email, password }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...extraHeaders,
        },
        tags: { name: 'Login' },
      },
    );
  }

  const form = {
    email,
    password,
  };
  return http.post(loginUrl, form, {
    headers: {
      ...extraHeaders,
    },
    tags: { name: 'Login' },
  });
}

export default function () {
  if (!loggedIn) {
    const loginRes = doLogin();
    bearerToken = extractBearerToken(loginRes);

    check(loginRes, {
      'login HTTP 2xx': (r) => r.status >= 200 && r.status < 300,
      'login retorna token JWT': () => bearerToken !== null,
    });

    const loginOk =
      loginRes.status >= 200 &&
      loginRes.status < 300 &&
      bearerToken !== null;

    if (!loginOk) {
      sleep(1);
      return;
    }

    loggedIn = true;
  }

  const params = {
    headers: authHeaders(bearerToken),
    tags: { name: 'API' },
  };

  urls.forEach((path) => {
    const res = http.get(`${baseUrl}${path.replace(/^\//, '')}`, params);
    check(res, {
      'rota ok (2xx ou 404 em recurso)': (r) =>
        (r.status >= 200 && r.status < 300) || r.status === 404,
    });
  });

  sleep(1);
}
