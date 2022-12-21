import type { AWS } from '@serverless/typescript';
import { handlerPath } from 'core/utils/lambda';

const lambda: NonNullable<AWS['functions']>[0] = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'any',
        path: '/{proxy+}',
        cors: true,
      },
    },
  ],
  timeout: 10,
  logRetentionInDays: 90,
};

export default lambda;
