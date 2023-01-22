import { z } from 'zod';

const guideTypeEnum = z.enum(['parkingLot', 'campingSpot', 'accessPath', 'riggingPath', 'other']);
export const createGuideSchema = z.object({
  geoJson: z.object({
    type: z.literal('FeatureCollection'),
    features: z.array(z.object({}).passthrough()).nonempty(),
  }),
  type: guideTypeEnum,
  description: z.string().max(512).optional(),
  images: z
    .object({
      id: z.string().max(256).optional(),
      content: z
        .string()
        .max(1024 * 1024 * 3)
        .optional(),
      isCover: z.boolean().optional(),
    })
    .array()
    .optional(),
});
export type CreateGuidePostBody = z.infer<typeof createGuideSchema>;

export const updateGuideSchema = z
  .object({
    geoJson: z.object({
      type: z.literal('FeatureCollection'),
      features: z.array(z.object({}).passthrough()).nonempty(),
    }),
    type: guideTypeEnum,
    description: z.string().max(512).optional(),
    images: z
      .object({
        id: z.string().max(256).optional(),
        content: z
          .string()
          .max(1024 * 1024 * 3)
          .optional(),
        isCover: z.boolean().optional(),
      })
      .array()
      .optional(),
  })
  .strict();

export type UpdateGuidePostBody = z.infer<typeof updateGuideSchema>;
