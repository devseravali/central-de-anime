module.exports = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Central de Anime API',
      version: '1.0.0',
      description: `API centralizada para dados de animes.`,
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./src/routes/**/*.ts'],
};
