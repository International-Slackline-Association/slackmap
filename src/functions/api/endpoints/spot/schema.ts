import { z } from 'zod';

export const createSpotSchema = z.object({
  geoJson: z.object({
    type: z.literal('FeatureCollection'),
    features: z.array(z.object({}).passthrough()).nonempty(),
  }),
  name: z.string().max(128).optional(),
  description: z.string().max(128).optional(),
  accessInfo: z.string().max(512).optional(),
  contactInfo: z.string().max(512).optional(),
  restrictionLevel: z.enum(['partial', 'full', 'none']).optional(),
  extraInfo: z.string().max(512).optional(),
  restrictionInfo: z.string().max(512).optional(),
});
export type CreateSpotPostBody = z.infer<typeof createSpotSchema>;

export const updateSpotSchema = z
  .object({
    geoJson: z.object({
      type: z.literal('FeatureCollection'),
      features: z.array(z.object({}).passthrough()).nonempty(),
    }),
    name: z.string().max(128).optional(),
    description: z.string().max(128).optional(),
    accessInfo: z.string().max(512).optional(),
    contactInfo: z.string().max(512).optional(),
    restrictionLevel: z.enum(['partial', 'full', 'none']).optional(),
    extraInfo: z.string().max(512).optional(),
    restrictionInfo: z.string().max(512).optional(),
  })
  .strict();

export type UpdateSpotPostBody = z.infer<typeof updateSpotSchema>;
