import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Estate Operations System API',
      version: '1.0.0',
      description: 'API для управления заявками и пользователями',
    },
    servers: [
      {
        url: 'http://localhost:4000',
      },
    ],
  },

  apis: ['src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
