import { z } from 'zod';

export const deleteFeatureRequestSchema = z.object({
  reason: z.string().max(1024),
});
export type DeleteFeatureRequestPostBody = z.infer<typeof deleteFeatureRequestSchema>;
