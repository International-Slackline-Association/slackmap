import type { AWS } from '@serverless/typescript';

export const cloudwatchResources: NonNullable<AWS['resources']>['Resources'] = {
  ApplicationLogsGroup: {
    Type: 'AWS::Logs::LogGroup',
    Properties: {
      LogGroupName: 'slackmap/applicationLogs-${sls:stage}',
      RetentionInDays: 90,
    },
  },
  ApplicationLogsMetricFilter: {
    Type: 'AWS::Logs::MetricFilter',
    Properties: {
      LogGroupName: {
        Ref: 'ApplicationLogsGroup',
      },
      FilterName: 'MetricLogsFilter',
      FilterPattern: '{ $.level = "metric" }',
      MetricTransformations: [
        {
          MetricNamespace: 'Slackmap',
          MetricName: 'MetricFromLogs',
          MetricValue: '$.data.value',
          Unit: 'Count',
          Dimensions: [
            {
              Key: 'Logs',
              Value: '$.data.dimension',
            },
          ],
        },
      ],
    },
  },
  SlackmapRumAppMonitor: {
    Type: 'AWS::RUM::AppMonitor',
    Properties: {
      Name: 'slackmap',
      Domain: 'slackmap.com',
      AppMonitorConfiguration: {
        AllowCookies: false,
        GuestRoleArn: {
          'Fn::GetAtt': ['CognitoUnauthRole', 'Arn'],
        },
        IdentityPoolId: 'eu-central-1:60954222-4eb3-41e8-bb7b-1287ae6417b7',
        SessionSampleRate: 0.5,
        Telemetries: ['performance', 'errors'],
      },
      CustomEvents: {
        Status: 'ENABLED',
      },
      CwLogEnabled: false,
    },
  },
};
