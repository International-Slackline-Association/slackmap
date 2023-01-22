import type { AWS } from '@serverless/typescript';
import { handlerPath } from 'core/utils/lambda';
import { stream } from 'winston';

const lambda: NonNullable<AWS['functions']>[0] = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      schedule: {
        // Every Monday at 2am
        rate: ['cron(0 2 ? * MON *)'],
        enabled: true,
        description: 'Slackmap data cron job to refresh geojson and editor rights',
      },
    },
  ],
  timeout: 120,
  logRetentionInDays: 90,
};

export default lambda;
