import type { AWS } from '@serverless/typescript';
import { handlerPath } from 'core/utils/lambda';

const lambda: NonNullable<AWS['functions']>[0] & ServerlessLogSubscriptionPluginConfig = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  logRetentionInDays: 180,
  logSubscription: false,
};

export default lambda;
