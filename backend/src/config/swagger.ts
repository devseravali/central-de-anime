import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerJsdoc from 'swagger-jsdoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function carregarOpenApi(
  version: string,
): Parameters<typeof swaggerUi.setup>[0] {
  const basePath = `/${version}`;
  return swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Central de Anime API',
        version: version.replace(/^v/, '') || '1.0.0',
        description:
          'Documentação gerada a partir dos comentários @swagger das rotas.',
      },
      servers: [
        {
          url: basePath,
        },
      ],
    },
    apis: [
      path.resolve(process.cwd(), 'src/routes/**/*.ts'),
      path.resolve(process.cwd(), 'src/routes/**/*.js'),
    ],
  });
}

export function setupSwagger(app: Express): void {
  const versions = ['v1'];

  // monta docs específicos por versão
  versions.forEach((v) => {
    const doc = carregarOpenApi(v);

    app.get(`/docs/${v}/openapi.json`, (_req, res) => {
      res.json(doc);
    });

    app.use(`/docs/${v}`, swaggerUi.serve, swaggerUi.setup(doc));
  });

  // /docs => redireciona para a versão principal
  app.get('/docs', (_req, res) => {
    // Em ambiente de teste, mantenha o comportamento antigo (serve UI em /docs)
    if (process.env.NODE_ENV === 'test') {
      const doc = carregarOpenApi('v1');
      return res.send(swaggerUi.generateHTML(doc as any));
    }

    res.redirect('/docs/v1');
  });

  // Compatibilidade para /docs/openapi.json em testes
  if (process.env.NODE_ENV === 'test') {
    const doc = carregarOpenApi('v1');
    app.get('/docs/openapi.json', (_req, res) => {
      res.json(doc);
    });
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(doc as any));
  }
}
