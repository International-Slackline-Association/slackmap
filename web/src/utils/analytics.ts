import { configureAutoTrack, enable } from 'aws-amplify/analytics';
import { AwsRum, AwsRumConfig } from 'aws-rum-web';

let awsRum: AwsRum | undefined;

export const initAnalytics = () => {
  if (import.meta.env.PROD) {
    try {
      configureAutoTrack({
        enable: true,
        type: 'session',
      });
      const config: AwsRumConfig = {
        sessionSampleRate: 0.5,
        guestRoleArn: 'arn:aws:iam::387132903656:role/slackmap_cognito_unauth_role-prod',
        identityPoolId: 'eu-central-1:60954222-4eb3-41e8-bb7b-1287ae6417b7',
        endpoint: 'https://dataplane.rum.eu-central-1.amazonaws.com',
        telemetries: ['performance', 'errors'],
        allowCookies: false,
        enableXRay: false,
        disableAutoPageView: true,
      };

      const APPLICATION_ID = '5ba8a7b0-c910-4fad-b2ec-ade36ee96427';
      const APPLICATION_VERSION = __APP_VERSION__;
      const APPLICATION_REGION = 'eu-central-1';

      awsRum = new AwsRum(APPLICATION_ID, APPLICATION_VERSION, APPLICATION_REGION, config);
    } catch (error) {
      console.error(error);
      // Ignore errors thrown during CloudWatch RUM web client initialization
    }
  }
  configureAutoTrack({
    enable: true,
    type: 'session',
  });
};

export const recordAnalyticsPageView = (pageId: string) => {
  awsRum?.recordPageView({ pageId });
};

export const recordAnalyticsError = (error: Error) => {
  awsRum?.recordError(error);
};

enable;
