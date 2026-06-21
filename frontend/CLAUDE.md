# Luccare Frontend — Guia

App Next.js 16 (App Router), React 19, Tailwind CSS 4. JavaScript puro (ESM), sem TypeScript.
Sem testes automatizados. Texto da UI em pt-BR.

## Comandos

```powershell
cd frontend; npm run dev      # next dev -p 3001
cd frontend; npm run build
cd frontend; npm run start
cd frontend; npm run lint     # eslint (flat config: eslint.config.mjs)
```

A URL da API vem de `NEXT_PUBLIC_API_URL` (`.env.local`, não versionado). Backend roda em :3000.

## Estrutura (App Router)

```
src/app/
  layout.js              → layout raiz
  page.js                → tela inicial / login (rota pública "/")
  (private)/             → route group autenticado (não afeta a URL)
    layout.js            → Navbar + container; aplicado a tudo sob (private)
    dashboard/page.js
    dependents/...       → listagem, novo, [id], [id]/edit, [id]/share,
                            [id]/routines/new, [id]/routines/[routineId]/edit
  globals.css            → Tailwind + estilos globais
src/components/          → AuthGuard, Navbar, ServiceWorkerRegister
src/hooks/               → useRealtimeSync, useRefetchOnFocus
src/services/api.js      → wrapper único de fetch para a API
```

Alias de import: **`@/` → `src/`** (definido em `jsconfig.json`). Use `@/services/api`, `@/components/...`.

## Padrões

- **Toda chamada à API passa por `apiFetch(path, options)`** (`src/services/api.js`). Ele:
  - injeta `Authorization: Bearer <accessToken>` (de `localStorage`) e o header `X-Timezone`;
  - em `401`, tenta **refresh** automático (`/auth/refresh`) com de-duplicação de requisições
    concorrentes (`refreshPromise`); se o refresh falhar, limpa o `localStorage` e redireciona para `/`;
  - faz parse do JSON e lança `Error(mensagem)` com a mensagem de erro do backend.
  Não use `fetch` direto para a API — sempre `apiFetch`.
- **Tokens** ficam em `localStorage` (`accessToken`, `refreshToken`). Auth é client-side
  (`components/AuthGuard.js` protege as páginas privadas).
- **Tempo real:** `useRealtimeSync(callback, dependentIds, extraListeners)` abre um socket
  (socket.io-client), entra nas salas dos dependentes (`join-dependent`) e chama `callback`
  no evento `schedule-updated`. Use para manter dashboards sincronizados.
- **Refetch ao focar:** `useRefetchOnFocus` recarrega dados quando a aba volta ao foco.
- **Estilo:** Tailwind utility classes inline (ex: `min-h-screen flex flex-col bg-blue-50`).
  Não há biblioteca de componentes; siga os componentes existentes.
- Páginas que usam hooks/estado/`localStorage` precisam de `'use client'` no topo.

## Detalhes a saber

- `NEXT_PUBLIC_API_URL` precisa apontar para um host alcançável pelo dispositivo
  (em dev costuma ser o IP da máquina na LAN, não `localhost`, para testar no celular).
- Há um Service Worker (`components/ServiceWorkerRegister.js`) — comportamento PWA/cache.
