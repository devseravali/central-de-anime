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

    Todas as rotas são públicas nesta versão da API. Não há autenticação ou rotas protegidas.
      `,
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local',
      },
    ],
    components: {
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
