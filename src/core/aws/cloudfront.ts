import { CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { cloudfront } from './clients';

export const invalidateCloudfrontCache = async (distributionId: string, path: string) => {
  await cloudfront.send(
    new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        Paths: { Quantity: 1, Items: [path] },
        CallerReference: Date.now().toString(),
      },
    }),
  );
};
