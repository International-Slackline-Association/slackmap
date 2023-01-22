import { z } from 'zod';

export const createLineSchema = z.object({
  geoJson: z.object({
    type: z.literal('FeatureCollection'),
    features: z.array(z.object({}).passthrough()).nonempty(),
  }),
  type: z.enum(['waterline', 'highline', 'other']),
  name: z.string().max(128).optional(),
  description: z.string().max(128).optional(),
  length: z.number().positive().optional(),
  height: z.number().positive().optional(),
  accessInfo: z.string().max(512).optional(),
  anchorsInfo: z.string().max(512).optional(),
  gearInfo: z.string().max(512).optional(),
  contactInfo: z.string().max(512).optional(),
  restrictionLevel: z.enum(['partial', 'full', 'none']).optional(),
  extraInfo: z.string().max(512).optional(),
  restrictionInfo: z.string().max(512).optional(),
  isMeasured: z.boolean().optional(),
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
export type CreateLinePostBody = z.infer<typeof createLineSchema>;

export const updateLineSchema = z
  .object({
    geoJson: z.object({
      type: z.literal('FeatureCollection'),
      features: z.array(z.object({}).passthrough()).nonempty(),
    }),
    type: z.enum(['waterline', 'highline', 'other']),
    name: z.string().max(128).optional(),
    description: z.string().max(128).optional(),
    length: z.number().positive().optional(),
    height: z.number().positive().optional(),
    accessInfo: z.string().max(512).optional(),
    anchorsInfo: z.string().max(512).optional(),
    gearInfo: z.string().max(512).optional(),
    contactInfo: z.string().max(512).optional(),
    restrictionLevel: z.enum(['partial', 'full', 'none']).optional(),
    extraInfo: z.string().max(512).optional(),
    restrictionInfo: z.string().max(512).optional(),
    isMeasured: z.boolean().optional(),
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

export type UpdateLinePostBody = z.infer<typeof updateLineSchema>;
