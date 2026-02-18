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
  },
  apis: [
    path.resolve(__dirname, '../src/routes/*.ts'),
    path.resolve(__dirname, '../src/routes/**/*.ts'),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

const outputPath = path.resolve(__dirname, '../src/config/openapi.json');
writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log('openapi.json gerado com sucesso em', outputPath);
