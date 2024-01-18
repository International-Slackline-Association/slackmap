import api from '@functions/api/lambda';
import cronJob from '@functions/cronJob/lambda';
import ddbStreams from '@functions/ddb-streams/lambda';
import logger from '@functions/logger/lambda';
import type { AWS } from '@serverless/typescript';
import { backupResources } from 'infrastructure/backup';
import { cloudwatchResources } from 'infrastructure/cloudwatch';
import { dynamodbResources } from 'infrastructure/dynamodb';
import { iamResources } from 'infrastructure/iam';
import { s3Resources } from 'infrastructure/s3';

const serverlessConfiguration: AWS = {
  service: 'slackmap',
  frameworkVersion: '3',
  plugins: ['serverless-plugin-log-subscription', 'serverless-esbuild', 'serverless-prune-plugin'],
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    region: 'eu-central-1',
    profile: '${env:AWS_PROFILE}',
    stage: 'prod',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      SLACKMAP_TABLE_NAME: { Ref: 'SlackmapTable' },
      USERS_TABLE_NAME: { 'Fn::ImportValue': 'UsersTable-Name' },
      APPLICATION_LOG_GROUP_NAME: { Ref: 'ApplicationLogsGroup' },
      SLACKMAP_APPLICATION_DATA_S3_BUCKET: { Ref: 'SlackMapApplicationDataS3Bucket' },
      SLACKMAP_IMAGES_S3_BUCKET: { Ref: 'SlackMapImagesS3Bucket' },
      GEONAMES_API_USERNAME: '${ssm:/slackmap-geonames-api-username}',
      ISA_TOOLS_TRUSTED_SERVICE_API_KEY: '${ssm:/isa-tools-trusted-service-api-key}',
      DISABLE_STREAMS: 'false',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['dynamodb:*'],
            Resource: [
              {
                'Fn::Join': ['', [{ 'Fn::GetAtt': ['SlackmapTable', 'Arn'] }, '*']],
              },
            ],
          },
          {
            Effect: 'Allow',
            Action: ['dynamodb:Query', 'dynamodb:GetItem', 'dynamodb:BatchGetItem'],
            Resource: [
              {
                'Fn::Join': ['', [{ 'Fn::ImportValue': 'UsersTable-Arn' }, '*']],
              },
            ],
          },
          {
            Effect: 'Allow',
            Action: ['s3:*'],
            Resource: [
              {
                'Fn::Join': [
                  '',
                  [{ 'Fn::GetAtt': ['SlackMapApplicationDataS3Bucket', 'Arn'] }, '*'],
                ],
              },
            ],
          },
          {
            Effect: 'Allow',
            Action: ['s3:*'],
            Resource: [
              {
                'Fn::Join': ['', [{ 'Fn::GetAtt': ['SlackMapImagesS3Bucket', 'Arn'] }, '*']],
              },
            ],
          },
          {
            Effect: 'Allow',
            Action: ['logs:*'],
            Resource: [
              {
                'Fn::GetAtt': ['ApplicationLogsGroup', 'Arn'],
              },
            ],
          },
          {
            Effect: 'Allow',
            Action: ['ssm:GetParameters', 'ssm:GetParameter', 'ssm:GetParametersByPath'],
            Resource: [
              'arn:aws:ssm:${aws:region}:${aws:accountId}:parameter/slackmap*',
              'arn:aws:ssm:${aws:region}:${aws:accountId}:parameter/isa-tools*',
            ],
          },
          {
            Effect: 'Allow',
            Action: ['ses:VerifyEmailIdentity', 'ses:SendCustomVerificationEmail', 'ses:SendEmail'],
            Resource: '*',
          },
        ],
      },
    },
  },
  // import the function via paths
  functions: { api, logger, ddbStreams, cronJob },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node20',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    prune: {
      automatic: true,
      number: 5,
    },
    logSubscription: {
      enabled: true,
      filterPattern: '{ $.level = "*" && $.message = "*" }',
      destinationArn: {
        'Fn::GetAtt': ['LoggerLambdaFunction', 'Arn'],
      },
    },
  },
  resources: {
    Resources: {
      ...dynamodbResources,
      ...cloudwatchResources,
      ...backupResources,
      ...s3Resources,
      ...iamResources,
    },
    Outputs: {
      SlackMapImagesS3BucketArn: {
        Value: {
          'Fn::GetAtt': ['SlackMapImagesS3Bucket', 'Arn'],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
