# dEficiente

Sistema de gerenciamento de rotinas e cuidados para dependentes (crianças, pessoas com deficiência ou necessidades especiais), permitindo o acompanhamento diário de atividades como medicação, alimentação, terapias e outras tarefas essenciais.

## 🎯 Objetivo

Centralizar e organizar a rotina de cuidados, permitindo que responsáveis e cuidadores:

- Cadastrem dependentes
- Definam rotinas recorrentes (ex: remédios, alimentação, terapias)
- Registrem a execução das rotinas
- Acompanhem histórico e atrasos
- Visualizem um dashboard diário com pendências e tarefas concluídas

## 🧱 Arquitetura

O projeto segue uma arquitetura em camadas:
Controller → Service → Repository → Prisma ORM → PostgreSQL

Separando:

- **Controllers**: camada HTTP (Express)
- **Services**: regras de negócio
- **Repositories**: acesso a dados
- **Prisma**: ORM e migrations
- **PostgreSQL**: persistência

## 🗄️ Modelo de Dados (v1.0.0)

Principais entidades:

- **User**: responsáveis e cuidadores
- **Dependent**: criança/pessoa assistida
- **DependentUser**: vínculo N:N com papéis (PARENT, CAREGIVER, etc.)
- **Routine**: rotinas recorrentes
- **RoutineLog**: histórico de execução das rotinas

## 🔐 Autenticação

- JWT (JSON Web Token)
- Controle de acesso por dependente
- Papéis e permissões por vínculo

## 📊 Funcionalidades atuais

- Cadastro e login de usuários
- Cadastro de dependentes
- Compartilhamento de dependentes entre usuários
- Criação de rotinas recorrentes
- Registro de execução (histórico)
- Dashboard diário
- Monitor automático de horários

## 🛠️ Tecnologias

- Node.js
- Express
- PostgreSQL
- Prisma ORM
- JWT
- Git (monorepo)

## ▶️ Como rodar o projeto

### Pré-requisitos

- Node.js
- PostgreSQL
- Git

### Passos

bash
git clone https://github.com/SEU_USUARIO/deficiente.git
cd deficiente/backend
npm install

Crie um arquivo .env:
DATABASE_URL="postgresql://usuario:senha@localhost:5432/deficiente_db"
JWT_SECRET="sua_chave_secreta"

Rode as migrations:
npx prisma migrate dev

Inicie a aplicação:
npm run dev

A API estará disponível em:
http://localhost:3000


## 📌 Versionamento
Este projeto segue Semantic Versioning.
Versão atual: v1.0.0

## ❤️ Motivação

Este projeto nasceu da necessidade real de organizar a rotina de cuidados de uma criança com necessidades especiais, buscando unir tecnologia, organização e qualidade de vida para toda a família.