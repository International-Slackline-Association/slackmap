import {
  errorMiddleware,
  injectCommonlyUsedHeadersMiddleware,
  notFoundMiddleware,
} from '@functions/api/middlewares';
import cors from 'cors';
import { Express, default as express, json, urlencoded } from 'express';

import { activityApi } from './endpoints/activity/api';
import { communitiesApi } from './endpoints/communities/api';
import { contactApi } from './endpoints/contact/api';
import { countryApi } from './endpoints/country/api';
import { featureApi } from './endpoints/feature/api';
import { guideApi } from './endpoints/guide/api';
import { lineApi } from './endpoints/line/api';
import { spotApi } from './endpoints/spot/api';

const app = express();

const setupExpressApp = (app: Express) => {
  app.use(json({ limit: '3mb' }));
  app.use(cors());
  app.use(
    urlencoded({
      extended: true,
      limit: '3mb',
    }),
  );
};

const setupRoutes = (app: Express) => {
  app.use('/line', lineApi);
  app.use('/spot', spotApi);
  app.use('/guide', guideApi);
  app.use('/feature', featureApi);
  app.use('/country', countryApi);
  app.use('/activity', activityApi);
  app.use('/communities', communitiesApi);
  app.use('/contact', contactApi);
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
