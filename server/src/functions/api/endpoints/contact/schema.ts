import { z } from 'zod';

export const sendUserMessageSchema = z.object({
  userId: z.string(),
  context_url: z.string(),
  message: z.string(),
});
export type SendUserMessagePostBody = z.infer<typeof sendUserMessageSchema>;
