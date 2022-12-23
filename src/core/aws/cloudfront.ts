import { cloudfront } from './clients';

export const invalidateCloudfrontCache = async (distributionId: string, path: string) => {
  await cloudfront
    .createInvalidation({
      DistributionId: distributionId,
      InvalidationBatch: {
        Paths: { Quantity: 1, Items: [path] },
        CallerReference: Date.now().toString(),
      },
    })
    .promise();
};
