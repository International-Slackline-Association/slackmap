import { z } from 'zod';

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
export const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
);

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
  restrictionLevel: z.enum(['partial', 'full']).optional(),
  extraInfo: z.string().max(512).optional(),
  restrictionInfo: z.string().max(512).optional(),
  isMeasured: z.boolean().optional(),
});
export type CreateLinePostBody = z.infer<typeof createLineSchema>;

// export const updateTenantSchema = z.object({
//   active: z.nullable(z.boolean()).optional(),
//   name: z.string().max(256).optional(),
//   description: z.string().max(512).optional(),
// });
// export type UpdateTenantPostBody = z.infer<typeof updateTenantSchema>;

// export const updateTenantConfigurationSchema = z.object({
//   tenantDiscovery: z
//     .nullable(
//       z.object({
//         incomingIntents: z.object({
//           autoResolving: z.enum(['none', 'any']).default('none'),
//         }),
//       }),
//     )
//     .optional(),
// });
// export type UpdateTenantConfigurationPostBody = z.infer<typeof updateTenantConfigurationSchema>;
