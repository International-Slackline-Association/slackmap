interface ServerlessLogSubscriptionPluginConfig {
  logSubscription:
    | {
        enabled: boolean;
        filterPattern?: string;
        addLambdaPermission?: boolean;
        apiGatewayLogs?: boolean;
      }
    | boolean;
}
