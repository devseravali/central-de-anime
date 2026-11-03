
import swaggerJSDoc from 'swagger-jsdoc';

const isProduction = process.env.NODE_ENV === 'production';

const swaggerDefinition = {
    openapi: '3.0.0',

    info: {
        title: 'Central de Anime API',
        version: '1.0.0',
        description: 'Documentação da API da Central de Anime',
    },

    servers: [
        {
            url: isProduction
                ? process.env.RENDER_EXTERNAL_URL ?? 'https://central-de-anime.onrender.com'
                : 'http://localhost:3000',
            description: isProduction
                ? 'Servidor de produção'
                : 'Servidor local',
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
    },
};

const swaggerOptions: swaggerJSDoc.OAS3Options = {
    definition: swaggerDefinition,

    apis: [
        './src/app.ts',
        './src/routes/**/*.ts',
        './src/controllers/**/*.ts',
    ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions) as swaggerJSDoc.OAS3Definition;