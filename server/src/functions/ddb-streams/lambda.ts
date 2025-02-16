import type { AWS } from '@serverless/typescript';
import { handlerPath } from 'core/utils/lambda';

const lambda: NonNullable<AWS['functions']>[0] = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      stream: {
        type: 'dynamodb',
        arn: {
          'Fn::GetAtt': ['SlackmapTable', 'StreamArn'],
        },
        // batchWindow: 60,
      },
    },
  ],
  timeout: 30,
  logRetentionInDays: 180,
};

export default lambda;
