import type { AWS } from '@serverless/typescript';

export const iamResources: NonNullable<AWS['resources']>['Resources'] = {
  CognitoAuthRole: {
    Type: 'AWS::IAM::Role',
    Properties: {
      RoleName: 'slackmap_cognito_auth_role-${sls:stage}',
      Description: 'Slackmap Cognito Auth Role',
      AssumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Federated: 'cognito-identity.amazonaws.com',
            },
            Action: 'sts:AssumeRoleWithWebIdentity',
            Condition: {
              StringEquals: {
                'cognito-identity.amazonaws.com:aud':
                  'eu-central-1:60954222-4eb3-41e8-bb7b-1287ae6417b7',
              },
              'ForAnyValue:StringLike': {
                'cognito-identity.amazonaws.com:amr': 'authenticated',
              },
            },
          },
        ],
      },
      Policies: [
        {
          PolicyName: 'CognitoAuthPolicy',
          PolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: ['mobiletargeting:PutEvents'],
                Resource: [
                  'arn:aws:mobiletargeting:${aws:region}:${aws:accountId}:apps/86554d5160cf44689b2407758af5000d/*',
                ],
              },
              {
                Effect: 'Allow',
                Action: ['mobiletargeting:UpdateEndpoint'],
                Resource: [
                  'arn:aws:mobiletargeting:${aws:region}:${aws:accountId}:apps/86554d5160cf44689b2407758af5000d/*',
                ],
              },
              {
                Effect: 'Allow',
                Action: ['mobileanalytics:PutEvents', 'cognito-sync:*', 'cognito-identity:*'],
                Resource: ['*'],
              },
              {
                Action: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
                Resource: ['arn:aws:s3:::isa-tools-temporary-uploads-prod/public/*'],
                Effect: 'Allow',
              },
              {
                Condition: {
                  StringLike: {
                    's3:prefix': ['public/', 'public/*'],
                  },
                },
                Action: ['s3:ListBucket'],
                Resource: ['arn:aws:s3:::isa-tools-temporary-uploads-prod'],
                Effect: 'Allow',
              },
              {
                Effect: 'Allow',
                Action: 'rum:PutRumEvents',
                Resource: 'arn:aws:rum:${aws:region}:${aws:accountId}:appmonitor/slackmap',
              },
            ],
          },
        },
      ],
    },
  },
  CognitoUnauthRole: {
    Type: 'AWS::IAM::Role',
    Properties: {
      RoleName: 'slackmap_cognito_unauth_role-${sls:stage}',
      Description: 'Slackmap Cognito Unauth Role',
      AssumeRolePolicyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Federated: 'cognito-identity.amazonaws.com',
            },
            Action: 'sts:AssumeRoleWithWebIdentity',
            Condition: {
              StringEquals: {
                'cognito-identity.amazonaws.com:aud':
                  'eu-central-1:60954222-4eb3-41e8-bb7b-1287ae6417b7',
              },
              'ForAnyValue:StringLike': {
                'cognito-identity.amazonaws.com:amr': 'unauthenticated',
              },
            },
          },
        ],
      },
      Policies: [
        {
          PolicyName: 'CognitoUnauthPolicy',
          PolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: ['mobiletargeting:PutEvents'],
                Resource: [
                  'arn:aws:mobiletargeting:${aws:region}:${aws:accountId}:apps/86554d5160cf44689b2407758af5000d/*',
                ],
              },
              {
                Effect: 'Allow',
                Action: ['mobiletargeting:UpdateEndpoint'],
                Resource: [
                  'arn:aws:mobiletargeting:${aws:region}:${aws:accountId}:apps/86554d5160cf44689b2407758af5000d/*',
                ],
              },
              {
                Effect: 'Allow',
                Action: ['mobileanalytics:PutEvents', 'cognito-sync:*'],
                Resource: ['*'],
              },
              {
                Effect: 'Allow',
                Action: 'rum:PutRumEvents',
                Resource: 'arn:aws:rum:${aws:region}:${aws:accountId}:appmonitor/slackmap',
              },
            ],
          },
        },
      ],
    },
  },
};
