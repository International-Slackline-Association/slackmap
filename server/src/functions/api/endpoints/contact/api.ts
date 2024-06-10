import { expressRoute, validateApiPayload, verifyRequestClaims } from '@functions/api/utils';
import { getUserDetails } from 'core/features/isaUser';
import { sendNewMessageEmail } from 'core/utils/email/sendMessage';
import express, { Request } from 'express';

import { SendUserMessagePostBody, sendUserMessageSchema } from './schema';

export const sendUserMessage = async (req: Request<any, any, SendUserMessagePostBody>) => {
  const requestClaims = verifyRequestClaims(req);
  const body = validateApiPayload(req.body, sendUserMessageSchema);

  const senderDetails = await getUserDetails(requestClaims.isaId, { includeEmail: true });
  const receiverDetails = await getUserDetails(body.userId, { includeEmail: true });

  if (senderDetails && receiverDetails) {
    await sendNewMessageEmail({
      from: {
        username: senderDetails.fullname,
        email: senderDetails.email!,
      },
      to: {
        email: receiverDetails.email!,
      },
      context_url: body.context_url,
      message: body.message,
    });
  }

  return {};
};

export const contactApi = express.Router();
contactApi.post('/sendUserMessage', expressRoute(sendUserMessage));
