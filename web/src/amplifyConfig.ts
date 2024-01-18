import { ResourcesConfig } from 'aws-amplify';

export const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'eu-central-1_iGaYGKeyJ',
      userPoolClientId: '4f7vphq9s9ava93irhh2e7pieh',
      identityPoolId: 'eu-central-1:60954222-4eb3-41e8-bb7b-1287ae6417b7',
      allowGuestAccess: true,
      signUpVerificationMethod: 'code',
      loginWith: {
        oauth: {
          domain: 'auth.slacklineinternational.org',
          scopes: ['email', 'openid', 'aws.cognito.signin.user.admin'],
          redirectSignIn: ['http://localhost:5173', 'https://slackmap.com'],
          redirectSignOut: ['http://localhost:5173', 'https://slackmap.com'],
          responseType: 'code',
        },
      },
    },
  },
  Analytics: {
    Pinpoint: {
      appId: '86554d5160cf44689b2407758af5000d',
      region: 'eu-central-1',
    },
  },
  Storage: {
    S3: {
      bucket: 'isa-tools-temporary-uploads-prod',
      region: 'eu-central-1',
    },
  },
};
