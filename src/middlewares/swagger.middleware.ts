import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerConfig, swaggerOptions } from '../config/swagger';

export const setupSwagger = (app: any) => {
  if (!swaggerConfig.enabled) {
    return;
  }

  const specs = swaggerJsdoc(swaggerOptions);
  app.use(
    swaggerConfig.path,
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: swaggerConfig.title,
    }),
  );
};
