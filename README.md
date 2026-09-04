# Central de Anime
Aplicação Full Stack em desenvolvimento para uma plataforma de animes.
O projeto reúne um Front-End para interação dos usuários e um Back-End responsável pelas regras de negócio, gerenciamento de dados e comunicação com o banco de dados.
A Central de Anime representa a evolução de um projeto anterior de exploração de animes, ampliando a proposta para uma aplicação mais completa, com catálogo, usuários, autenticação, interações e acompanhamento de conteúdo.

## Status do Projeto
**Em desenvolvimento**
O Back-End está sendo desenvolvido e estruturado como uma API REST. O Front-End será implementado e integrado à API como parte da evolução do projeto.

## Arquitetura
A aplicação será organizada em duas partes principais:
```text
central-de-anime/
├── frontend/
│   └── Interface da aplicação
│
└── backend/
    ├── src/
    │   ├── controllers/
    │   ├── middlewares/
    │   ├── routes/
    │   ├── services/
    │   ├── types/
    │   ├── app.ts
    │   └── server.ts
    │
    ├── prisma/
    ├── scripts/
    ├── docker-compose.yml
    ├── package.json
    └── tsconfig.json
```

## Tecnologias
### Front-End
As tecnologias do Front-End serão adicionadas conforme a implementação da interface.

### Back-End
* Node.js
* TypeScript
* Express
* PostgreSQL
* Prisma ORM
* Docker
* Docker Compose

## Funcionalidades
A plataforma está sendo desenvolvida para oferecer recursos como:
* Catálogo de animes
* Gerenciamento de usuários
* Autenticação
* Favoritos
* Acompanhamento do progresso
* Avaliações
* Interações entre usuários
* Recursos de gamificação
* Rankings

## Evolução do Projeto
A Central de Anime está sendo construída como uma aplicação Full Stack.

A evolução do projeto segue a seguinte proposta:
**Projeto inicial de exploração de animes → API REST → Banco de dados → Regras de negócio → Front-End → Integração Full Stack → Deploy**

O objetivo é construir uma aplicação completa, permitindo colocar em prática conhecimentos de desenvolvimento Front-End e Back-End dentro de um mesmo projeto.
