import { default as express, Express, urlencoded, json } from 'express';

import { injectCommonlyUsedHeadersMiddleware, errorMiddleware, notFoundMiddleware } from '@functions/api/middlewares';

const app = express();

const setupExpressApp = (app: Express) => {
  app.use(json());
  app.use(
    urlencoded({
      extended: true,
    }),
  );
};

const setupRoutes = (app: Express) => {
  // app.use('/user', userApi);
};

const registerStartingMiddlewares = (app: Express) => {
  app.use(injectCommonlyUsedHeadersMiddleware);
};

const registerEndingMiddlewares = (app: Express) => {
  app.use(errorMiddleware);
  app.use(notFoundMiddleware);
};

setupExpressApp(app);
registerStartingMiddlewares(app);
setupRoutes(app);
registerEndingMiddlewares(app);

export default app;
