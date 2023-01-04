import { default as express, Express, urlencoded, json } from 'express';
import cors from 'cors';

import { injectCommonlyUsedHeadersMiddleware, errorMiddleware, notFoundMiddleware } from '@functions/api/middlewares';
import { lineApi } from './endpoints/line/api';
import { spotApi } from './endpoints/spot/api';

const app = express();

const setupExpressApp = (app: Express) => {
  app.use(json());
  app.use(cors());
  app.use(
    urlencoded({
      extended: true,
    }),
  );
};

const setupRoutes = (app: Express) => {
  app.use('/line', lineApi);
  app.use('/spot', spotApi);

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
