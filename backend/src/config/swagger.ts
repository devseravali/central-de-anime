import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Central de Anime API',
      version: '1.0.0',
      description: `
    API centralizada para dados de animes.

    ### Fluxo de autenticação:
    - As rotas **/admin** exigem token JWT.
    - Algumas rotas de **/usuarios/me** (listar, buscar por id, atualizar, remover) e **/usuarios/register** também exigem token.
    - Somente admin pode **adicionar**, **editar** ou **remover** qualquer entidade (animes, gêneros, estúdios, temporadas, personagens, etc).
    - As demais rotas de usuário são públicas; o fluxo do usuário depende da verificação de e-mail.
    - Para admin, faça login em **/admin/login** e use o token no **Authorize**.
    - Observação: a documentação pode não exibir o cadeado, mas a validação ocorre no backend.

     ### Login admin com Google:
     1. Envie **POST /admin/login** com o header Authorization:
       **Bearer SEU_ID_TOKEN_GOOGLE**
     2. O endpoint retorna um JWT admin
      `,
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['email', 'senha'],
          properties: {
            email: { type: 'string', example: 'admin@centralanime.com' },
            senha: { type: 'string', example: 'Admin@123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            sucesso: { type: 'boolean' },
            dados: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                usuario: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    nome: { type: 'string' },
                    role: { type: 'string', example: 'admin' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [path.resolve(__dirname, '../routes/**/*.ts')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve);
  app.get(
    '/api-docs',
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );
}
