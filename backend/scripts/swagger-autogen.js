import swaggerJSDoc from 'swagger-jsdoc';
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Central de Anime API',
      version: '1.0.0',
      description: 'Documentação da API Central de Anime',
    },
    components: {
      schemas: {
        Resposta: {
          type: 'object',
          properties: {
            sucesso: { type: 'boolean' },
            dados: { type: 'object' },
            mensagem: { type: 'string' },
          },
        },
        Anime: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            titulo: { type: 'string' },
          },
        },
        Usuario: {
          type: 'object',
          properties: {
            // Defina os campos do usuário conforme necessário
          },
        },
        Genero: {
          type: 'object',
          properties: {},
        },
        Estudio: {
          type: 'object',
          properties: {},
        },
        Plataforma: {
          type: 'object',
          properties: {},
        },
        Tag: {
          type: 'object',
          properties: {},
        },
        Status: {
          type: 'object',
          properties: {},
        },
        Personagem: {
          type: 'object',
          properties: {},
        },
        Dados: {
          type: 'object',
          properties: {},
        },
        Estacao: {
          type: 'object',
          properties: {},
        },
        Upload: {
          type: 'object',
          properties: {},
        },
        Email: {
          type: 'object',
          properties: {},
        },
        Estatistica: {
          type: 'object',
          properties: {},
        },
        Relacao: {
          type: 'object',
          properties: {},
        },
        // Adicione outros schemas referenciados por $ref conforme necessário
      },
    },
  },
  apis: [
    path.resolve(__dirname, '../src/routes/animesRouter.ts'),
    path.resolve(__dirname, '../src/routes/tagsRouter.ts'),
    path.resolve(__dirname, '../src/routes/statusRouter.ts'),
    path.resolve(__dirname, '../src/routes/plataformasRouter.ts'),
    path.resolve(__dirname, '../src/routes/generosRouter.ts'),
    path.resolve(__dirname, '../src/routes/estudiosRouter.ts'),
    path.resolve(__dirname, '../src/routes/dadosRouter.ts'),
    path.resolve(__dirname, '../src/routes/estacoesRouter.ts'),
    path.resolve(__dirname, '../src/routes/personagensRouter.ts'),
    path.resolve(__dirname, '../src/routes/relacoesRouter.ts'),
    path.resolve(__dirname, '../src/routes/healthRouter.ts'),
    path.resolve(__dirname, '../src/routes/emailRouter.ts'),
    path.resolve(__dirname, '../src/routes/admin/adminRouter.ts'),
    path.resolve(__dirname, '../src/routes/admin/modRouter.ts'),
    path.resolve(__dirname, '../src/routes/usuarios/usuariosRouter.ts'),
    path.resolve(__dirname, '../src/routes/usuarios/sessoesRouter.ts'),
    path.resolve(__dirname, '../src/routes/uploadsRouter.ts'),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

const outputPath = path.resolve(__dirname, '../src/config/openapi.json');
writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log('openapi.json gerado com sucesso em', outputPath);
