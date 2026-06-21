# Luccare Backend — Guia

API REST + WebSocket. Node.js, Express 5, Prisma ORM, PostgreSQL, Socket.IO.
CommonJS (`require`/`module.exports`). Sem TypeScript, sem testes automatizados. Código em pt-BR.

## Comandos

```powershell
cd backend; npm run dev               # nodemon src/server.js
cd backend; npx prisma migrate dev    # cria/aplica migration e regenera o client
cd backend; npx prisma generate       # regenera o Prisma Client após editar o schema
cd backend; npx prisma studio         # GUI do banco
```

`npm run build` = `prisma migrate deploy && prisma generate && node src/server.js` (produção).
Porta vem de `$env:PORT`. Health check: `GET /health`. Swagger: `GET /api-docs`.

## Arquitetura em camadas

Uma feature atravessa quatro camadas, **um arquivo por feature em cada pasta**:

```
routes/        → define rotas Express, aplica authMiddleware, delega ao controller
controllers/   → camada HTTP: lê req, chama service, responde, repassa erro com next(err)
services/      → regra de negócio + validação de permissão + auditoria (o coração)
repositories/  → acesso a dados via Prisma (sem regra de negócio)
database/prisma.js  → instância única do PrismaClient
```

Ao adicionar um endpoint, siga a cadeia: route → controller → service → repository.
Use os arquivos existentes (`routineController.js`, `routineService.js`, `routineRepository.js`)
como molde — mesmo estilo, mesma nomenclatura.

## Padrões obrigatórios

- **Erros de negócio:** lance `BusinessError` (`errors/BusinessError.js`) na service.
  O `middlewares/errorHandler.js` (registrado por último em `server.js`) o converte em resposta.
  Controllers usam `try/catch` e só fazem `next(err)`.
- **Service envolve tudo em try/catch**, re-lança `BusinessError` e converte erros inesperados
  num `BusinessError` genérico, logando o original com `console.log('Erro no <fn>:', err)`.
- **Permissão por vínculo:** valide acesso com `dependentUserRepository.findLink(dependentId, userId)`
  antes de qualquer operação. Cheque o `role` (`['FAMILY', 'CAREGIVER']`) para escrita.
- **`req.userId`** é populado pelo `authMiddleware` a partir do token. Controllers o repassam.
- **Auditoria:** operações sensíveis (criar/editar/excluir) gravam via `auditLogRepository.create(...)`
  com `{ userId, action, entity, entityId, details }`. Veja `deleteRoutine` em `routineService.js`.
- **Datas:** use os helpers de `utils/dateUtils.js` (`getTodayForTimezone`, `getUTCToday`,
  `parseDate`, `isValidTimeString`). Campos `@db.Date` são armazenados como UTC-meia-noite.

## Autenticação

`middlewares/authMiddleware.js` escolhe o modo por `process.env.AUTH_MODE`:
- `LOCAL` — verifica o JWT localmente com `JWT_SECRET`.
- `REMOTE` — valida o token chamando `AUTH_API_URL/auth/validate-token`.
Ambos checam `decoded.app === AUTH_API_APP_SLUG` e setam `req.userId`.
O WebSocket (`socket.js`) replica essa lógica em `verifyToken`.

## WebSocket (Socket.IO)

- Setup em `socket.js`, inicializado em `server.js`. Autentica no handshake (`socket.handshake.auth.token`).
- Cliente entra na sala do dependente com `join-dependent` → sala `dep-${dependentId}` (valida vínculo).
- Para notificar mudanças, emita para a sala. O frontend escuta `schedule-updated` e refaz o fetch.
- Use `getIo()` de `socket.js` para acessar a instância `io` em services.

## Schema / Prisma

- Schema: `prisma/schema.prisma`. Migrations versionadas em `prisma/migrations/`.
- Após mudar o schema: `npx prisma migrate dev --name <descricao>` e confira o SQL gerado.
- `User.id` **não** é autoincrement — vem da API de auth externa.

## Detalhes a saber

- Vários arquivos de rota montam no mesmo prefixo em `server.js` (ex: três routers em `/dependents`).
  Cuidado com colisão de caminhos ao adicionar rotas.
- `routineMonitor.js` (`startRoutineMonitor`) está **comentado** em `server.js` — não está ativo.
- `.env` não é versionado. Chaves usadas: `PORT`, `BASE_URL`, `AUTH_API_URL`, `AUTH_API_APP_SLUG`,
  `AUTH_MODE`, `DATABASE_URL`, `JWT_SECRET`.
- Swagger é documentado inline com blocos `@swagger` em JSDoc nos controllers.
