import type { AWS } from '@serverless/typescript';

export const s3Resources: NonNullable<AWS['resources']>['Resources'] = {
  SlackMapApplicationDataS3Bucket: {
    Type: 'AWS::S3::Bucket',
    Properties: {
      BucketName: 'slackmap-application-data-${sls:stage}',
      CorsConfiguration: {
        CorsRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET'],
            AllowedOrigins: ['*'],
            ExposedHeaders: [],
            MaxAge: 3600,
          },
        ],
      },
    },
  },
  SlackMapImagesS3Bucket: {
    Type: 'AWS::S3::Bucket',
    Properties: {
      BucketName: 'slackmap-images-${sls:stage}',
      CorsConfiguration: {
        CorsRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET'],
            AllowedOrigins: ['*'],
            ExposedHeaders: [],
            MaxAge: 3600,
          },
        ],
      },
      VersioningConfiguration: {
        Status: 'Enabled',
      },
      LifecycleConfiguration: {
        Rules: [
          {
            Status: 'Enabled',
            NoncurrentVersionExpiration: {
              NoncurrentDays: 365,
            },
          },
        ],
      },
    },
  },

  SlackMapDataBackupBucket: {
    Type: 'AWS::S3::Bucket',
    Properties: {
      BucketName: 'slackmap-backup-data-${sls:stage}',
    },
  },
};
