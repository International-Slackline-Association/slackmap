import serverlessExpress from '@vendia/serverless-express';
import { logger } from 'core/utils/logger';

import app from './app';

logger.updateMeta({ lambdaName: 'api' });
export const main = serverlessExpress({
  app,
});
