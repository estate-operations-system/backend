import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

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
        url: process.env.BACKEND_SOURCE,
      },
    ],
  },

  apis: ['src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
