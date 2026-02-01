import { z } from 'zod';

const recipientSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('userId'), userId: z.string() }),
  z.object({ type: z.literal('email'), email: z.string().email() }),
]);

export const sendUserMessageSchema = z.object({
  recipient: recipientSchema,
  context_url: z.string(),
  message: z.string(),
});
export type SendUserMessagePostBody = z.infer<typeof sendUserMessageSchema>;
