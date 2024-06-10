import { s3ImageUploadZodSchema } from '@functions/api/utils';
import { z } from 'zod';

const lineTypeSchema = z.enum([
  'waterline',
  'highline',
  'midline',
  'longline',
  'trickline',
  'rodeoline',
  'parkline',
  'other',
]);
export const createLineSchema = z
  .object({
    geoJson: z.object({
      type: z.literal('FeatureCollection'),
      features: z.array(z.any()),
    }),
    type: lineTypeSchema,
    name: z.string().max(128).optional(),
    description: z.string().max(1024).optional(),
    length: z.number().positive().optional(),
    height: z.number().positive().optional(),
    accessInfo: z.string().max(1024).optional(),
    anchorsInfo: z.string().max(1024).optional(),
    gearInfo: z.string().max(1024).optional(),
    contactInfo: z.string().max(1024).optional(),
    restrictionLevel: z.enum(['partial', 'full', 'none']).optional(),
    extraInfo: z.string().max(1024).optional(),
    restrictionInfo: z.string().max(1024).optional(),
    isMeasured: z.boolean().optional(),
    anchorImages: s3ImageUploadZodSchema,
    images: s3ImageUploadZodSchema,
  })
  .strip();
export type CreateLinePostBody = z.infer<typeof createLineSchema>;

export const updateLineSchema = z
  .object({
    geoJson: z.object({
      type: z.literal('FeatureCollection'),
      features: z.array(z.any()),
    }),
    type: lineTypeSchema,
    name: z.string().max(128).optional(),
    description: z.string().max(1024).optional(),
    length: z.number().positive().optional(),
    height: z.number().positive().optional(),
    accessInfo: z.string().max(1024).optional(),
    anchorsInfo: z.string().max(1024).optional(),
    gearInfo: z.string().max(1024).optional(),
    contactInfo: z.string().max(1024).optional(),
    restrictionLevel: z.enum(['partial', 'full', 'none']).optional(),
    extraInfo: z.string().max(1024).optional(),
    restrictionInfo: z.string().max(1024).optional(),
    isMeasured: z.boolean().optional(),
    anchorImages: s3ImageUploadZodSchema,
    images: s3ImageUploadZodSchema,
  })
  .strip();

export type UpdateLinePostBody = z.infer<typeof updateLineSchema>;
