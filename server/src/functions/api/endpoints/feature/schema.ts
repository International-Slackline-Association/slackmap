import { z } from 'zod';

export const deleteFeatureRequestSchema = z.object({
  reason: z.string().max(512),
});
export type DeleteFeatureRequestPostBody = z.infer<typeof deleteFeatureRequestSchema>;
