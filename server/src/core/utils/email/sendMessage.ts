import { SendEmailCommand } from '@aws-sdk/client-ses';
import { ses } from 'core/aws/clients';

import { logger } from '../logger';
import newMessageHTML from './__static/newMessageHtml';

export const sendNewMessageEmail = async (params: {
  from: {
    username: string;
    email: string;
  };
  to: {
    email: string;
  };
  context_url: string;
  message: string;
}) => {
  let html = newMessageHTML.replace(/{{SENDER_NAME}}/g, params.from.username);
  html = html.replace(/{{SENDER_EMAIL}}/g, params.from.email);
  html = html.replace(/{{CONTEXT_URL}}/g, params.context_url);
  html = html.replace(/{{MESSAGE}}/g, params.message);

  logger.debug('Sending email', { params });
  await ses.send(
    new SendEmailCommand({
      Destination: {
        ToAddresses: [params.to.email],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: html,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'You have a new message on SlackMap!',
        },
      },
      ReplyToAddresses: [params.from.email],
      Source: '"SlackMap" <slackmap@slacklineinternational.org>',
    }),
  );
};
