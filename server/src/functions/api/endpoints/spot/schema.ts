import { s3ImageUploadZodSchema } from '@functions/api/utils';
import { z } from 'zod';

export const createSpotSchema = z.object({
  geoJson: z.object({
    type: z.literal('FeatureCollection'),
    features: z.array(z.any()),
  }),
  name: z.string().max(128).optional(),
  description: z.string().max(512).optional(),
  accessInfo: z.string().max(512).optional(),
  contactInfo: z.string().max(512).optional(),
  restrictionLevel: z.enum(['partial', 'full', 'none']).optional(),
  extraInfo: z.string().max(512).optional(),
  restrictionInfo: z.string().max(512).optional(),
  images: s3ImageUploadZodSchema,
});
export type CreateSpotPostBody = z.infer<typeof createSpotSchema>;

export const updateSpotSchema = z
  .object({
    geoJson: z.object({
      type: z.literal('FeatureCollection'),
      features: z.array(z.any()),
    }),
    name: z.string().max(128).optional(),
    description: z.string().max(512).optional(),
    accessInfo: z.string().max(512).optional(),
    contactInfo: z.string().max(512).optional(),
    restrictionLevel: z.enum(['partial', 'full', 'none']).optional(),
    extraInfo: z.string().max(512).optional(),
    restrictionInfo: z.string().max(512).optional(),
    images: s3ImageUploadZodSchema,
  })
  .strict();

export type UpdateSpotPostBody = z.infer<typeof updateSpotSchema>;
