# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Luccare — sistema de gerenciamento de rotinas e cuidados para dependentes com necessidades
especiais (medicações, alimentação, terapias). Monorepo: backend Node.js/Express + frontend Next.js.

> Cada subprojeto tem um `CLAUDE.md` próprio com detalhes específicos:
> [`backend/CLAUDE.md`](backend/CLAUDE.md) e [`frontend/CLAUDE.md`](frontend/CLAUDE.md). Leia-os ao
> trabalhar dentro de cada um.

## Estrutura

```
backend/    API REST + WebSocket (Node.js, Express 5, Prisma, PostgreSQL)  → porta 3000
frontend/   App Next.js 16 (App Router, React 19, Tailwind 4)              → porta 3001
```

Cada subprojeto tem seu próprio `package.json` e `node_modules` — **não há workspace raiz**.
Sempre rode `npm` dentro de `backend/` ou `frontend/`, nunca na raiz.

## Ambiente

- **Shell primário: PowerShell no Windows.** Use sintaxe PowerShell (`;` para encadear,
  `$env:VAR`; não há `&&`). A ferramenta Bash existe para scripts POSIX pontuais.
- Node.js + PostgreSQL local. Não há Docker no projeto.

## Comandos

```powershell
# Backend
cd backend; npm install
cd backend; npm run dev               # nodemon src/server.js (porta = $env:PORT, normalmente 3000)
cd backend; npx prisma migrate dev    # cria/aplica migration + regenera o client
cd backend; npx prisma generate       # regenera o Prisma Client após editar o schema
cd backend; npx prisma studio         # GUI do banco
# npm run build (backend) = prisma migrate deploy && prisma generate && node src/server.js (produção)

# Frontend
cd frontend; npm install
cd frontend; npm run dev              # next dev -p 3001
cd frontend; npm run build
cd frontend; npm run lint             # eslint
```

- Swagger (docs interativas da API): `http://localhost:3000/api-docs` com o backend rodando.
- Health check do backend: `GET /health`.
- **Não há testes automatizados** no projeto — validação é manual (Swagger / app rodando).

## Convenções

- **JavaScript puro**, sem TypeScript. Backend = CommonJS (`require`); frontend = ESM (`import`).
- **Idioma: português (pt-BR).** Comentários, mensagens de erro, texto de UI e mensagens de commit
  são em português. Mantenha esse padrão. Commits são curtos e descritivos.

## Arquitetura — visão geral

### Backend: camadas (um arquivo por feature em cada pasta)

`routes/` → `controllers/` (HTTP, faz `next(err)`) → `services/` (regra de negócio + permissão +
auditoria) → `repositories/` (Prisma) → `database/prisma.js` (PrismaClient único).
Erros de domínio são `BusinessError` lançados na service e formatados pelo `errorHandler` (último
middleware em `server.js`). Detalhes em [`backend/CLAUDE.md`](backend/CLAUDE.md).

### Frontend: Next.js App Router

Route group `(private)/` agrupa páginas autenticadas (Navbar + container). **Toda** chamada à API
passa por `apiFetch` (`src/services/api.js`), que injeta o token e o header `X-Timezone`, faz refresh
automático no `401` e redireciona ao perder a sessão. Alias `@/` → `src/`. Detalhes em
[`frontend/CLAUDE.md`](frontend/CLAUDE.md).

### Modelo de domínio (Prisma — `backend/prisma/schema.prisma`)

`User` (id vem de API de auth externa, **não** autoincrement) ↔ `DependentUser`
(papéis FAMILY/CAREGIVER/PROFESSIONAL) ↔ `Dependent` → `Routine` (template: `RoutineTime`,
`RoutineDayOfWeek`) → `RoutineSchedule` (instância diária) → `RoutineLog` (execução DONE/SKIPPED).
Também `DependentDayTypeOffset` (offset de horários por tipo/dia) e `AuditLog`.

## Pontos de atenção (gotchas)

- **Permissão sempre por vínculo.** Toda operação em dependente/rotina valida o `DependentUser` via
  `dependentUserRepository.findLink(dependentId, userId)` na service; escrita exige `role` em
  `['FAMILY', 'CAREGIVER']`. Não pule essa verificação.
- **Timezone:** o frontend envia `X-Timezone`; o backend lê em `timezoneMiddleware` (`req.timezone`,
  fallback `America/Sao_Paulo`). Datas usam UTC-meia-noite — veja `backend/src/utils/dateUtils.js`.
- **Autenticação tem dois modos** (`AUTH_MODE` = `LOCAL` JWT local ou `REMOTE` valida em API externa),
  aplicados tanto no HTTP (`authMiddleware`) quanto no WebSocket (`socket.js`).
- **Tempo real:** Socket.IO com salas `dep-${dependentId}`; o frontend escuta `schedule-updated`
  (`useRealtimeSync`) e refaz o fetch.
- `.env` (backend) e `.env.local` (frontend) **não são versionados** — não os comite.
