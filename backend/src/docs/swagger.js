const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'LuccaCare API',
        version: '1.0.0',
        description: 'API para gerenciamento de rotinas e cuidados de dependentes'
    },
    servers: [
        {
        url: process.env.BASE_URL || `http://localhost:${process.env.PORT}`,
        description: 'Servidor local'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    security: [{ bearerAuth: [] }]
};

const options = {
    swaggerDefinition,
    apis: ['./src/controllers/*.js'] // vamos documentar via comentários nos controllers
};

module.exports = swaggerJSDoc(options);