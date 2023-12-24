import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SSMClient } from '@aws-sdk/client-ssm';
import { SESClient } from '@aws-sdk/client-ses';
import { S3Client } from '@aws-sdk/client-s3';
import { CloudFrontClient } from '@aws-sdk/client-cloudfront';
import { logger } from 'core/utils/logger';

const dynamoDB = new DynamoDBClient({});

export const ddb = DynamoDBDocumentClient.from(dynamoDB, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
ddb.middlewareStack.add(
  (next, context) => async (args) => {
    try {
      return await next(args);
    } catch (error) {
      logger.error(`DynamoDB Error`, {
        command: context.commandName || args.constructor.name,
        input: args.input,
        error: (error as any).message,
      });
      throw error;
    }
  },
  {
    step: 'initialize',
    name: 'ddbErrorLogger',
  },
);

export const cwLogs = new CloudWatchLogsClient();
export const ssm = new SSMClient();
export const ses = new SESClient();
export const s3 = new S3Client();
export const cloudfront = new CloudFrontClient();
