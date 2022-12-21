import type { AWS } from '@serverless/typescript';

export const cloudwatchResources: NonNullable<AWS['resources']>['Resources'] = {
  ApplicationLogsGroup: {
    Type: 'AWS::Logs::LogGroup',
    Properties: {
      LogGroupName: 'slackmap/applicationLogs',
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
};
