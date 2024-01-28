import { s3ImageUploadZodSchema } from '@functions/api/utils';
import { z } from 'zod';

const guideTypeEnum = z.enum([
  'parkingLot',
  'campingSpot',
  'accessPath',
  'riggingPath',
  'information',
  'other',
]);
export const createGuideSchema = z.object({
  geoJson: z.object({
    type: z.literal('FeatureCollection'),
    features: z.array(z.any()),
  }),
  type: guideTypeEnum,
  description: z.string().max(512).optional(),
  images: s3ImageUploadZodSchema,
});
export type CreateGuidePostBody = z.infer<typeof createGuideSchema>;

export const updateGuideSchema = z
  .object({
    geoJson: z.object({
      type: z.literal('FeatureCollection'),
      features: z.array(z.any()),
    }),
    type: guideTypeEnum,
    description: z.string().max(512).optional(),
    images: s3ImageUploadZodSchema,
  })
  .strict();

export type UpdateGuidePostBody = z.infer<typeof updateGuideSchema>;
