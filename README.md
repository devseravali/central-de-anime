# Central de Anime

Plataforma Full Stack para exploração de animes, acompanhamento de episódios e interação dos usuários.

O projeto foi desenvolvido para demonstrar, na prática, a aplicação de tecnologias modernas de desenvolvimento web, arquitetura de software, APIs REST, banco de dados, autenticação, segurança e testes automatizados.

> **Status:** Backend concluído · Frontend em desenvolvimento

---

## Sobre o projeto

A **Central de Anime** é uma aplicação Full Stack que reúne catálogo de animes, episódios, temporadas, personagens e funcionalidades de interação com os usuários.

O backend foi desenvolvido como uma API REST completa, com separação de responsabilidades, persistência de dados, autenticação, autorização, validação, segurança, tratamento de erros, documentação e testes automatizados.

A próxima etapa é o desenvolvimento do frontend e a integração com a API.

---

## Status do projeto

### Backend

* [x] API REST
* [x] PostgreSQL
* [x] Prisma ORM
* [x] Autenticação
* [x] Autorização
* [x] Controle de acesso
* [x] Validação com Zod
* [x] Middlewares
* [x] Rate limiting
* [x] Tratamento centralizado de erros
* [x] Regras de negócio
* [x] Swagger / OpenAPI
* [x] Testes automatizados
* [x] Testes de regressão
* [x] Testes de segurança
* [x] Seeds
* [x] Estrutura modular

### Frontend

* [ ] Interface da aplicação
* [ ] Catálogo
* [ ] Autenticação
* [ ] Perfil do usuário
* [ ] Favoritos
* [ ] Progresso dos episódios
* [ ] Avaliações
* [ ] Rankings
* [ ] Integração com a API

### Deploy

* [ ] Backend
* [ ] Frontend
* [ ] Ambiente de produção

---

## Funcionalidades

### Catálogo

* Animes
* Episódios
* Temporadas
* Personagens
* Gêneros
* Plataformas
* Franquias
* Estúdios

### Usuários

* Cadastro
* Autenticação
* Gerenciamento de perfil
* Sessões
* Recuperação de senha
* Redefinição de senha

### Interações

* Favoritos
* Avaliações
* Progresso de episódios
* Rankings
* Interações com o catálogo

### Administração

* Gerenciamento administrativo
* Operações em lote
* Exportação de dados
* Controle de acesso

### API

* Paginação
* Validação de dados
* Webhooks
* Tratamento de erros
* Documentação OpenAPI

---

## Segurança

A API implementa mecanismos de segurança para proteção dos usuários e dos recursos da aplicação.

Entre eles:

* Autenticação baseada em JWT
* Autorização
* Controle de acesso administrativo
* Validação de entrada com Zod
* Rate limiting
* Proteção contra IDOR
* Proteção contra mass assignment
* Validação de parâmetros
* Proteção de cookies
* Tratamento centralizado de erros

---

## Arquitetura

O backend utiliza uma arquitetura organizada por responsabilidades:

```text
backend/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── generated/
│
├── scripts/
│
└── src/
    ├── config/
    ├── controllers/
    ├── middlewares/
    ├── routes/
    ├── schemas/
    ├── services/
    ├── seed/
    ├── tests/
    ├── types/
    ├── app.ts
    └── server.ts
```

### Camadas

| Camada         | Responsabilidade                                  |
| -------------- | ------------------------------------------------- |
| `controllers/` | Tratamento das requisições e respostas HTTP       |
| `services/`    | Regras e lógica de negócio                        |
| `routes/`      | Definição dos endpoints                           |
| `middlewares/` | Autenticação, autorização, validação e tratamento |
| `schemas/`     | Validação e definição dos dados de entrada        |
| `config/`      | Configurações da aplicação                        |
| `seed/`        | Popular e preparar dados do sistema               |
| `tests/`       | Testes automatizados                              |
| `types/`       | Tipos e declarações TypeScript                    |
| `prisma/`      | Modelagem, migrations e código gerado             |
| `scripts/`     | Scripts auxiliares                                |

---

## Tecnologias

### Backend

| Tecnologia            | Utilização                |
| --------------------- | ------------------------- |
| **Node.js**           | Runtime da aplicação      |
| **TypeScript**        | Tipagem e desenvolvimento |
| **Express**           | Framework HTTP            |
| **PostgreSQL**        | Banco de dados relacional |
| **Prisma**            | ORM e acesso ao banco     |
| **Zod**               | Validação de dados        |
| **JWT**               | Autenticação              |
| **bcrypt**            | Hash de senhas            |
| **Swagger / OpenAPI** | Documentação da API       |
| **Vitest**            | Testes automatizados      |
| **Supertest**         | Testes HTTP               |

### Infraestrutura e ferramentas

* Docker
* Docker Compose
* Git
* GitHub
* GitHub Actions
* ESLint
* Prettier

---

## Testes

O backend possui uma suíte de testes automatizados organizada por responsabilidade:

```text
tests/
├── config/
├── controllers/
├── criticos/
├── middlewares/
├── regressao/
├── routes/
├── seguranca/
├── services/
└── types/
```

A cobertura de testes contempla diferentes camadas e cenários da aplicação, incluindo:

* Controllers
* Services
* Routes
* Middlewares
* Segurança
* Regressões
* Operações críticas
* Configurações

---

## Documentação da API

A API utiliza **Swagger / OpenAPI** para documentação dos endpoints e contratos disponíveis no backend.

A documentação acompanha a evolução da API e facilita a consulta dos recursos disponíveis para integração com o frontend.

---

## Evolução do projeto

```text
Catálogo de Animes
        ↓
API REST
        ↓
PostgreSQL
        ↓
Regras de negócio
        ↓
Autenticação e autorização
        ↓
Validação e segurança
        ↓
Testes automatizados
        ↓
Documentação da API
        ↓
Backend concluído
        ↓
Frontend
        ↓
Integração Full Stack
        ↓
Deploy
```

---

## Próximas etapas

* Desenvolvimento do frontend
* Construção da interface do catálogo
* Integração com a API
* Implementação das funcionalidades de usuário
* Integração de favoritos, avaliações e progresso
* Implementação dos rankings
* Integração completa Full Stack
* Deploy da aplicação

---

## Objetivo do projeto

A **Central de Anime** foi desenvolvida como um projeto prático de portfólio para demonstrar a aplicação de tecnologias e boas práticas utilizadas no desenvolvimento de aplicações Full Stack.

O projeto busca demonstrar conhecimentos em:

* Desenvolvimento de APIs REST
* TypeScript
* Node.js e Express
* PostgreSQL e Prisma
* Arquitetura e organização de código
* Autenticação e autorização
* Segurança de APIs
* Validação de dados
* Testes automatizados
* Documentação de APIs
* Integração entre frontend e backend
* Desenvolvimento de aplicações escaláveis e organizadas

---

## Desenvolvido por

**Dev Seravali**

Desenvolvedora Full Stack