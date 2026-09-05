import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',

    info: {
        title: 'Central de Anime API',
        version: '1.0.0',
        description: 'Documentação da API da Central de Anime',
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
    },
};

const swaggerOptions = {
    definition: swaggerDefinition,

    apis: [
        './src/routes/**/*.ts',
        './src/controllers/**/*.ts',
    ],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);