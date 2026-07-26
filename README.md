# 🧡 Luccare

**🔗 App:** [luccare.godoz.dev.br](https://luccare.godoz.dev.br) · **Portfólio:** [godoz.net](https://godoz.net)

Sistema de gerenciamento de rotinas e cuidados para pessoas com necessidades especiais, com foco em organização, acompanhamento e tranquilidade para famílias e cuidadores.

## 🎯 Objetivo

O **Luccare** foi criado para ajudar responsáveis a organizarem e acompanharem a rotina diária de dependentes, como:

- Medicações
- Alimentação
- Terapias
- Atividades recorrentes
- Acompanhamento de execução e atrasos

Tudo de forma centralizada, segura e com histórico completo.

## 💙 Motivação

Este projeto nasceu a partir da experiência real de cuidado com o **Lucca**, uma criança com necessidades especiais que exige uma rotina estruturada, atenção constante e coordenação entre diferentes responsáveis.

O Luccare é, ao mesmo tempo, um projeto de estudo em engenharia de software e uma ferramenta que busca trazer mais organização, previsibilidade e qualidade de vida para famílias em situações semelhantes.

## 🧱 Arquitetura

O backend segue uma arquitetura em camadas:

### Controller → Service → Repository → Prisma ORM → PostgreSQL

Camadas bem definidas:

- **Controllers**: Camada HTTP (Express)
- **Services**: Regras de negócio
- **Repositories**: Acesso a dados
- **Prisma**: ORM e migrations
- **PostgreSQL**: Banco de dados relacional

## 🗄️ Modelo de Dados (v1.0.0)

Entidades principais:

- **User**: Responsáveis e cuidadores
- **Dependent**: Pessoa assistida (ex: criança)
- **DependentUser**: Vínculo N:N com papéis (PAI, MÃE, CUIDADOR, etc.)
- **Routine**: Rotinas recorrentes (remédios, alimentação, terapias)
- **RoutineLog**: Registro de execução das rotinas (histórico)

## 🔐 Autenticação e Segurança

- Autenticação via JWT
- Controle de acesso por dependente
- Papéis e permissões por vínculo
- Todas as rotas protegidas por middleware

## 📊 Funcionalidades (v1.0.0)

- Cadastro e login de usuários
- Cadastro de dependentes
- Compartilhamento de dependentes entre responsáveis
- Criação de rotinas recorrentes
- Registro de execução (histórico)
- Dashboard diário de pendências
- Monitor automático de horários

## 📡 API – Principais Endpoints

### Autenticação
- `POST /auth/register`
- `POST /auth/login`

### Dependentes
- `POST /dependents`
- `GET /dependents`

### Rotinas
- `POST /dependents/:dependentId/routines`
- `GET /dependents/:dependentId/routines`

### Execução / Histórico
- `POST /routines/:routineId/logs`
- `GET /routines/:routineId/logs`

### Dashboard
- `GET /dashboard/today`

## 📚 Documentação da API (Swagger)

A API do **Luccare** está documentada utilizando **OpenAPI (Swagger)**, com interface interativa para testes.

Após subir o backend, acesse:
http://localhost:3000/api-docs

Na interface do Swagger você poderá:

- Visualizar todos os endpoints da API
- Ver exemplos de payloads
- Autenticar usando JWT (botão **Authorize**)
- Testar as rotas diretamente pelo navegador

### Autenticação no Swagger

1. Faça login pelo endpoint `/auth/login`
2. Copie o token JWT retornado
3. Clique em **Authorize** no canto superior direito
4. Cole (sem "Bearer" no começo)
5. Confirme. Agora todas as rotas protegidas poderão ser testadas.

## 🛠️ Tecnologias

- Node.js
- Express
- PostgreSQL
- Prisma ORM
- JWT
- Git (Monorepo)

## ▶️ Como rodar o projeto

### Pré-requisitos

- Node.js
- PostgreSQL
- Git

### Instalação backend

```bash
git clone https://github.com/yurigodoz/Luccare.git
cd luccare/backend
npm install
```

### Crie o arquivo .env:
```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/luccare_db"
JWT_SECRET="sua_chave_secreta"
```

```bash
# Execute as migrations:
npx prisma migrate dev

# Inicie o servidor
npm run dev
```

### API disponível em:
http://localhost:3000

## 🏷️ Versionamento

O projeto segue Semantic Versioning.

Versão atual: v1.0.0